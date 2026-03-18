// =============================================================================
// Prontuário HOF — Cliente Google Calendar API v3
// Usa OAuth2 access token do usuário (não service account)
// Retorna null em caso de erro — NUNCA lança exceção
// =============================================================================

export interface GoogleCalendarEvent {
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string  // ISO 8601 ex: "2025-06-01T10:00:00-03:00"
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
  reminders?: {
    useDefault: boolean
    overrides?: Array<{ method: string; minutes: number }>
  }
}

interface GoogleCalendarEventResponse extends GoogleCalendarEvent {
  id: string
  htmlLink: string
  status: string
  created?: string
  updated?: string
}

interface GoogleCalendarEventListResponse {
  items?: GoogleCalendarEventResponse[]
  nextPageToken?: string
}

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'
const DEFAULT_CALENDAR_ID = 'primary'
const DEFAULT_TIMEZONE = 'America/Sao_Paulo'
const TIMEOUT_MS = 15_000

/**
 * Cria um evento no Google Calendar do usuário.
 * Retorna { id, link } em sucesso ou null em caso de erro.
 */
export async function createCalendarEvent(
  accessToken: string,
  event: GoogleCalendarEvent
): Promise<{ id: string; link: string } | null> {
  try {
    // Garantir timezone padrão se não fornecido
    const eventWithTz: GoogleCalendarEvent = {
      ...event,
      start: {
        timeZone: DEFAULT_TIMEZONE,
        ...event.start,
      },
      end: {
        timeZone: DEFAULT_TIMEZONE,
        ...event.end,
      },
    }

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${DEFAULT_CALENDAR_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(eventWithTz),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[GoogleCalendar] Erro ao criar evento:', response.status, errorBody)
      return null
    }

    const data: GoogleCalendarEventResponse = await response.json()

    return {
      id: data.id,
      link: data.htmlLink,
    }
  } catch (error) {
    console.error('[GoogleCalendar] Exceção ao criar evento:', error)
    return null
  }
}

/**
 * Lista eventos do Google Calendar do usuário em um intervalo de tempo.
 * Retorna array vazio em caso de erro.
 */
export async function getCalendarEvents(
  accessToken: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  try {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '100',
    })

    const response = await fetch(
      `${CALENDAR_API_BASE}/calendars/${DEFAULT_CALENDAR_ID}/events?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('[GoogleCalendar] Erro ao listar eventos:', response.status, errorBody)
      return []
    }

    const data: GoogleCalendarEventListResponse = await response.json()
    return (data.items ?? []) as GoogleCalendarEvent[]
  } catch (error) {
    console.error('[GoogleCalendar] Exceção ao listar eventos:', error)
    return []
  }
}
