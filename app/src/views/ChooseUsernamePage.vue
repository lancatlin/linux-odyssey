<script setup lang="ts">
import { isValidUsername } from '@linux-odyssey/utils'
import AuthForm from '../components/AuthForm.vue'
import Background from '../components/DynamicBackground.vue'
import { TooManyRequestsError, ValidationError } from '../utils/errors'
import { checkUsername, chooseUsername } from '../utils/auth'
import { debounce } from '../utils/debouncing'

const debouncedFun = debounce(fun, 500)

async function check({
  username,
  error,
}: {
  username: string
  // eslint-disable-next-line no-unused-vars
  error: (msg: string) => void
}) {
  if (username) {
    if (!isValidUsername(username)) {
      error('無效的帳號名稱')
      return
    }
    try {
      await debounceedFun(checkUsername(username))
    } catch (err) {
      if (err instanceof TooManyRequestsError) {
        error('太多請求，兩分鐘後再試一次。')
        return
      }
      if (err instanceof ValidationError) {
        error(err.message)
        return
      }
      error('出了點問題，請再試一次。')
    }
  }
}

async function handleSubmit({
  username,
  success,
  error,
}: {
  username: string
  success: () => void
  // eslint-disable-next-line no-unused-vars
  error: (msg: string) => void
}) {
  try {
    await chooseUsername(username)
    success()
  } catch (err: any) {
    if (err instanceof TooManyRequestsError) {
      error('太多請求，兩分鐘後再試一次。')
      return
    }
    if (err instanceof ValidationError) {
      error(err.message)
      return
    }
    error(err.message)
  }
}
</script>

<template>
  <div class="w-screen h-screen">
    <Background class="w-full h-full" />
    <div
      class="h-screen w-screen absolute top-0 left-0 flex flex-wrap justify-center content-center"
    >
      <div class="w-fit">
        <AuthForm
          @onSubmit="handleSubmit"
          @onChange="check"
          type="username"
          :socialLogin="false"
        />
      </div>
    </div>
  </div>
</template>
