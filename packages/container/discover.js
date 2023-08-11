const fs = require('fs').promises
const path = require('path')

async function collectFilesInfo(inputPath, level = 0) {
  const stats = await fs.stat(inputPath)
  const discovered = level === 0
  const name = path.basename(inputPath)
  const files = [
    {
      path: inputPath,
      name,
      type: stats.isDirectory() ? 'folder' : 'file',
      discovered,
    },
  ]
  if (stats.isDirectory() && level < 2) {
    try {
      let entries = await fs.readdir(inputPath)
      if (level > 0) {
        entries = entries.slice(0, 5)
      }
      const result = await Promise.all(
        entries.map((entry) =>
          collectFilesInfo(path.join(inputPath, entry), level + 1)
        )
      )
      files.push(...result.flat())
    } catch (err) {
      // ignore
    }
  }
  return files
}

async function discoverFiles(argv) {
  const targetPath = argv._.length < 2 ? ['.'] : argv._.slice(1)
  const result = await Promise.all(
    targetPath.map((p) => path.resolve(process.cwd(), p)).map(collectFilesInfo)
  )
  return { discover: result.flat() }
}

module.exports = discoverFiles
