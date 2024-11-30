import { test, expect } from '@jest/globals'
import { Stage } from '../src/Stage'
import { FileType } from '../src/types'
import { MockFileChecker } from './asyncCondition.test'
import { Session } from '../src/Session'

const checker = new MockFileChecker()

test('check stage condition', async () => {
  const stage = new Stage({
    id: 'stage1',
    name: 'List the files using `ls`',
    condition: {
      command: 'ls',
      pwd: '/home/user',
    },
  })
  expect(
    await stage.satisfies(
      {
        command: 'ls',
        pwd: '/home/user',
      },
      checker
    )
  ).toBe(true)
  expect(
    await stage.satisfies(
      {
        command: 'ls',
        pwd: '/home/user/Downloads',
      },
      checker
    )
  ).toBe(false)
})

test('check stage with async condition truthy', async () => {
  const stage = new Stage({
    id: 'stage1',
    name: 'Create file',
    condition: {
      files: [
        {
          path: '/home/user/hello.txt',
          type: FileType.FILE,
          exists: true,
        },
      ],
    },
  })
  expect(await stage.satisfies({}, checker)).toBe(true)
})

test('check stage with async condition falsy', async () => {
  const stage = new Stage({
    id: 'stage1',
    name: 'Create file',
    condition: {
      files: [
        {
          path: '/home/user/not-exists.txt',
          type: FileType.FILE,
          exists: true,
        },
      ],
    },
  })
  expect(await stage.satisfies({}, checker)).toBe(false)
})

test('stage active checks', () => {
  const session = new Session({
    completedStages: ['stage1'],
  })
  const stage3 = new Stage({
    id: 'stage3',
    requirements: ['stage1', 'stage2'],
    condition: {},
  })
  expect(stage3.active(session)).toBe(false)

  session.complete('stage2')
  expect(stage3.active(session)).toBe(true)

  session.complete('stage3')
  expect(stage3.active(session)).toBe(false)
})
