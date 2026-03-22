import https from 'node:https'

const req = https.request(
  {
    hostname: 'openapi.vercel.sh',
    path: '/',
    method: 'GET',
  },
  (res) => {
    let data = ''
    res.on('data', (c) => (data += c))
    res.on('end', () => {
      let doc
      try {
        doc = JSON.parse(data)
      } catch {
        console.log('Falha ao parsear OpenAPI JSON')
        console.log(data.slice(0, 500))
        process.exit(1)
      }

      const text = JSON.stringify(doc)
      const snippets = []
      const terms = ['ssoProtection', 'deploymentType', 'passwordProtection', 'Protection']
      for (const term of terms) {
        let idx = 0
        while (idx >= 0) {
          idx = text.indexOf(term, idx)
          if (idx < 0) break
          const start = Math.max(0, idx - 220)
          const end = Math.min(text.length, idx + 400)
          snippets.push(text.slice(start, end))
          idx += term.length
          if (snippets.length > 40) break
        }
      }

      console.log(`status=${res.statusCode}`)
      console.log(`snippets=${snippets.length}`)
      for (const s of snippets.slice(0, 60)) {
        console.log('---')
        console.log(s)
      }
    })
  }
)

req.on('error', (err) => {
  console.error(err.message)
  process.exit(1)
})

req.end()
