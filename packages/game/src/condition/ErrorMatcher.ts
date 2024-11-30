import { Matcher } from './Matcher.js'
import { ICommand } from '../types.js'

export class ErrorMatcher implements Matcher {
  private matcher?: RegExp
  constructor(errorPattern?: string) {
    if (errorPattern) {
      this.matcher = new RegExp(errorPattern)
    }
  }

  match(command: ICommand): boolean {
    if (!this.matcher) {
      return !command.error
    }
    return this.matcher.test(command.error || '')
  }
}
