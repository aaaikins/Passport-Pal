import { NextRequest, NextResponse } from 'next/server';
import { sendEmailWithChecklist } from '@/lib/notification-service';
import { z } from 'zod';

const EmailRequestSchema = z.object({
  email: z.string().email(),
  checklist: z.string(),
  userName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = EmailRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, checklist, userName } = validationResult.data;

    const result = await sendEmailWithChecklist(email, checklist, userName);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    );
  }
}
