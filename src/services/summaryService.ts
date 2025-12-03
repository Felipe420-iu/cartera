import { api } from './api';
import { Summary, CalendarEvent } from '../types';

export const summaryService = {
  // Obtener resumen general
  async getSummary(): Promise<Summary> {
    const response = await api.get('/api/summary');
    return response.data;
  },

  // Obtener datos del calendario
  async getCalendarData(): Promise<CalendarEvent[]> {
    const response = await api.get('/api/summary/calendar');
    return response.data;
  }
};