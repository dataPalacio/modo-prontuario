'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Syringe } from 'lucide-react'

export default function NovoProntuarioPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  const steps = [
    { num: 1, label: 'Paciente & Queixa' },
    { num: 2, label: 'Anamnese' },
    { num: 3, label: 'Procedimento' },
    { num: 4, label: 'TCLE & Assinatura' },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem',
      }}>
        <Link href="/prontuarios" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            <Syringe size={22} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--brand-accent)' }} />
            Novo Prontuário
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Preencha as informações do atendimento
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card)',
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
      }}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button
              onClick={() => setStep(s.num)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0.5rem',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8125rem', fontWeight: 600,
                background: step >= s.num
                  ? 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))'
                  : 'var(--bg-primary)',
                color: step >= s.num ? 'white' : 'var(--text-muted)',
                transition: 'all var(--transition-base)',
              }}>
                {s.num}
              </div>
              <span style={{
                fontSize: '0.8125rem', fontWeight: step === s.num ? 600 : 400,
                color: step === s.num ? 'var(--text-primary)' : 'var(--text-muted)',
              }}>
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 0.5rem',
                background: step > s.num
                  ? 'var(--brand-primary)'
                  : 'var(--border)',
                transition: 'background var(--transition-base)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Identificação e Queixa Principal
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Paciente <span className="required">*</span></label>
                <select className="form-select">
                  <option value="">Selecione o paciente...</option>
                  <option>Maria Silva Santos</option>
                  <option>João Carlos Oliveira</option>
                  <option>Ana Beatriz Lima</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Data do Atendimento <span className="required">*</span></label>
                <input type="datetime-local" className="form-input" defaultValue="2025-03-14T14:00" />
              </div>
              <div className="form-group">
                <label className="form-label">Profissional Responsável</label>
                <input type="text" className="form-input" defaultValue="Dr. Carlos Mendes — CRO 12345/SP" readOnly
                  style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Queixa Principal <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Descreva a queixa principal do paciente..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Anamnese Clínica
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Pressão Arterial</label>
                <input type="text" className="form-input" placeholder="120/80 mmHg" />
              </div>
              <div className="form-group">
                <label className="form-label">Freq. Cardíaca</label>
                <input type="text" className="form-input" placeholder="72 bpm" />
              </div>
              <div className="form-group">
                <label className="form-label">IMC</label>
                <input type="text" className="form-input" placeholder="23.5" />
              </div>
            </div>

            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '1.5rem 0 1rem', color: 'var(--brand-primary)' }}>
              Histórico Médico
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Doenças Crônicas</label>
                <textarea className="form-textarea" placeholder="Liste doenças crônicas, se houver..." rows={2} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Alergias — Medicamentos</label>
                <input type="text" className="form-input" placeholder="Ex: Penicilina, AAS..." />
              </div>
            </div>

            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '1.5rem 0 1rem', color: 'var(--brand-accent)' }}>
              Contraindicações
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {[
                'Gestante', 'Amamentando', 'Anticoagulantes',
                'Isotretinoína (últimos 12 meses)', 'Predisposição a Queloide',
                'Doença Autoimune',
              ].map((item) => (
                <label key={item} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.625rem 0.75rem', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)', cursor: 'pointer',
                  fontSize: '0.8125rem', transition: 'all var(--transition-fast)',
                }}>
                  <input type="checkbox" />
                  {item}
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Registro do Procedimento
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Tipo de Procedimento <span className="required">*</span></label>
                <select className="form-select">
                  <option value="">Selecione...</option>
                  <option>Toxina Botulínica</option>
                  <option>Preenchimento (Ácido Hialurônico)</option>
                  <option>Bioestimulador de Colágeno</option>
                  <option>Fios de PDO</option>
                  <option>Rinomodelação</option>
                  <option>Skinbooster</option>
                  <option>Microagulhamento</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Região Anatômica <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Ex: Fronte, Glabela, Periorbital" />
              </div>
              <div className="form-group">
                <label className="form-label">Produto <span className="required">*</span></label>
                <input type="text" className="form-input" placeholder="Nome comercial do produto" />
              </div>
              <div className="form-group">
                <label className="form-label">Fabricante</label>
                <input type="text" className="form-input" placeholder="Fabricante do produto" />
              </div>
              <div className="form-group">
                <label className="form-label">Nº do Lote <span className="required">*</span></label>
                <input type="text" className="form-input font-mono" placeholder="Rastreabilidade obrigatória" />
              </div>
              <div className="form-group">
                <label className="form-label">Validade do Produto</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Concentração</label>
                <input type="text" className="form-input" placeholder="Ex: 100UI, 1ml" />
              </div>
              <div className="form-group">
                <label className="form-label">Volume/Quantidade</label>
                <input type="text" className="form-input" placeholder="Ex: 0.5ml por ponto" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Técnica Utilizada</label>
                <textarea className="form-textarea" placeholder="Descreva a técnica de aplicação..." rows={3} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              Termo de Consentimento Livre e Esclarecido
            </h2>
            <div style={{
              padding: '1.5rem', background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
              marginBottom: '1.5rem',
            }}>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                Eu, <strong>[Nome do Paciente]</strong>, declaro que fui informado(a) pelo(a)
                Dr(a). <strong>[Nome do Profissional]</strong> sobre o procedimento de
                <strong> [Tipo do Procedimento]</strong>, incluindo seus riscos, benefícios,
                alternativas e possíveis complicações. Compreendo que os resultados podem
                variar e que procedimentos estéticos não são garantidos. Autorizo a
                realização do procedimento proposto e declaro que todas as informações
                por mim fornecidas são verdadeiras.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Assinatura Digital do Paciente</label>
              <div style={{
                height: 150, border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.875rem',
                cursor: 'crosshair', background: 'white',
              }}>
                Clique e arraste para assinar
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                A assinatura digital tem validade jurídica conforme MP 2.200-2/2001
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '2rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--border)',
        }}>
          <button
            className="btn btn-outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Voltar
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-ghost">
              Salvar Rascunho
            </button>
            {step < totalSteps ? (
              <button
                className="btn btn-primary"
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
              >
                Próximo
              </button>
            ) : (
              <button className="btn btn-accent btn-lg">
                <Save size={16} /> Finalizar Prontuário
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
