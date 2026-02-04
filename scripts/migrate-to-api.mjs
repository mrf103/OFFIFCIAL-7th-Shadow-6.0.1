/**
 * سكريبت لاستبدال base44 بـ api في جميع الملفات
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const replacements = [
  {
    from: /import { base44 } from "@\/api\/base44Client"/g,
    to: 'import { api } from "@/api"'
  },
  {
    from: /import { base44 } from '@\/api\/base44Client'/g,
    to: "import { api } from '@/api'"
  },
  {
    from: /base44\./g,
    to: 'api.'
  }
]

const ignoreDirs = ['node_modules', 'dist', '.git', 'scripts']
const targetExtensions = ['.js', '.jsx', '.ts', '.tsx']

async function findFiles(dir, files = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory() && !ignoreDirs.includes(entry.name)) {
      await findFiles(fullPath, files)
    } else if (entry.isFile() && targetExtensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath)
    }
  }
  
  return files
}

async function replaceInFile(filePath) {
  let content = await fs.readFile(filePath, 'utf-8')
  let modified = false
  
  for (const { from, to } of replacements) {
    if (from.test(content)) {
      content = content.replace(from, to)
      modified = true
    }
  }
  
  if (modified) {
    await fs.writeFile(filePath, content, 'utf-8')
    console.log(`✅ Updated: ${path.relative(rootDir, filePath)}`)
    return true
  }
  
  return false
}

async function main() {
  console.log('🔍 Searching for files to update...\n')
  
  const files = await findFiles(rootDir)
  const targetFiles = files.filter(f => 
    !f.includes('base44Client') && 
    !f.includes('scripts/') &&
    !f.includes('api/index.js')
  )
  
  console.log(`Found ${targetFiles.length} files to check\n`)
  
  let updatedCount = 0
  
  for (const file of targetFiles) {
    if (await replaceInFile(file)) {
      updatedCount++
    }
  }
  
  console.log(`\n✨ Done! Updated ${updatedCount} files`)
}

main().catch(console.error)
