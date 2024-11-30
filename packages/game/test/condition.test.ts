import { test, expect } from '@jest/globals'
import { Condition } from '../src/condition/Condition'
import { OutputMatcher } from '../src/condition/OutputMatcher'
import { PwdMatcher } from '../src/condition/PwdMatcher'
import { CommandMatcher } from '../src/condition/CommandMatcher'
import { ErrorMatcher } from '../src/condition/ErrorMatcher.js'
import { conditionSchema } from '../src/schema'

test('command match', () => {
  const matcher = new CommandMatcher('^echo start$')
  expect(matcher.match({ command: 'echo start' })).toBe(true)
  expect(matcher.match({ command: 'echo start1' })).toBe(false)
  // Currently not supported
  expect(matcher.match({ command: 'echo "start"' })).toBe(false)
})

test('error matcher', () => {
  const matcher = new ErrorMatcher()
  expect(matcher.match({ error: '' })).toBe(true)
  expect(matcher.match({ error: 'permission denied' })).toBe(false)
})

test('error matcher with specific error', () => {
  const matcher = new ErrorMatcher('permission denied')
  expect(matcher.match({ error: '' })).toBe(false)
  expect(matcher.match({ error: 'file not found' })).toBe(false)
  expect(matcher.match({ error: 'cannot open files: permission denied' })).toBe(
    true
  )
})

test('pwd matcher', () => {
  const matcher = new PwdMatcher('/home/user')
  expect(matcher.match({ pwd: '/home/user' })).toBe(true)
  expect(matcher.match({ pwd: '/home/user1' })).toBe(false)
  expect(matcher.match({ pwd: '/home/user/anotherpath' })).toBe(false)
  expect(matcher.match({ pwd: '/var/home/user' })).toBe(false)
})

test('output matcher', () => {
  const matcher = new OutputMatcher('^start$')
  expect(matcher.match({ output: 'start' })).toBe(true)
  expect(matcher.match({ output: 'start1' })).toBe(false)
  expect(matcher.match({ output: 'start\n' })).toBe(true)
})

test('condition match command', () => {
  const condition = new Condition({
    command: '^echo start$',
  })

  expect(
    condition.match({
      command: 'echo start',
    })
  ).toBe(true)
  expect(
    condition.match({
      command: 'echo hello',
    })
  ).toBe(false)
  expect(
    condition.match({ command: 'echo start', error: 'permission denied' })
  ).toBe(false)
})

test('condition with OR', () => {
  const condition = new Condition({
    or: [{ command: '^echo start$' }, { command: '^echo hello$' }],
  })
  expect(condition.match({ command: 'echo start' })).toBe(true)
  expect(condition.match({ command: 'echo hello' })).toBe(true)
  expect(condition.match({ command: 'echo start1' })).toBe(false)
})

test('condition with NOT', () => {
  const condition = new Condition({
    not: { command: '^echo start$' },
  })

  expect(condition.match({ command: 'echo start' })).toBe(false)
  expect(condition.match({ command: 'echo hello' })).toBe(true)
})

it('should parse condition', () => {
  const condition = {
    command: 'echo start',
    output: 'start',
    not: {
      pwd: '/home/user',
    },
  }
  expect(conditionSchema.safeParse(condition).error).toBeUndefined()
})
