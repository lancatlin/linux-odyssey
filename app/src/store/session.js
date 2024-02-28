import { reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { FileGraph } from '@linux-odyssey/file-graph'
import api from '../utils/api'
import Socket from '../utils/socket'
import SocketTerminal from '../utils/terminal'
import { LoadQuestError, LoadSessionError } from '../utils/errors'

const toast = useToast()

function newSession() {
  const graph = new FileGraph({
    path: '/',
    type: 'folder',
    discovered: false,
  })
  return {
    status: 'inactive',
    graph,
    pwd: '',
    hints: [],
    tasks: [],
    responses: [],
  }
}

const store = reactive({
  session: newSession(),
  questId: '',
  quest: null,
})

const socket = new Socket()
const term = new SocketTerminal(40, 80)

function setQuest(questId) {
  return api.get(`/quests/${questId}`).then((res) => {
    store.questId = res.data._id
    store.quest = res.data
  })
}

async function setSession(session) {
  try {
    console.log('Setting session...', session)
    store.session = session
    store.session.graph = new FileGraph(session.graph)
    term.reset()
    await socket.connect(session)
    term.focus()
  } catch (err) {
    console.error(err)
    toast.error(err.message)
    throw err
  }
}

export async function createSession() {
  try {
    console.log('Creating a new session...')
    const res = await api.post('/sessions', { questId: store.questId })
    const { data } = res
    await setSession(data)
  } catch (err) {
    console.error(err)
    toast.error('Failed to create a new session. Please try again later.')
  }
}

async function getActiveSession(questId) {
  try {
    const res = await api.post('/sessions/active', { questId })
    await setSession(res.data)
  } catch (err) {
    console.error(err)
    toast.warning('Failed to connect previous session. Creating a new one...')
    await createSession()
  }
}

function updateGraph(event) {
  if (event.discover) {
    store.session.graph.discover(event.discover)
  }
  if (event.pwd) {
    store.session.pwd = event.pwd
  }
}

function newResponse(response) {
  console.log('newResponse', response, 'session', store.session)
  store.session.responses.push(response.responses)
  store.session.hints.push(response.hints)
  store.session.tasks = response.tasks
  store.session.status = response.status
}

export function useTerminal() {
  return term
}

export function reset() {
  socket.reset()
  term.reset()
  store.session = newSession()
  store.quest = null
}

export async function init(questId) {
  if (!questId) throw new Error('No quest ID provided')
  reset()
  try {
    await setQuest(questId)
  } catch (err) {
    console.error(err)
    throw new LoadQuestError('Failed to load quest', questId)
  }
  try {
    await getActiveSession(questId)
  } catch (err) {
    console.error(err)
    throw new LoadSessionError('Failed to load session', questId)
  }
}

function setup() {
  socket.on('terminal', (data) => {
    term.write(data)
  })
  term.onData((data) => {
    socket.emit('terminal', data)
  })
  socket.on('graph', (event) => {
    updateGraph(event)
  })
  socket.on('response', (response) => {
    newResponse(response)
  })
}

setup()

export default store
