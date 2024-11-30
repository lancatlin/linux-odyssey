import { IStage, ICommand, IFileExistenceChecker, ISession } from './types'
import { Condition } from './condition/Condition'

export class Stage {
  id: string
  name: string
  private condition: Condition
  private requirements: string[]

  constructor({ id, name, condition, requirements }: IStage) {
    this.id = id
    this.name = name || ''
    this.condition = new Condition(condition)
    this.requirements = requirements || []
  }

  async satisfies(
    command: ICommand,
    checker: IFileExistenceChecker
  ): Promise<boolean> {
    return this.condition.match(command) && this.condition.check(checker)
  }

  private checkRequirements(session: ISession): boolean {
    return this.requirements.every((req) =>
      session.completedStages.includes(req)
    )
  }

  private finished(session: ISession): boolean {
    return session.completedStages.includes(this.id)
  }

  active(session: ISession): boolean {
    return !this.finished(session) && this.checkRequirements(session)
  }
}
