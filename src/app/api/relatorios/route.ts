// =============================================================================
// GET /api/relatorios — Prontuário HOF
// ✅ Auth obrigatória (ADMIN ou PROFISSIONAL)
// ✅ Multi-tenant (clinicaId da sessão)
// ✅ Tipos: procedimentos | pacientes | auditoria | retornos
// ✅ Filtros: período, profissional, tipo de procedimento
// ✅ Audit log de exportação de relatório
// =============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { registrarAuditLog, extrairContextoHttp } from '@/lib/audit'

// GET /api/relatorios?tipo=procedimentos&dataInicio=&dataFim=&profissionalId=
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const clinicaId = session.user.clinicaId
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo') || 'procedimentos'
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const profissionalId = searchParams.get('profissionalId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(200, parseInt(searchParams.get('pageSize') || '50'))

    const periodoWhere =
      dataInicio || dataFim
        ? {
            ...(dataInicio && { gte: new Date(dataInicio) }),
            ...(dataFim && { lte: new Date(dataFim) }),
          }
        : undefined

    let data: unknown
    let total = 0

    switch (tipo) {
      case 'procedimentos': {
        const where = {
          prontuario: {
            clinicaId,
            deletedAt: null,
            ...(profissionalId && { profissionalId }),
            ...(periodoWhere && { dataAtendimento: periodoWhere }),
          },
        }
        const [items, count] = await Promise.all([
          prisma.procedimento.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
              prontuario: {
                select: {
                  id: true,
                  numero: true,
                  dataAtendimento: true,
                  paciente: { select: { id: true, nome: true } },
                  profissional: { select: { id: true, nome: true } },
                },
              },
            },
          }),
          prisma.procedimento.count({ where }),
        ])
        data = items
        total = count
        break
      }

      case 'pacientes': {
        const where = {
          clinicaId,
          deletedAt: null,
          ativo: true,
          ...(periodoWhere && { createdAt: periodoWhere }),
        }
        const [items, count] = await Promise.all([
          prisma.paciente.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              nome: true,
              dataNasc: true,
              sexo: true,
              email: true,
              telefone: true,
              createdAt: true,
              _count: { select: { prontuarios: true } },
            },
          }),
          prisma.paciente.count({ where }),
        ])
        data = items
        total = count
        break
      }

      case 'auditoria': {
        // Relatório de auditoria — somente ADMIN
        if (session.user.role !== 'ADMIN') {
          return NextResponse.json(
            { error: 'Permissão negada. Relatório de auditoria é restrito a administradores.' },
            { status: 403 }
          )
        }
        const where = {
          clinicaId,
          ...(profissionalId && { userId: profissionalId }),
          ...(periodoWhere && { createdAt: periodoWhere }),
        }
        const [items, count] = await Promise.all([
          prisma.auditLog.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
              profissional: { select: { id: true, nome: true, email: true } },
            },
          }),
          prisma.auditLog.count({ where }),
        ])
        data = items
        total = count
        break
      }

      case 'retornos': {
        // Evoluções com retorno necessário no período
        const where = {
          retornoNecessario: true,
          prontuario: {
            clinicaId,
            deletedAt: null,
            ...(profissionalId && { profissionalId }),
          },
          ...(periodoWhere && { dataRetorno: periodoWhere }),
        }
        const [items, count] = await Promise.all([
          prisma.evolucao.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
            orderBy: { dataRetorno: 'asc' },
            include: {
              prontuario: {
                select: {
                  id: true,
                  numero: true,
                  paciente: { select: { id: true, nome: true, telefone: true } },
                  profissional: { select: { id: true, nome: true } },
                },
              },
            },
          }),
          prisma.evolucao.count({ where }),
        ])
        data = items
        total = count
        break
      }

      default:
        return NextResponse.json(
          { error: `Tipo de relatório inválido: ${tipo}. Use: procedimentos, pacientes, auditoria, retornos` },
          { status: 400 }
        )
    }

    // Registrar geração de relatório no audit log
    const { ip, userAgent } = extrairContextoHttp(request)
    await registrarAuditLog({
      clinicaId,
      userId: session.user.id,
      acao: 'RELATORIO_GERADO',
      entidade: 'Relatorio',
      entidadeId: tipo,
      ip,
      userAgent,
      dados: { tipo, total, dataInicio, dataFim },
    })

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      tipo,
    })
  } catch (error) {
    console.error('[GET /api/relatorios]', error)
    return NextResponse.json({ error: 'Erro interno ao gerar relatório.' }, { status: 500 })
  }
}
