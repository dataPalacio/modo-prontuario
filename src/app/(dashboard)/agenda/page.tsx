'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, ChevronLeft, ChevronRight, Clock, User, X, AlertCircle, Loader2 } from 'lucide-react'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Agendamento {
  id: string
  dataHora: string
  paciente: { id: string; nome: string }
  profissional: { id: string; name: string }
  tipo: string
  duracao: number
  observacoes?: string
}

interface Paciente {
  id: string
  nome: string
}

const TIPOS_CONSULTA = [
  'Avaliação Inicial',
  'Retorno',
  'Toxina Botulínica',
  'Preenchimento AH',
  'Bioestimulador',
  'Fios PDO',
  'Peeling Químico',
  'Skinbooster',
  'Microagulhamento',
  'Outro',
]

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <Loader2 size={28} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function AgendaPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    pacienteId: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '09:00',
    tipo: 'Avaliação Inicial',
    duracao: 60,
    observacoes: '',
  })

  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN'
  const userId = (session?.user as { id?: string })?.id

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const inicio = format(startOfMonth(currentDate), 'yyyy-MM-dd')
      const fim = format(endOfMonth(currentDate), 'yyyy-MM-dd')
      // Filtrar por profissionalId no servidor para não-ADMINs (segurança multi-tenant)
      const profFiltro = !isAdmin && userId ? `&profissionalId=${userId}` : ''
      const res = await fetch(`/api/agenda?dataInicio=${inicio}&dataFim=${fim}${profFiltro}`)
      if (!res.ok) throw new Error('Erro ao carregar agendamentos')
      const json = await res.json()
      setAgendamentos(json.data ?? [])
    } catch {
      setError('Não foi possível carregar a agenda. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [currentDate, isAdmin, userId])

  useEffect(() => {
    fetchAgendamentos()
  }, [fetchAgendamentos])

  useEffect(() => {
    async function loadPacientes() {
      try {
        const res = await fetch('/api/pacientes?pageSize=200')
        if (!res.ok) return
        const json = await res.json()
        setPacientes(json.data ?? [])
      } catch {
        // silencia erro de pacientes no modal
      }
    }
    if (modalOpen) loadPacientes()
  }, [modalOpen])

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  })

  const getEventosDodia = (day: Date) =>
    agendamentos.filter((a) => isSameDay(parseISO(a.dataHora), day))

  // Todos os eventos do dia — filtro de profissional já aplicado no servidor
  const visibleEvents = getEventosDodia(selectedDate)

  async function handleCreateAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setFormLoading(true)
    setFormError(null)
    try {
      const dataHora = `${formData.data}T${formData.hora}:00`
      const body: Record<string, unknown> = {
        pacienteId: formData.pacienteId,
        dataHora,
        tipo: formData.tipo,
        duracao: formData.duracao,
        observacoes: formData.observacoes || undefined,
      }
      const res = await fetch('/api/agenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 409) {
        setFormError('Conflito de horário: já existe um agendamento neste horário. Escolha outro.')
        return
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setFormError(json.error ?? 'Erro ao criar agendamento.')
        return
      }
      setModalOpen(false)
      setFormData({
        pacienteId: '',
        data: format(new Date(), 'yyyy-MM-dd'),
        hora: '09:00',
        tipo: 'Avaliação Inicial',
        duracao: 60,
        observacoes: '',
      })
      fetchAgendamentos()
    } catch {
      setFormError('Erro ao criar agendamento. Verifique sua conexão.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Gerenciamento de consultas e retornos
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '1rem 1.25rem', borderRadius: 'var(--radius)',
          background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
          color: 'var(--brand-danger)', marginBottom: '1.5rem', fontSize: '0.875rem',
        }}>
          <AlertCircle size={16} />
          {error}
          <button onClick={fetchAgendamentos} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', color: 'var(--brand-danger)' }}>
            Tentar novamente
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Calendário */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={prevMonth} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()) }} className="btn btn-outline btn-sm">
                Hoje
              </button>
              <button onClick={nextMonth} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {daysInMonth.map((day) => {
                const hasEvents = agendamentos.some((a) => isSameDay(parseISO(a.dataHora), day))
                const isSelected = isSameDay(day, selectedDate)
                const today = isToday(day)

                let bg = 'transparent'
                let border = '1px solid var(--border)'
                let color = 'inherit'

                if (isSelected) {
                  bg = 'var(--brand-primary)'
                  border = '1px solid var(--brand-primary)'
                  color = '#fff'
                } else if (today) {
                  border = '1px solid var(--brand-accent)'
                  color = 'var(--brand-accent)'
                }

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--radius)',
                      background: bg,
                      border: border,
                      color: color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: isSelected || today ? 600 : 400,
                      opacity: isSameMonth(day, currentDate) ? 1 : 0.3,
                      position: 'relative',
                    }}
                  >
                    {format(day, 'd')}
                    {hasEvents && !isSelected && (
                      <div style={{
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'var(--brand-accent)',
                        position: 'absolute', bottom: '6px',
                      }} />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Agendamentos do Dia */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>

          {loading ? (
            <Spinner />
          ) : visibleEvents.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              <Clock size={32} style={{ opacity: 0.2, margin: '0 auto 0.75rem auto', display: 'block' }} />
              <p style={{ fontSize: '0.875rem', margin: 0 }}>Nenhum paciente agendado para esta data.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {visibleEvents
                .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
                .map((evento) => (
                  <div
                    key={evento.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      borderLeft: '3px solid var(--brand-accent)',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-accent)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      <Clock size={14} />
                      {format(parseISO(evento.dataHora), 'HH:mm')}
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                        {evento.duracao} min
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                      <User size={14} color="var(--text-muted)" />
                      {evento.paciente?.nome}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
                      {evento.tipo}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            width: '100%', maxWidth: 540,
            animation: 'fade-in 0.2s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Novo Agendamento</h2>
              <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAgendamento} style={{ padding: '1.5rem' }}>
              {formError && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.875rem 1rem', borderRadius: 'var(--radius)',
                  background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)',
                  color: 'var(--brand-danger)', marginBottom: '1.25rem', fontSize: '0.875rem',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {formError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Paciente <span className="required">*</span></label>
                  <select
                    className="form-input"
                    value={formData.pacienteId}
                    onChange={(e) => setFormData((p) => ({ ...p, pacienteId: e.target.value }))}
                    required
                  >
                    <option value="">Selecione o paciente...</option>
                    {pacientes.map((p) => (
                      <option key={p.id} value={p.id}>{p.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Data <span className="required">*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.data}
                    onChange={(e) => setFormData((p) => ({ ...p, data: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora <span className="required">*</span></label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.hora}
                    onChange={(e) => setFormData((p) => ({ ...p, hora: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Consulta <span className="required">*</span></label>
                  <select
                    className="form-input"
                    value={formData.tipo}
                    onChange={(e) => setFormData((p) => ({ ...p, tipo: e.target.value }))}
                    required
                  >
                    {TIPOS_CONSULTA.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Duração (min)</label>
                  <select
                    className="form-input"
                    value={formData.duracao}
                    onChange={(e) => setFormData((p) => ({ ...p, duracao: Number(e.target.value) }))}
                  >
                    {[15, 30, 45, 60, 90, 120].map((d) => (
                      <option key={d} value={d}>{d} minutos</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) => setFormData((p) => ({ ...p, observacoes: e.target.value }))}
                    placeholder="Informações adicionais (opcional)"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Salvando...
                    </>
                  ) : (
                    <><Plus size={16} /> Confirmar Agendamento</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
