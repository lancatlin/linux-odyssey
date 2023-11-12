import Docker from 'dockerode'
import config from '../config.js'

const engine = new Docker()

const containerOptions = {
  Image: 'lancatlin/linux-odyssey:helloworld',
  AttachStdin: true,
  AttachStdout: true,
  AttachStderr: true,
  Tty: true,
  OpenStdin: true,
  StdinOnce: false,
  HostConfig: {
    NetworkMode: config.dockerNetwork,
    Binds:
      !config.isProduction && config.hostPwd
        ? [
            `${config.hostPwd}/quests/helloworld/home:/home/commander`,
            `${config.hostPwd}/packages/container:/usr/local/lib/container`,
          ]
        : [],
  },
}

// const network = engine.getNetwork(config.dockerNetwork)

export function createContainer(name) {
  return engine.createContainer({
    ...containerOptions,
    name,
  })
}

export async function getAndStartContainer(id) {
  console.log(`Getting container: ${id}`)
  const container = engine.getContainer(id)
  if (!container) {
    throw new Error(`Container ${id} not found`)
  }
  if (!(await container.inspect()).State.Running) {
    await container.start()
  }
  return container
}

export async function attachContainer(container, { token }) {
  // Create an exec instance with bash shell
  const exec = await container.exec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Cmd: ['/bin/zsh'],
    Tty: true,
    Env: [
      `TOKEN=${token}`,
      `API_ENDPOINT=http://backend:3000`,
      'ZDOTDIR=/etc/zsh',
    ],
  })

  const execOutput = await exec.start({
    Detach: false,
    Tty: true,
  })

  return execOutput
}

export async function deleteContainer(id) {
  const container = engine.getContainer(id)
  if (!container) {
    return
  }
  try {
    await container.stop()
  } catch (error) {
    console.log(error)
  }
  await container.remove()
}
