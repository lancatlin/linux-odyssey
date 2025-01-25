import { matchedData } from 'express-validator'
import type { Express, Request, Response } from 'express'
import { User, Session, ISession } from '@linux-odyssey/models'
import {
  createNewSession,
  isQuestUnlocked,
} from '../../models/sessionManager.js'
import { asyncHandler } from '../../middleware/error.js'
import config from '../../config.js'

function sessionSummary(session: ISession) {
  return {
    _id: session._id,
    user: session.user,
    quest: session.quest,
    status: session.status,
    createdAt: session.createdAt,
    lastActivityAt: session.lastActivityAt,
  }
}

function sessionDetail(session: ISession) {
  return {
    ...sessionSummary(session),
    hints: session.hints,
    tasks: session.tasks,
    responses: session.responses,
    graph: session.graph,
  }
}

export const getSessionList = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as Express.ExistingUser
    const { questId, status } = matchedData(req)
    const query = { user: user.id, quest: questId, status }
    const sessions = await Session.find(query)
    res.json(sessions.map(sessionSummary))
  }
)

export const createSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { questId } = matchedData(req)
    const user = await User.findById((req.user as Express.ExistingUser).id)
    if (
      user &&
      ((await isQuestUnlocked(user, questId)) || config.testing.enabled)
    ) {
      const session = await createNewSession(user, questId)
      res.status(201).json(sessionDetail(session))
    } else {
      res.status(403).json({ message: 'Quest is locked.' })
    }
  }
)

export const getSessionById = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId } = matchedData(req)
    const session = await Session.findOne({
      _id: sessionId,
      user: (req.user as Express.ExistingUser).id,
    })

    if (!session) {
      res.status(404).json({ message: 'Session not found.' })
      return
    }
    console.log("gkwrlngklgwrklg"); 
    res.json(sessionDetail(session))
  }
)

export const getActiveSessionHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const { questId } = matchedData(req)
    const user = await User.findById((req.user as Express.ExistingUser).id)
    if (
      user &&
      ((await isQuestUnlocked(user, questId)) || config.testing.enabled)
    ) {
      const session = await Session.findOne({
        user: user.id,
        quest: questId,
        status: 'active',
      })
      res.json(session ? sessionDetail(session) : null)
    } else {
      res.status(403).json({ message: 'Quest is locked.' })
    }
  }
)
