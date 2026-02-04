/**
 * EPUBGenerator - مولد ملفات EPUB
 * 
 * إنشاء كتب إلكترونية متوافقة مع:
 * - Kindle
 * - Apple Books
 * - Google Play Books
 * - جميع القارئات الإلكترونية
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class EPUBGenerator {
  constructor() {
    this.defaultOptions = {
      language: 'ar',
      direction: 'rtl',
      publisher: 'Shadow Seven Publishing',
      includeTableOfContents: true,
      includeCover: true
    };
  }

  /**
   * توليد EPUB
   */
  async generate(manuscript, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const zip = new JSZip();
      
      // 1. mimetype (بدون compression)
      zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
      
      // 2. META-INF/container.xml
      zip.folder('META-INF').file('container.xml', this._generateContainer());
      
      // 3. OEBPS folder
      const oebps = zip.folder('OEBPS');
      
      // 4. content.opf (metadata + manifest + spine)
      oebps.file('content.opf', this._generateContentOPF(manuscript, config));
      
      // 5. toc.ncx (table of contents navigation)
      oebps.file('toc.ncx', this._generateTOC(manuscript, config));
      
      // 6. nav.xhtml (EPUB 3 navigation)
      oebps.file('nav.xhtml', this._generateNav(manuscript, config));
      
      // 7. stylesheet
      oebps.file('styles.css', this._generateCSS(config));
      
      // 8. cover (إذا كان متوفر)
      if (config.includeCover && manuscript.coverImage) {
        oebps.file('cover.jpg', manuscript.coverImage);
        oebps.file('cover.xhtml', this._generateCoverPage());
      }
      
      // 9. chapters (content files)
      const chapters = manuscript.chapters || this._splitIntoChapters(manuscript.content);
      chapters.forEach((chapter, index) => {
        oebps.file(`chapter${index + 1}.xhtml`, this._generateChapterXHTML(chapter, index + 1, config));
      });
      
      // توليد الـ ZIP
      const epubBlob = await zip.generateAsync({ 
        type: 'blob',
        mimeType: 'application/epub+zip'
      });
      
      return {
        blob: epubBlob,
        filename: `${manuscript.title || 'book'}.epub`,
        size: epubBlob.size
      };
      
    } catch (error) {
      console.error('EPUB Generation Error:', error);
      throw new Error(`Failed to generate EPUB: ${error.message}`);
    }
  }

  /**
   * توليد container.xml
   */
  _generateContainer() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  }

  /**
   * توليد content.opf
   */
  _generateContentOPF(manuscript, config) {
    const title = this._escapeXML(manuscript.title || 'Untitled');
    const author = this._escapeXML(manuscript.author || 'Unknown');
    const language = config.language;
    const publisher = config.publisher;
    const date = new Date().toISOString().split('T')[0];
    const uuid = `urn:uuid:${this._generateUUID()}`;
    
    const chapters = manuscript.chapters || this._splitIntoChapters(manuscript.content);
    
    // Manifest items
    let manifestItems = `
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>`;
    
    if (config.includeCover && manuscript.coverImage) {
      manifestItems += `
    <item id="cover-image" href="cover.jpg" media-type="image/jpeg"/>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`;
    }
    
    chapters.forEach((ch, i) => {
      manifestItems += `
    <item id="chapter${i + 1}" href="chapter${i + 1}.xhtml" media-type="application/xhtml+xml"/>`;
    });
    
    // Spine itemrefs
    let spineItems = config.includeCover ? '<itemref idref="cover"/>' : '';
    chapters.forEach((ch, i) => {
      spineItems += `
    <itemref idref="chapter${i + 1}"/>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uuid" xml:lang="${language}" dir="${config.direction}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uuid">${uuid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:creator>${author}</dc:creator>
    <dc:language>${language}</dc:language>
    <dc:publisher>${publisher}</dc:publisher>
    <dc:date>${date}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>${manifestItems}
  </manifest>
  <spine toc="ncx">${spineItems}
  </spine>
</package>`;
  }

  /**
   * توليد toc.ncx
   */
  _generateTOC(manuscript) {
    const title = this._escapeXML(manuscript.title || 'Untitled');
    const chapters = manuscript.chapters || this._splitIntoChapters(manuscript.content);
    
    let navPoints = '';
    chapters.forEach((chapter, index) => {
      const chapterTitle = this._escapeXML(chapter.title || `الفصل ${index + 1}`);
      navPoints += `
    <navPoint id="chapter${index + 1}" playOrder="${index + 1}">
      <navLabel>
        <text>${chapterTitle}</text>
      </navLabel>
      <content src="chapter${index + 1}.xhtml"/>
    </navPoint>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${this._generateUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${title}</text>
  </docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`;
  }

  /**
   * توليد nav.xhtml (EPUB 3)
   */
  _generateNav(manuscript, config) {
    const title = this._escapeXML(manuscript.title || 'Untitled');
    const chapters = manuscript.chapters || this._splitIntoChapters(manuscript.content);
    
    let navItems = '';
    chapters.forEach((chapter, index) => {
      const chapterTitle = this._escapeXML(chapter.title || `الفصل ${index + 1}`);
      navItems += `
        <li><a href="chapter${index + 1}.xhtml">${chapterTitle}</a></li>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${config.language}" dir="${config.direction}">
<head>
  <meta charset="UTF-8"/>
  <title>${title} - Navigation</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>الفهرس</h1>
    <ol>${navItems}
    </ol>
  </nav>
</body>
</html>`;
  }

  /**
   * توليد CSS
   */
  _generateCSS(config) {
    return `@charset "UTF-8";

body {
  font-family: 'Arial', 'Noto Kufi Arabic', sans-serif;
  direction: ${config.direction};
  text-align: ${config.direction === 'rtl' ? 'right' : 'left'};
  line-height: 1.6;
  margin: 1em;
}

h1, h2, h3 {
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

h1 { font-size: 1.8em; }
h2 { font-size: 1.5em; }
h3 { font-size: 1.2em; }

p {
  margin: 0.5em 0;
  text-indent: 1.5em;
}

.chapter-title {
  font-size: 2em;
  font-weight: bold;
  text-align: center;
  margin: 2em 0;
}

.cover {
  text-align: center;
  margin: 0;
  padding: 0;
}

.cover img {
  max-width: 100%;
  height: auto;
}`;
  }

  /**
   * توليد صفحة الغلاف
   */
  _generateCoverPage() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <title>Cover</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <div class="cover">
    <img src="cover.jpg" alt="Cover"/>
  </div>
</body>
</html>`;
  }

  /**
   * توليد فصل XHTML
   */
  _generateChapterXHTML(chapter, chapterNumber, config) {
    const title = this._escapeXML(chapter.title || `الفصل ${chapterNumber}`);
    const content = this._formatContent(chapter.content || chapter);
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${config.language}" dir="${config.direction}">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <h1 class="chapter-title">${title}</h1>
  ${content}
</body>
</html>`;
  }

  /**
   * تنسيق المحتوى
   */
  _formatContent(text) {
    return text
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `  <p>${this._escapeXML(p.trim())}</p>`)
      .join('\n');
  }

  /**
   * تقسيم النص إلى فصول
   */
  _splitIntoChapters(content) {
    // تقسيم بسيط بناءً على الفقرات (يمكن تحسينه)
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const chapterSize = Math.ceil(paragraphs.length / 10);
    
    const chapters = [];
    for (let i = 0; i < paragraphs.length; i += chapterSize) {
      chapters.push({
        title: `الفصل ${Math.floor(i / chapterSize) + 1}`,
        content: paragraphs.slice(i, i + chapterSize).join('\n\n')
      });
    }
    
    return chapters;
  }

  /**
   * Escape XML characters
   */
  _escapeXML(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * توليد UUID
   */
  _generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * تنزيل EPUB
   */
  download(blob, filename) {
    saveAs(blob, filename);
  }
}

export default EPUBGenerator;
