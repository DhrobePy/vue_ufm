/**
 * When the login session expires while someone is mid-task, every API call
 * starts answering 401 and pages just go blank or toast "Unauthorized".
 * Catch that one case globally and send them to login, remembering the page
 * (login honours `return_to`). Other errors are left to each page's own handling.
 */
export default defineNuxtPlugin(() => {
  let redirecting = false

  globalThis.$fetch = $fetch.create({
    onResponseError({ response }) {
      if (response.status !== 401 || redirecting) return
      if (window.location.pathname.startsWith('/auth')) return // wrong-password 401 on the login form is normal
      redirecting = true
      navigateTo({ path: '/auth/login', query: { return_to: window.location.pathname + window.location.search } })
        .finally(() => { redirecting = false })
    },
  })
})
