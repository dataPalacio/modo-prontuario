const base = 'http://localhost:3000'

function extractCookie(setCookieHeader) {
  if (!setCookieHeader) return ''
  return setCookieHeader.split(';')[0]
}

function extractCookies(setCookieHeader) {
  if (!setCookieHeader) return []
  return setCookieHeader
    .split(/,(?=[^;]+=[^;]+)/g)
    .map((entry) => entry.split(';')[0])
    .filter(Boolean)
}

async function main() {
  const csrfRes = await fetch(`${base}/api/auth/csrf`)
  if (!csrfRes.ok) {
    console.error('CSRF_FAIL', csrfRes.status)
    process.exit(1)
  }

  const csrfJson = await csrfRes.json()
  const csrfToken = csrfJson.csrfToken
  const csrfCookie = extractCookie(csrfRes.headers.get('set-cookie'))

  const body = new URLSearchParams({
    csrfToken,
    email: 'admin@clinicapremium.com.br',
    password: '123456',
    callbackUrl: `${base}/dashboard`,
    json: 'true',
  })

  const signInRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie: csrfCookie,
    },
    body,
    redirect: 'manual',
  })

  const location = signInRes.headers.get('location') || ''
  const sessionCookies = extractCookies(signInRes.headers.get('set-cookie'))
  const responseText = await signInRes.text()

  console.log('LOGIN_STATUS', signInRes.status)
  console.log('LOGIN_LOCATION', location)
  console.log('LOGIN_BODY_SLICE', responseText.slice(0, 200))

  const success = signInRes.status >= 300 && signInRes.status < 400 && !location.includes('error=CredentialsSignin')
  if (!success) {
    process.exit(2)
  }

  const dashboardRes = await fetch(`${base}/dashboard`, {
    headers: {
      cookie: sessionCookies.join('; '),
    },
    redirect: 'manual',
  })

  console.log('DASHBOARD_STATUS', dashboardRes.status)

  if (dashboardRes.status >= 300 && dashboardRes.status < 400) {
    console.log('DASHBOARD_REDIRECT', dashboardRes.headers.get('location') || '')
    process.exit(3)
  }

  const pacientesRes = await fetch(`${base}/pacientes`, {
    headers: {
      cookie: sessionCookies.join('; '),
    },
    redirect: 'manual',
  })

  console.log('PACIENTES_STATUS', pacientesRes.status)

  if (pacientesRes.status >= 500) {
    const body = await pacientesRes.text()
    console.log('PACIENTES_BODY_SLICE', body.slice(0, 200))
    process.exit(4)
  }

  console.log('LOGIN_OK')
}

main().catch((error) => {
  console.error('LOGIN_TEST_ERROR', error.message)
  process.exit(1)
})
