'use server'

import { prisma } from '@/lib/prisma'
import { encrypt, hashCPF } from '@/lib/crypto'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'

const SEXOS = ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'] as const

export type CreatePacienteState = {
  error?: string
  success?: boolean
}

export async function createPacienteAction(
  _prevState: CreatePacienteState,
  formData: FormData
): Promise<CreatePacienteState> {
  const session = await getSession()
  const clinicaId = session.user.clinicaId

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

  const pacienteData = {
    clinicaId,
    nome,
    cpf: encrypt(cpfNormalizado),
    cpfHash: hashCPF(cpfNormalizado),
    dataNasc: new Date(dataNascString),
    sexo,
    telefone: telefone.replace(/\D/g, ''),
    email: email || null,
    observacoes: observacoes || null,
  }

  let pacienteId: string
  try {
    const paciente = await prisma.paciente.create({ data: pacienteData })
    pacienteId = paciente.id
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    ) {
      return { error: 'CPF já cadastrado para esta clínica.' }
    }
    console.error('[createPacienteAction]', err)
    return { error: 'Erro ao salvar paciente. Tente novamente.' }
  }

  revalidatePath('/pacientes')
  redirect(`/pacientes/${pacienteId}`)
}
