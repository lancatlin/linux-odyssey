import { ISession } from './types'

export class Session implements ISession {
  private completed: string[] = []

  constructor({ completedStages }: ISession) {
    this.completed = completedStages
  }

  get completedStages() {
    return this.completed
  }

  complete(stageId: string) {
    this.completed.push(stageId)
  }
}
