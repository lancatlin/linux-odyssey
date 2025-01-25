import fs from 'fs/promises'
import express from 'express'
import http from 'http'
import YAML from 'yaml'
import swaggerUI from 'swagger-ui-express'
import passport from 'passport'
import connectDB from '@linux-odyssey/models'

import './auth/passport.js'
import socketServer from './api/socket.js'
import apiRouter from './api/routes/index.js'
import { loadAndUpdateQuests } from './utils/quest.js'
import config from './config.js'
import errorHandler from './middleware/error.js'
import { globalRateLimit } from './middleware/rateLimiter.js'
import sessionMiddleware from './middleware/session.js'
import expiryRemovalScheduler from './containers/expiryChecker.js'
import setupTest from './utils/setupTest.js'
import logger from './utils/logger.js'

async function main() {
  if (!config.secret) {
    logger.error(
      'No SECRET_KEY found in .env! To set up a persistent key, please run `yarn setup`:'
    )
    process.exit(1)
  }

  try {
    await connectDB(config.db)
    logger.info('Connected to MongoDB')
  } catch (err) {
    logger.error(err)
    process.exit(1)
  }

  if (config.testing.enabled) {
    await setupTest()
  }

  try {
    await loadAndUpdateQuests()
  } catch (err) {
    logger.error('Failed to load quests', err)
    return
  }
  expiryRemovalScheduler()
  const file = await fs.readFile('./swagger.yaml', 'utf8')
  const swaggerDocument = YAML.parse(file)

  const app = express()
  const server = http.createServer(app)
  socketServer(server)
  app.set('trust proxy', [
    'loopback',
    'linklocal',
    'uniquelocal',
    ...config.trustedProxies,
  ])
  logger.info('Trusted proxies:', config.trustedProxies)
  app.use(globalRateLimit)
  app.use(sessionMiddleware)
  app.use(passport.session())
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
  app.use(express.json())

  app.get('/', (req, res) => {
    res.send('Hello World!')
  })

  app.use('/api/v1', apiRouter)
  app.use(errorHandler)

  server.listen(config.port, '0.0.0.0', () => {
    logger.info(`Server listening at ${config.baseUrl}`)
  })
}

main().catch((err) => logger.error(err))
