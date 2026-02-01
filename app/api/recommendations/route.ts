import { NextRequest, NextResponse } from 'next/server';
import { generateSmartRecommendations } from '@/lib/ai-service';
import { TravelDataSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validationResult = TravelDataSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const travelData = validationResult.data;
    const recommendations = await generateSmartRecommendations(travelData);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
