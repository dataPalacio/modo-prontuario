import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  FileText,
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  ASSINADO: 'Assinado',
  ARQUIVADO: 'Arquivado',
}

const STATUS_CLASSES: Record<string, string> = {
  ABERTO: 'badge badge--aberto',
  EM_ANDAMENTO: 'badge badge--andamento',
  ASSINADO: 'badge badge--assinado',
  ARQUIVADO: 'badge badge--arquivado',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={STATUS_CLASSES[status] ?? 'badge badge--aberto'}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default async function ProntuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const clinicaId = session.user.clinicaId

  const params = await searchParams
  const query = params.q || ''
  const statusFilter = params.status || 'TODOS'
  const page = parseInt(params.page || '1')
  const take = 15
  const skip = (page - 1) * take

  const where = {
    clinicaId,       // ⚠️ isolamento multi-tenant — NUNCA remover
    deletedAt: null, // ⚠️ soft delete — nunca listar registros excluídos
    ...(statusFilter !== 'TODOS' && { status: statusFilter as never }),
    ...(query && {
      OR: [
        { numero: { contains: query, mode: 'insensitive' as const } },
        { paciente: { nome: { contains: query, mode: 'insensitive' as const } } },
      ],
    }),
  }

  const [prontuarios, total] = await Promise.all([
    prisma.prontuario.findMany({
      where,
      skip,
      take,
      orderBy: { dataAtendimento: 'desc' },
      include: {
        paciente: { select: { id: true, nome: true } },
        profissional: { select: { nome: true, conselho: true, numeroConselho: true } },
        procedimentos: { select: { tipo: true }, take: 1 },
      },
    }),
    prisma.prontuario.count({ where }),
  ])

  const totalPages = Math.ceil(total / take)

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Prontuários</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {total} prontuário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/prontuarios/novo" data-testid="new-prontuario-btn" className="btn btn-primary">
          <Plus size={16} /> Novo Prontuário
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <form action="/prontuarios" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={16} style={{
              position: 'absolute', left: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              name="q"
              placeholder="Buscar por nº ou paciente..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              defaultValue={query}
            />
            {/* Preservar status ao submeter busca */}
            {statusFilter !== 'TODOS' && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
          </div>
          <button type="submit" className="btn btn-outline btn-sm">Buscar</button>
          {query && (
            <Link href={`/prontuarios${statusFilter !== 'TODOS' ? `?status=${statusFilter}` : ''}`} className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)' }}>
              Limpar
            </Link>
          )}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'ASSINADO', 'ARQUIVADO'].map((s) => (
              <Link
                key={s}
                data-testid={`status-filter-${s}`}
                href={`/prontuarios?${query ? `q=${query}&` : ''}${s !== 'TODOS' ? `status=${s}` : ''}`}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {STATUS_LABELS[s] ?? 'Todos'}
              </Link>
            ))}
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table data-testid="prontuarios-table" className="table">
            <thead>
              <tr>
                <th>Nº Prontuário</th>
                <th>Paciente</th>
                <th>Profissional</th>
                <th>Procedimento</th>
                <th>Data</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {prontuarios.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono" style={{
                      fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 600,
                    }}>
                      {p.numero}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    <Link href={`/pacientes/${p.paciente.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {p.paciente.nome}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {p.profissional.nome}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {p.profissional.conselho} {p.profissional.numeroConselho}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {p.procedimentos[0]?.tipo.replace(/_/g, ' ') ?? '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    {p.dataAtendimento.toLocaleDateString('pt-BR')}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <Link href={`/prontuarios/${p.id}`}
                        className="btn btn-ghost btn-sm"
                        title="Visualizar"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {prontuarios.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                    {query || statusFilter !== 'TODOS'
                      ? 'Nenhum prontuário encontrado com esses filtros.'
                      : 'Nenhum prontuário registrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > take && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Mostrando {skip + 1}–{Math.min(skip + take, total)} de <strong>{total}</strong></span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <Link
                href={`/prontuarios?${query ? `q=${query}&` : ''}${statusFilter !== 'TODOS' ? `status=${statusFilter}&` : ''}page=${page - 1}`}
                className={`btn btn-outline btn-sm ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
              >
                <ChevronLeft size={16} /> Anterior
              </Link>
              <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}>
                Página {page} de {totalPages}
              </div>
              <Link
                href={`/prontuarios?${query ? `q=${query}&` : ''}${statusFilter !== 'TODOS' ? `status=${statusFilter}&` : ''}page=${page + 1}`}
                className={`btn btn-outline btn-sm ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              >
                Próxima <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
