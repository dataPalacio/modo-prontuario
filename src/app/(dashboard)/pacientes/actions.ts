'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPacienteAction(formData: FormData) {
  const nome = formData.get('nome') as string
  const cpf = formData.get('cpf') as string
  const dataNascString = formData.get('dataNasc') as string
  const sexo = formData.get('sexo') as any
  const telefone = formData.get('telefone') as string
  const email = formData.get('email') as string
  const observacoes = formData.get('observacoes') as string

  // Obter primeira clínica (mock para multi-tenant até integrarmos session)
  let clinica = await prisma.clinica.findFirst()
  if (!clinica) {
    clinica = await prisma.clinica.create({ data: { nome: 'Clínica Padrão' } })
  }

  const pacienteData = {
    clinicaId: clinica.id,
    nome,
    cpf: cpf.replace(/\D/g, ''),
    dataNasc: new Date(dataNascString),
    sexo,
    telefone: telefone.replace(/\D/g, ''),
    email: email || null,
    observacoes: observacoes || null,
  }

  const paciente = await prisma.paciente.create({
    data: pacienteData
  })

  revalidatePath('/pacientes')
  redirect(`/pacientes/${paciente.id}`)
}
