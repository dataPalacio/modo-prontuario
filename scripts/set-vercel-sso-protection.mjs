import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const mode = process.argv[2]
if (!mode) {
  console.error('Uso: node scripts/set-vercel-sso-protection.mjs <off|preview|all|prod_deployment_urls_and_all_previews|all_except_custom_domains>')
  process.exit(1)
}

const authPathCandidates = [
  path.join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json'),
  path.join(process.env.USERPROFILE || '', '.vercel', 'auth.json'),
]

const authPath = authPathCandidates.find((candidate) => candidate && fs.existsSync(candidate))
if (!authPath) throw new Error('Nao foi possivel localizar auth.json da Vercel CLI')

const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'))
const proj = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))

const request = https.request(
  {
    hostname: 'api.vercel.com',
    path: `/v9/projects/${proj.projectId}?teamId=${proj.orgId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
  },
  (res) => {
    let data = ''
    res.on('data', (c) => (data += c))
    res.on('end', () => {
      console.log(`status=${res.statusCode}`)
      try {
        const payload = JSON.parse(data)
        console.log(`ssoProtection=${JSON.stringify(payload.ssoProtection || null)}`)
        if (payload.error) {
          console.log(`error=${payload.error.code || payload.error.message || 'unknown'}`)
        }
      } catch {
        console.log(data)
      }

      if (res.statusCode && res.statusCode >= 400) process.exit(1)
    })
  }
)

request.on('error', (err) => {
  console.error(err.message)
  process.exit(1)
})

const payload = mode === 'off'
  ? { ssoProtection: null }
  : { ssoProtection: { deploymentType: mode } }

request.write(JSON.stringify(payload))
request.end()
