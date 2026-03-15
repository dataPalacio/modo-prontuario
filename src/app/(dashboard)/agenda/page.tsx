'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const eventosMock = [
  { id: 1, date: new Date(2025, 2, 14, 10, 0), paciente: 'Maria Silva Santos', procedimento: 'Toxina Botulínica' },
  { id: 2, date: new Date(2025, 2, 14, 14, 30), paciente: 'João Carlos Oliveira', procedimento: 'Preenchimento Labial' },
  { id: 3, date: new Date(2025, 2, 15, 9, 15), paciente: 'Ana Beatriz Lima', procedimento: 'Fios PDO' },
]

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 14)) // Usando fixed date for mock matching
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 14))

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  // Agendamentos do dia selecionado
  const selectedDayEvents = eventosMock.filter(e => isSameDay(e.date, selectedDate))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Agenda</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Gerenciamento de consultas e retornos
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Novo Agendamento
        </button>
      </div>

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
              <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline btn-sm">Hoje</button>
              <button onClick={nextMonth} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {/* Espaços vazios antes do dia 1 */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
               <div key={`empty-${i}`} />
            ))}

            {daysInMonth.map((day) => {
              const hasEvents = eventosMock.some(e => isSameDay(e.date, day))
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
                    position: 'relative'
                  }}
                >
                  {format(day, 'd')}
                  {hasEvents && !isSelected && (
                    <div style={{ 
                      width: 4, height: 4, borderRadius: '50%', 
                      background: 'var(--brand-accent)', 
                      position: 'absolute', bottom: '6px' 
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Agendamentos do Dia */}
        <div className="card" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>

          {selectedDayEvents.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>☕</p>
              <p style={{ fontSize: '0.875rem' }}>Nenhum paciente agendado para esta data.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedDayEvents.map(evento => (
                <div key={evento.id} style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)',
                  borderLeft: '3px solid var(--brand-accent)',
                  background: 'var(--bg-card)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-accent)', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <Clock size={14} />
                    {format(evento.date, 'HH:mm')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                    <User size={14} color="var(--text-muted)" />
                    {evento.paciente}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.5rem' }}>
                    {evento.procedimento}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
