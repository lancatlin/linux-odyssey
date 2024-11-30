import { ICommand } from '../types.js'
import { Matcher } from './Matcher.js'

export class NotMatcher implements Matcher {
  constructor(private condition: Matcher) {}

  match(command: ICommand): boolean {
    return !this.condition.match(command)
  }
}
