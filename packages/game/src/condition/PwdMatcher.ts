import { ICommand } from '../types.js'
import { Matcher } from './Matcher.js'

export class PwdMatcher implements Matcher {
  constructor(private pwd: string) {}

  match(command: ICommand): boolean {
    return command.pwd === this.pwd
  }
}
