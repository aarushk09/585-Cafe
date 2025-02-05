import { adminEmails } from "./adminEmails"

export function isAdmin(email: string): boolean {
  const result = adminEmails.includes(email)
  console.log(`Checking admin status for ${email}: ${result}`)
  return result
}

