import { NextRequest, NextResponse } from 'next/server';
import { scheduleWhatsAppReminder } from '@/lib/notification-service';
import { z } from 'zod';

const WhatsAppRequestSchema = z.object({
  phoneNumber: z.string().min(10),
  departureDate: z.string(),
  travelDetails: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = WhatsAppRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { phoneNumber, departureDate, travelDetails } = validationResult.data;

    const result = await scheduleWhatsAppReminder(phoneNumber, departureDate, travelDetails);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error scheduling WhatsApp reminder:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to schedule reminder' },
      { status: 500 }
    );
  }
}
