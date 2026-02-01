import { NextRequest, NextResponse } from 'next/server';
import { TravelDataSchema } from '@/lib/types';
import { 
  performPredictiveAnalysis, 
  calculateRiskScore,
  generateOptimalTimeline 
} from '@/lib/ml-service';

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

    // Perform comprehensive analysis
    const predictiveAnalysis = await performPredictiveAnalysis(travelData);
    const riskScore = calculateRiskScore(travelData);
    const optimalTimeline = generateOptimalTimeline(
      travelData.departureDate,
      travelData.visaType
    );

    const response = {
      riskScore,
      predictiveAnalysis,
      optimalTimeline,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error performing analysis:', error);
    return NextResponse.json(
      { error: 'Failed to perform analysis' },
      { status: 500 }
    );
  }
}
