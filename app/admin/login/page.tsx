import { LoginForm } from './LoginForm'

export const dynamic = 'force-dynamic'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const params = await searchParams
  const redirect = params.redirect ?? '/admin/overview'
  return <LoginForm redirect={redirect} loginError={params.error} />
}
