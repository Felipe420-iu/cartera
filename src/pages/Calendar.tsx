import React, { useEffect, useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { CalendarIcon, EyeIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { summaryService } from '../services/summaryService'
import { loanService } from '../services/loanService'
import { CalendarEvent, InstallmentStatus } from '../types'
import { formatCurrency, formatDate } from '../utils/format'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    loadCalendarData()
  }, [])

  const loadCalendarData = async () => {
    try {
      setLoading(true)
      const data = await summaryService.getCalendarData()
      setEvents(data)
    } catch (error: any) {
      toast.error('Error al cargar el calendario: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (eventInfo: any) => {
    const event = events.find(e => e.id === eventInfo.event.id)
    if (event) {
      setSelectedEvent(event)
      setShowEventModal(true)
    }
  }

  const handlePayInstallment = async (installmentId: number) => {
    if (!window.confirm('¿Confirmar el pago de esta cuota?')) {
      return
    }

    try {
      await loanService.payInstallment(installmentId)
      toast.success('Cuota pagada exitosamente')
      setShowEventModal(false)
      setSelectedEvent(null)
      await loadCalendarData()
    } catch (error: any) {
      toast.error('Error al procesar el pago: ' + error.message)
    }
  }

  const getStatusColor = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'text-green-600 bg-green-50'
      case InstallmentStatus.OVERDUE:
        return 'text-red-600 bg-red-50'
      default:
        return 'text-blue-600 bg-blue-50'
    }
  }

  const getStatusText = (status: InstallmentStatus) => {
    switch (status) {
      case InstallmentStatus.PAID:
        return 'Pagada'
      case InstallmentStatus.OVERDUE:
        return 'Vencida'
      default:
        return 'Pendiente'
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-primary-600" />
            Calendario de Pagos
          </h1>
          <p className="text-gray-600">Visualiza todas las cuotas organizadas por fecha de vencimiento</p>
        </div>
        <button onClick={loadCalendarData} className="btn-secondary">
          Actualizar
        </button>
      </div>

      {/* Legend */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cuotas Pagadas</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cuotas Pendientes</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">Cuotas Vencidas</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana'
          }}
          events={events}
          eventClick={handleEventClick}
          eventDisplay="block"
          height="auto"
          dayMaxEvents={3}
          moreLinkText="más"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: false
          }}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {events.filter(e => e.extendedProps.status === InstallmentStatus.PAID).length}
          </div>
          <div className="text-gray-600">Cuotas Pagadas</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {events.filter(e => e.extendedProps.status === InstallmentStatus.PENDING).length}
          </div>
          <div className="text-gray-600">Cuotas Pendientes</div>
        </div>
        
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {events.filter(e => e.extendedProps.status === InstallmentStatus.OVERDUE).length}
          </div>
          <div className="text-gray-600">Cuotas Vencidas</div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detalles de la Cuota</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cliente</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedEvent.extendedProps.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número de Cuota</label>
                    <p className="text-gray-900">#{selectedEvent.extendedProps.installmentNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedEvent.extendedProps.status)}`}>
                      {getStatusText(selectedEvent.extendedProps.status)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto de la Cuota</label>
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(selectedEvent.extendedProps.amount)}
                  </p>
                </div>

                {selectedEvent.extendedProps.overdueInterest > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interés por Mora</label>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrency(selectedEvent.extendedProps.overdueInterest)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                  <p className="text-gray-900">{formatDate(selectedEvent.start)}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="btn-secondary"
                >
                  Cerrar
                </button>
                
                {selectedEvent.extendedProps.status !== InstallmentStatus.PAID && (
                  <button
                    onClick={() => handlePayInstallment(parseInt(selectedEvent.id))}
                    className="btn-primary flex items-center"
                  >
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Marcar como Pagada
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar