import { model, Schema, Types } from 'mongoose'

import { IResponse, responseSchema } from './response.js'

export interface INode {
  path: string
  type: string
  discovered: boolean
  children?: INode[]
}

const nodeSchema = new Schema<INode>({
  path: String,
  type: String,
  discovered: {
    type: Boolean,
    default: false,
  },
})

nodeSchema.add({
  children: [nodeSchema],
})

export interface ITask {
  id: string
  name: string
  completed: boolean
}

const taskSchema = new Schema<ITask>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
})

export interface ISession {
  _id: Types.ObjectId
  user: Types.ObjectId
  quest: string
  containerId: string | null
  status: 'active' | 'finished' | 'inactive'
  createdAt: Date
  updatedAt: Date
  finishedAt?: Date
  lastActivityAt: Date
  tasks: ITask[]
  hints: string[][]
  responses: IResponse[][]
  graph: INode
}

export const Session = model<ISession>(
  'Session',
  new Schema<ISession>(
    {
      user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true,
      },
      quest: {
        type: String,
        ref: 'Quest',
        required: true,
      },
      containerId: String,
      status: {
        type: String,
        enum: ['active', 'finished', 'inactive'],
        required: true,
        default: 'active',
      },
      finishedAt: Date,
      lastActivityAt: {
        type: Date,
        default: Date.now,
        required: true,
      },
      tasks: [taskSchema],
      hints: [[String]],
      responses: {
        type: [[responseSchema]],
        required: true,
        default: [],
      },
      graph: {
        type: nodeSchema,
        default: {
          path: '/',
          type: 'folder',
        },
      },
    },
    { timestamps: true }
  )
)
