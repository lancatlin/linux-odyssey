import api from './api'
import debouncing from './debouncing'

import {
  TooManyRequestsError,
  UnauthorizedError,
  ValidationError,
} from './errors'

export async function isLoggedIn() {
  const res = await api.get('/auth/check-session')
  const { loggedIn } = res.data
  return loggedIn
}

function handleRequestError(err: {
  response: {
    data?: any
    status?: number
  }
}) {
  if (!err.response) throw err // Not an axios error
  const { status } = err.response
  if (status === 429) {
    throw new TooManyRequestsError(err.response.data.message)
  }
  if (status === 401) {
    throw new UnauthorizedError(err.response.data.message)
  }
  if (status === 400) {
    const { errors } = err.response.data
    if (Array.isArray(errors) && errors.length > 0) {
      const { path, msg } = errors[0]
      switch (path) {
        case 'username':
          throw new ValidationError('Username is already taken')
        case 'email':
          throw new ValidationError('Email is already taken')
        case 'password':
          throw new ValidationError('Password is too weak')
        default:
          throw new ValidationError(msg)
      }
    }
    throw new ValidationError(err.response.data.message)
  }
  throw err
}

export const login = (username: string, password: string) => {
  return api
    .post('/auth/login', { username, password })
    .then(() => true)
    .catch(handleRequestError)
}

export const register = (username: string, email: string, password: string) => {
  return api
      .post('/auth/register', {
      username,
      password,
      email,
    })
    .then(() => true)
    .catch(handleRequestError)
}

export const checkUsername = async (username: string) => {
  return api
    .get('/auth/check-username', {
      params: { username },
    })
    .then(() => true)
    .catch(handleRequestError)
}

export const chooseUsername = async (username: string) => {
  return api
    .post('/auth/register-from-session', { username })
    .then(() => true)
    .catch(handleRequestError)
}

export const logout = () => {
  return api
    .post('/auth/logout')
    .then(() => true)
    .catch(handleRequestError)
}

export const debouncedFunction = debounce(myFunction, 500);

const debouncedGreet = debounce((name) => {
  greet(name);
}, 500);