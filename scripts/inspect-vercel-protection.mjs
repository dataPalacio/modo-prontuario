import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const authPathCandidates = [
  path.join(process.env.APPDATA || '', 'com.vercel.cli', 'Data', 'auth.json'),
  path.join(process.env.USERPROFILE || '', '.vercel', 'auth.json'),
]

const authPath = authPathCandidates.find((candidate) => candidate && fs.existsSync(candidate))
if (!authPath) {
  throw new Error('Nao foi possivel localizar auth.json da Vercel CLI')
}

const auth = JSON.parse(fs.readFileSync(authPath, 'utf8'))
const proj = JSON.parse(fs.readFileSync('.vercel/project.json', 'utf8'))

const reqPath = `/v9/projects/${proj.projectId}?teamId=${proj.orgId}`

const request = https.request(
  {
    hostname: 'api.vercel.com',
    path: reqPath,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth.token}`,
    },
  },
  (res) => {
    let data = ''
    res.on('data', (c) => (data += c))
    res.on('end', () => {
      const payload = JSON.parse(data)

      const hits = []
      const visit = (node, nodePath = '') => {
        if (!node || typeof node !== 'object') return
        for (const key of Object.keys(node)) {
          const value = node[key]
          const currentPath = nodePath ? `${nodePath}.${key}` : key
          if (/(protect|password|auth|preview|sso|firewall|deployment)/i.test(key)) {
            const summary =
              typeof value === 'object' ? JSON.stringify(value).slice(0, 260) : String(value)
            hits.push({ path: currentPath, summary })
          }
          visit(value, currentPath)
        }
      }

      visit(payload)

      console.log(`status=${res.statusCode}`)
      console.log(`hits=${hits.length}`)
      for (const hit of hits.slice(0, 200)) {
        console.log(`${hit.path}=${hit.summary}`)
      }
    })
  }
)

request.on('error', (err) => {
  console.error(err.message)
  process.exit(1)
})

request.end()
