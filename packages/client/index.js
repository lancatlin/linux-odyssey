/* eslint-disable no-underscore-dangle */
import axios from 'axios'
import { stdin, stdout, exit } from 'process'
import { io } from 'socket.io-client'
import { program } from 'commander'

let api = null

function get(key, defaultValue) {
  const value = process.env[key]
  if (value != null) {
    return value
  }
  return defaultValue
}
stdin.setRawMode(true)
stdin.resume()
stdin.setEncoding('utf8')

function debug(...args) {
  if (program.opts().debug) {
    console.debug(...args)
  }
}

async function createSession() {
  console.log('Creating a new session...')
  const res = await api.post('/sessions', {
    quest_id: 'helloworld',
  })
  const { data } = await res
  if (!data._id) {
    console.error(data)
    exit(1)
  }
  console.log('Created Session ID:', data._id)
  return data
}

async function getSessionList() {
  const res = await api.get('/sessions')
  return res.data
}

async function lastSession() {
  const sessions = await getSessionList()
  if (sessions.length === 0) {
    console.log(
      'No session found. Please use --create to create a new session.'
    )
    exit(1)
  }
  const session = sessions[sessions.length - 1]
  console.log(
    `Last Session ID: ${session._id}, Quest: ${session.quest}, Created At: ${session.createdAt}`
  )
  return session
}

async function connect(sessionId) {
  console.log(`Session ID: ${sessionId}`)
  console.log('Use Ctrl + D to exit.')
  if (!sessionId) exit()

  const socket = io(program.opts().host, {
    query: {
      session_id: sessionId,
    },
  })

  socket.on('open', function open() {
    console.log('Connected to the server.')
  })

  socket.on('message', console.log)

  socket.on('terminal', function incoming(data) {
    stdout.write(data)
  })

  socket.on('hint', (data) => {
    console.log('receive hint:')
    console.log(data)
  })

  socket.on('graph', (data) => {
    debug('receive graph:', data)
  })

  socket.on('tasks', (data) => {
    debug('receive tasks:', data)
  })

  socket.on('close', function close() {
    console.log('Disconnected from the server.')
    exit()
  })

  stdin.on('data', (key) => {
    if (key === '\u0004') {
      socket.close()
      exit()
    } else {
      socket.emit('terminal', key)
    }
  })
}

async function main() {
  api = axios.create({
    baseURL: `${program.opts().host}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log(program.opts().session)
  // main()

  const sessionId =
    program.opts().session ||
    (program.opts().create ? (await createSession())._id : null) ||
    (await lastSession())._id

  await connect(sessionId)
}

program
  .option('-s, --session <string>', 'Session ID')
  .option('-c, --create', 'Create a new session')
  .option('-d, --debug', 'Debug mode')
  .option(
    '-h, --host <string>',
    'Server host',
    get('API_ENDPOINT', 'http://localhost:3000')
  )
  .action(main)

program
  .command('list')
  .description('List all sessions')
  .action(async () => {
    const sessions = await getSessionList()
    sessions.forEach(({ _id, quest, createdAt }) => {
      console.log(`${_id} ${quest} ${createdAt}`)
    })
    exit()
  })

program.parse()
