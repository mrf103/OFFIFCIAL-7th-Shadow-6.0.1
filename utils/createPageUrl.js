export function createPageUrl(pageName) {
  const routes = {
    Dashboard: '/',
    Manuscripts: '/manuscripts',
    Upload: '/upload',
    EliteEditor: '/elite-editor',
    BookMerger: '/book-merger',
    SeriesSplitter: '/series-splitter',
    CoverDesigner: '/cover-designer',
    ComplianceEngine: '/compliance-engine',
    Settings: '/settings',
  }
  
  return routes[pageName] || '/'
}
