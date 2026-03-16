import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { encrypt, hashCPF } from '../src/lib/crypto'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL não definida para executar o seed')
}

const pool = new Pool({
  connectionString,
})

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
})

function buildPacienteData(
  clinicaId: string,
  data: {
    nome: string
    cpf: string
    dataNasc: Date
    sexo: 'FEMININO' | 'MASCULINO' | 'OUTRO' | 'NAO_INFORMADO'
    telefone: string
    email?: string
    whatsapp?: string
    endereco?: {
      logradouro: string
      numero: string
      bairro: string
      cidade: string
      uf: string
      cep: string
    }
  }
) {
  const cpf = data.cpf.replace(/\D/g, '')

  return {
    clinicaId,
    nome: data.nome,
    cpf: encrypt(cpf),
    cpfHash: hashCPF(cpf),
    dataNasc: data.dataNasc,
    sexo: data.sexo,
    telefone: data.telefone,
    email: data.email,
    whatsapp: data.whatsapp,
    endereco: data.endereco,
  }
}

async function main() {
  console.log('🦷 Iniciando seed do Prontuário HOF...\n')

  // 1. Criar Clínica de demonstração
  const clinica = await prisma.clinica.create({
    data: {
      nome: 'Clínica Estética Orofacial Premium',
      cnpj: '12345678000190',
      endereco: 'Av. Paulista, 1000 - Cj 801 - Bela Vista, São Paulo - SP',
      telefone: '1132145678',
      email: 'contato@clinicapremium.com.br',
      plano: 'PRO',
    },
  })
  console.log('✅ Clínica criada:', clinica.nome)

  // 2. Criar Profissional (senha: 123456)
  const senhaHash = await bcrypt.hash('123456', 12)
  const profissional = await prisma.profissional.create({
    data: {
      clinicaId: clinica.id,
      nome: 'Dr. Carlos Eduardo Mendes',
      email: 'carlos@clinicapremium.com.br',
      senhaHash,
      conselho: 'CFO',
      numeroConselho: '12345',
      uf: 'SP',
      especialidade: 'Harmonização Orofacial',
      role: 'ADMIN',
    },
  })
  console.log('✅ Profissional criado:', profissional.nome)

  // 3. Criar Pacientes de demonstração
  const pacientes = await Promise.all([
    prisma.paciente.create({
      data: buildPacienteData(clinica.id, {
        nome: 'Maria Silva Santos',
        cpf: '12345678901',
        dataNasc: new Date('1985-06-15'),
        sexo: 'FEMININO',
        telefone: '11999887766',
        email: 'maria.silva@email.com',
        whatsapp: '11999887766',
        endereco: {
          logradouro: 'Rua Augusta',
          numero: '500',
          bairro: 'Consolação',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01304001',
        },
      }),
    }),
    prisma.paciente.create({
      data: buildPacienteData(clinica.id, {
        nome: 'João Carlos Oliveira',
        cpf: '98765432100',
        dataNasc: new Date('1978-11-22'),
        sexo: 'MASCULINO',
        telefone: '11988776655',
        email: 'joao.oliveira@email.com',
      }),
    }),
    prisma.paciente.create({
      data: buildPacienteData(clinica.id, {
        nome: 'Ana Beatriz Lima',
        cpf: '45678912300',
        dataNasc: new Date('1990-03-08'),
        sexo: 'FEMININO',
        telefone: '11977665544',
        email: 'ana.lima@email.com',
      }),
    }),
    prisma.paciente.create({
      data: buildPacienteData(clinica.id, {
        nome: 'Roberto Mendes Filho',
        cpf: '32165498700',
        dataNasc: new Date('1972-09-30'),
        sexo: 'MASCULINO',
        telefone: '11966554433',
      }),
    }),
    prisma.paciente.create({
      data: buildPacienteData(clinica.id, {
        nome: 'Carla Fernanda Costa',
        cpf: '65432198700',
        dataNasc: new Date('1995-01-12'),
        sexo: 'FEMININO',
        telefone: '11955443322',
        email: 'carla.costa@email.com',
      }),
    }),
  ])
  console.log(`✅ ${pacientes.length} pacientes criados`)

  // 4. Criar Prontuários de exemplo
  const prontuario1 = await prisma.prontuario.create({
    data: {
      clinicaId: clinica.id,
      pacienteId: pacientes[0].id,
      profissionalId: profissional.id,
      numero: 'P-2024-0001',
      dataAtendimento: new Date('2024-03-10T14:00:00'),
      queixaPrincipal: 'Linhas de expressão na região frontal e glabelar',
      anamnese: {
        dadosVitais: {
          pressaoArterial: '120/80',
          frequenciaCardiaca: '72',
          peso: '65',
          altura: '168',
          imc: '23.0',
        },
        queixas: {
          principal: 'Linhas de expressão na região frontal',
          expectativasPaciente: 'Suavização das rugas sem perder expressão natural',
          procedimentosAnteriores: [],
        },
        historicoMedico: {
          doencasCronicas: [],
          alergias: { medicamentos: [], alimentos: [], outros: [] },
          medicamentosEmUso: [],
          anticoagulantes: false,
          gestante: false,
          amamentando: false,
        },
        historicoEstetico: {
          toxinaBotulinicaAnterior: false,
          preenchimentoAnterior: false,
          reacaoAdversaAnterior: false,
        },
        habitos: {
          tabagismo: false,
          etilismo: false,
          fotoprotecao: true,
        },
      },
      status: 'ASSINADO',
      assinadoEm: new Date('2024-03-10T16:00:00'),
    },
  })

  // 5. Criar Procedimento vinculado
  await prisma.procedimento.create({
    data: {
      prontuarioId: prontuario1.id,
      tipo: 'TOXINA_BOTULINICA',
      regiaoAnatomica: 'Frontal + Glabela',
      produto: 'Botox® (Toxina Onabotulínica A)',
      fabricante: 'Allergan / AbbVie',
      lote: 'LOT-2024-BX-78901',
      concentracao: '100UI',
      volume: '20UI frontal + 15UI glabela',
      tecnica: 'Injeção intramuscular, agulha 30G, 5 pontos frontais + 5 pontos glabelares',
    },
  })
  console.log('✅ Prontuário + procedimento de exemplo criados')

  // 6. Criar segundo prontuário
  await prisma.prontuario.create({
    data: {
      clinicaId: clinica.id,
      pacienteId: pacientes[1].id,
      profissionalId: profissional.id,
      numero: 'P-2024-0002',
      dataAtendimento: new Date('2024-03-12T10:00:00'),
      queixaPrincipal: 'Desejo de aumento e definição labial',
      status: 'EM_ANDAMENTO',
    },
  })
  console.log('✅ Segundo prontuário criado')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📋 Credenciais de acesso:')
  console.log('   E-mail: carlos@clinicapremium.com.br')
  console.log('   Senha:  123456')
}

main()
  .then(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
  })
