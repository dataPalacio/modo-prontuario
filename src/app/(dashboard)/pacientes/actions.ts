'use server'

import { prisma } from '@/lib/prisma'
import { encrypt, hashCPF } from '@/lib/crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const SEXOS = ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'] as const

export async function createPacienteAction(formData: FormData) {
  const nome = formData.get('nome') as string
  const cpf = formData.get('cpf') as string
  const dataNascString = formData.get('dataNasc') as string
  const sexoValue = formData.get('sexo')?.toString() ?? 'NAO_INFORMADO'
  const telefone = formData.get('telefone') as string
  const email = formData.get('email') as string
  const observacoes = formData.get('observacoes') as string
  const cpfNormalizado = cpf.replace(/\D/g, '')
  const sexo = SEXOS.includes(sexoValue as (typeof SEXOS)[number])
    ? (sexoValue as (typeof SEXOS)[number])
    : 'NAO_INFORMADO'

  // Obter primeira clínica (mock para multi-tenant até integrarmos session)
  let clinica = await prisma.clinica.findFirst()
  if (!clinica) {
    clinica = await prisma.clinica.create({ data: { nome: 'Clínica Padrão' } })
  }

  const pacienteData = {
    clinicaId: clinica.id,
    nome,
    cpf: encrypt(cpfNormalizado),
    cpfHash: hashCPF(cpfNormalizado),
    dataNasc: new Date(dataNascString),
    sexo,
    telefone: telefone.replace(/\D/g, ''),
    email: email || null,
    observacoes: observacoes || null,
  }

  const paciente = await prisma.paciente.create({
    data: pacienteData,
  })

  revalidatePath('/pacientes')
  redirect(`/pacientes/${paciente.id}`)
}
