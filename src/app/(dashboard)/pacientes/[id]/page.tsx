import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Mail, Calendar, Edit, FileText, Plus } from 'lucide-react'
import { formatCPF, formatPhone, calcularIdade } from '@/lib/utils'

export default async function PacienteDetalhePage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params)

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      prontuarios: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!paciente) return notFound()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/pacientes" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{paciente.nome}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Paciente desde {paciente.createdAt.toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button className="btn btn-outline" disabled style={{ opacity: 0.5 }}>
          <Edit size={16} /> Editar (em dev)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Card de Informações */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Dados Pessoais
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CPF</div>
              <div className="font-mono" style={{ fontSize: '0.875rem' }}>{formatCPF(paciente.cpf)}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Idade e Nascimento</div>
              <div>{calcularIdade(paciente.dataNasc.toISOString() as any)} anos ({paciente.dataNasc.toLocaleDateString('pt-BR')})</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Sexo</div>
              <div>{paciente.sexo === 'FEMININO' ? 'Feminino' : paciente.sexo === 'MASCULINO' ? 'Masculino' : paciente.sexo}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                Telefone Celular
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} color="var(--brand-accent)" /> {formatPhone(paciente.telefone)}</div>
            </div>
            {paciente.email && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  E-mail
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} color="var(--brand-accent)" /> {paciente.email}</div>
              </div>
            )}
            {paciente.observacoes && (
               <div>
                  <div style={{ color: 'var(--brand-danger)', marginBottom: '0.25rem', fontWeight: 600 }}>Observações Críticas</div>
                  <div style={{ padding: '0.75rem', background: 'rgba(255,0,0,0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(255,0,0,0.1)', color: 'var(--text-primary)' }}>
                     {paciente.observacoes}
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* Histórico Clínico */}
        <div className="card">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <FileText size={18} /> Prontuários e Procedimentos
            </h2>
            <Link href={`/prontuarios/novo?pacienteId=${paciente.id}`} className="btn btn-primary btn-sm">
              <Plus size={14} /> Criar Prontuário
            </Link>
          </div>

          {paciente.prontuarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
               <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 1rem auto' }} />
               <p style={{ margin: 0 }}>Nenhum prontuário registrado para este paciente.</p>
               <p style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>Clique em "Criar Prontuário" para iniciar.</p>
            </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {paciente.prontuarios.map((prontuario: any) => (
                 <Link href={`/prontuarios/${prontuario.id}`} key={prontuario.id} className="card" style={{ padding: '1rem', border: '1px solid var(--border)', background: 'var(--bg-elevated)', display: 'block', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                     <div>
                       <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>{prontuario.numero}</span>
                       <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{prontuario.queixaPrincipal}</h3>
                     </div>
                     <span className={`badge ${prontuario.status === 'ASSINADO' ? 'badge--assinado' : prontuario.status === 'EM_ANDAMENTO' ? 'badge--andamento' : 'badge--aberto'}`}>
                        {prontuario.status.replace('_', ' ')}
                     </span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14}/> {prontuario.dataAtendimento.toLocaleDateString('pt-BR')}</span>
                   </div>
                 </Link>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
