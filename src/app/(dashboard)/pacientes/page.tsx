import Link from 'next/link'
import { Plus, Search, Filter, MoreHorizontal, Phone, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { formatCPF, formatPhone, calcularIdade } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const params = await Promise.resolve(searchParams)
  const query = params.q || ''
  const page = parseInt(params.page || '1')
  const take = 10
  const skip = (page - 1) * take

  const whereParams = query
    ? {
        OR: [
          { nome: { contains: query, mode: 'insensitive' as const } },
          { cpf: { contains: query.replace(/\D/g, '') } },
        ],
      }
    : {}

  // Contagem e Busca no banco Real
  const [total, pacientes] = await Promise.all([
    prisma.paciente.count({ where: whereParams }),
    prisma.paciente.findMany({
      where: whereParams,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { prontuarios: true },
        },
      },
    }),
  ])

  const totalPages = Math.ceil(total / take)

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Pacientes</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {total} pacientes cadastrados
          </p>
        </div>
        <Link href="/pacientes/novo" className="btn btn-primary">
          <Plus size={16} /> Novo Paciente
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <form action="/pacientes" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250, maxWidth: 500 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              name="q"
              placeholder="Buscar por nome ou CPF..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              defaultValue={query}
            />
          </div>
          <button type="submit" className="btn btn-outline btn-sm">
            <Filter size={14} /> Buscar
          </button>
          
          {query && (
            <Link href="/pacientes" className="btn btn-ghost btn-sm" style={{ color: 'var(--text-muted)', marginLeft: '1rem' }}>
               Limpar busca
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>CPF</th>
                <th>Idade / Nasc</th>
                <th>Contato</th>
                <th>Prontuários</th>
                <th style={{ width: 48 }}></th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/pacientes/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: p.sexo === 'FEMININO' ? 'linear-gradient(135deg, #C9956A, #E8B87A)' : 'linear-gradient(135deg, #4A90B8, #6BB3D9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0,
                      }}>
                        {p.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.sexo === 'FEMININO' ? '♀' : p.sexo === 'MASCULINO' ? '♂' : ''} · {p.email || 'Sem e-mail'}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td><span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatCPF(p.cpf)}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                     {calcularIdade(p.dataNasc.toISOString() as any)} anos
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                       {p.dataNasc.toLocaleDateString('pt-BR')}
                     </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        <Phone size={12} color="var(--brand-accent)" />
                        {formatPhone(p.telefone)}
                      </span>
                    </div>
                  </td>
                  <td>
                     {p._count.prontuarios > 0 ? (
                        <span className="badge badge--andamento">{p._count.prontuarios}</span>
                     ) : (
                        <span className="badge" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>Zero</span>
                     )}
                  </td>
                  <td>
                    <Link href={`/pacientes/${p.id}`} className="btn btn-ghost btn-sm" style={{ padding: '0.375rem', color: 'var(--text-muted)' }} title="Acessar Cadastro">
                      <MoreHorizontal size={16} />
                    </Link>
                  </td>
                </tr>
              ))}

              {pacientes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                     <User size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
                     {query ? 'Nenhum paciente encontrado com essa busca.' : 'Nenhum paciente cadastrado.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Mostrando {skip + 1}-{Math.min(skip + take, total)} de <strong>{total}</strong> pacientes</span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              <Link scroll={false} href={`/pacientes?q=${query}&page=${page - 1}`} className={`btn btn-outline btn-sm ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}>
                <ChevronLeft size={16} /> Anterior
              </Link>
              <div style={{ padding: '0 0.5rem', display: 'flex', alignItems: 'center' }}>
                 Página {page} de {totalPages}
              </div>
              <Link scroll={false} href={`/pacientes?q=${query}&page=${page + 1}`} className={`btn btn-outline btn-sm ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}>
                Próxima <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
