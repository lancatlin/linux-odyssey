import { FileExistenceInput, IFileExistenceChecker } from '../types'

export async function checkFiles(
  checker: IFileExistenceChecker,
  files: FileExistenceInput[]
) {
  const existences = await Promise.all(
    files.map((file) => checker.exists(file))
  )
  return existences.every((exists, index) => exists === files[index].exists)
}
