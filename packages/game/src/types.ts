export interface ICommand {
  command?: string
  output?: string
  error?: string
  pwd?: string
}

export interface ICondition {
  command?: string
  output?: string
  error?: string
  pwd?: string
  or?: ICondition[]
  not?: ICondition
  files?: FileExistenceInput[]
}

export enum FileType {
  FILE = 'file',
  FOLDER = 'folder',
}

export interface FileInput {
  path: string
  type: FileType
}

export interface FileExistenceInput extends FileInput {
  exists: boolean
}

export interface IFileExistenceChecker {
  exists(file: FileInput): Promise<boolean>
}

export interface IStage {
  id: string
  name?: string
  requirements?: string[]
  condition: ICondition
}

export interface ISession {
  completedStages: string[]
}
