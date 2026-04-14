import { TravelData, AIResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

export async function generateChecklist(data: TravelData): Promise<AIResponse> {
  return post<AIResponse>('/api/generate-checklist', data);
}

export async function sendEmail(
  email: string,
  checklist: string,
  userName?: string
): Promise<{ success: boolean; message: string }> {
  return post('/api/send-email', { email, checklist, userName });
}

export async function scheduleWhatsAppReminder(
  phoneNumber: string,
  departureDate: string,
  travelDetails: string
): Promise<{ success: boolean; message: string }> {
  return post('/api/whatsapp-reminder', { phoneNumber, departureDate, travelDetails });
}
