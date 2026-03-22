import https from 'https'
import { readFileSync } from 'fs'

// Obter token do Vercel
const vercelConfigPath = `${process.env.HOME || process.env.USERPROFILE}/.vercel/auth.json`
let token
try {
  const config = JSON.parse(readFileSync(vercelConfigPath, 'utf-8'))
  token = config.token
} catch (e) {
  console.error('❌ Token Vercel não encontrado')
  process.exit(1)
}

const projectId = 'prj_MnxoSEnHkYfGcF5fea05AWRE2dl8'
const teamId = 'team_XCvqvxJQoAVAiJGrtSBjYfMn'

// Obter últemo deployment
const options = {
  hostname: 'api.vercel.com',
  port: 443,
  path: `/v12/deployments?projectId=${projectId}&limit=5`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

const req = https.request(options, (res) => {
  let data = ''
  res.on('data', (chunk) => { data += chunk })
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      if (result.deployments && result.deployments.length > 0) {
        const latest = result.deployments[0]
        console.log('\n📋 Último Deployment:')
        console.log(`ID: ${latest.id}`)
        console.log(`URL: ${latest.url}`)
        console.log(`Status: ${latest.state}`)
        console.log(`Criado em: ${new Date(latest.createdAt).toLocaleString('pt-BR')}`)
        
        if (latest.errorMessage) {
          console.log(`\n❌ Mensagem de Erro: ${latest.errorMessage}`)
        }
        
        if (latest.buildErrorCode) {
          console.log(`\n❌ Código de Erro de Build: ${latest.buildErrorCode}`)
        }
        
        console.log('\n📊 Resumo dos últimos 5 deployments:')
        result.deployments.forEach((dep, idx) => {
          const status = dep.state === 'READY' ? '✅' : dep.state === 'ERROR' ? '❌' : '⏳'
          console.log(`${idx + 1}. ${status} ${dep.url} - ${dep.state} (${new Date(dep.createdAt).toLocaleString('pt-BR')})`)
        })
      }
    } catch (e) {
      console.error('Erro ao parsear resposta:', e.message)
    }
  })
})

req.on('error', (e) => {
  console.error(`Erro na requisição: ${e.message}`)
})

req.end()
