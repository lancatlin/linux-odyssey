import { ICommand } from '../types.js'

export interface Matcher {
  match(command: ICommand): boolean
}
