// Shape of the session user set in server/api/auth/login.post.ts.
// Without this, nuxt-auth-utils types `session.user` as an empty object
// and every `user.id` / `user.role` read is a type error.
declare module '#auth-utils' {
  interface User {
    id: number
    name: string
    email?: string
    role: string
  }
}
export {}
