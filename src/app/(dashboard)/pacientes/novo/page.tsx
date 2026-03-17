'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createPacienteAction, CreatePacienteState } from '../actions'

const initialState: CreatePacienteState = {}

export default function NovoPacientePage() {
  const [state, formAction, isPending] = useActionState(createPacienteAction, initialState)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link href="/pacientes" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Novo Paciente</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Cadastre os dados pessoais básicos do paciente
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {state.error && (
          <div
            role="alert"
            style={{
              marginBottom: '1.5rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.5rem',
              background: 'var(--brand-danger-bg, #fef2f2)',
              color: 'var(--brand-danger, #dc2626)',
              border: '1px solid var(--brand-danger-border, #fecaca)',
              fontSize: '0.875rem',
            }}
          >
            {state.error}
          </div>
        )}
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
            
            <div className="form-group">
              <label className="form-label">Nome Completo <span className="required" style={{color: 'var(--brand-danger)'}}>*</span></label>
              <input type="text" name="nome" required className="form-input" placeholder="João da Silva" />
            </div>

            <div className="form-group">
              <label className="form-label">CPF (11 dígitos) <span className="required" style={{color: 'var(--brand-danger)'}}>*</span></label>
              <input type="text" name="cpf" required className="form-input" placeholder="123.456.789-00" maxLength={14} />
            </div>

            <div className="form-group">
              <label className="form-label">Data de Nascimento <span className="required" style={{color: 'var(--brand-danger)'}}>*</span></label>
              <input type="date" name="dataNasc" required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Sexo <span className="required" style={{color: 'var(--brand-danger)'}}>*</span></label>
              <select name="sexo" required className="form-input" style={{ width: '100%', padding: '0.5rem' }}>
                <option value="FEMININO">Feminino</option>
                <option value="MASCULINO">Masculino</option>
                <option value="OUTRO">Outro</option>
                <option value="NAO_INFORMADO">Prefiro não informar</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Celular / WhatsApp <span className="required" style={{color: 'var(--brand-danger)'}}>*</span></label>
              <input type="text" name="telefone" required className="form-input" placeholder="(11) 99999-8888" maxLength={15} />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input type="email" name="email" className="form-input" placeholder="joao@email.com" />
            </div>
            
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Observações Clínicas</label>
              <textarea name="observacoes" className="form-input" rows={3} placeholder="Alergias, condições prévias importantes, etc." />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
            <Link href="/pacientes" className="btn btn-ghost" style={{ marginRight: '1rem' }}>Cancelar</Link>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              <Save size={16} /> {isPending ? 'Salvando...' : 'Salvar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
