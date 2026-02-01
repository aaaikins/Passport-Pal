import { NextRequest, NextResponse } from 'next/server';
import { TravelDataSchema } from '@/lib/types';
import { generateEnhancedChecklist, analyzeDocumentCompliance } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = TravelDataSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input data', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const travelData = validationResult.data;

    // Generate enhanced checklist with AI
    const aiResponse = await generateEnhancedChecklist(travelData);

    // Perform compliance analysis
    const complianceAnalysis = await analyzeDocumentCompliance(travelData);

    // Combine results
    const response = {
      ...aiResponse,
      compliance: complianceAnalysis,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating checklist:', error);
    return NextResponse.json(
      { error: 'Failed to generate checklist', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
