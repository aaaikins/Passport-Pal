import OpenAI from 'openai';
import { TravelData, AIResponse, ChecklistItem } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEnhancedChecklist(data: TravelData): Promise<AIResponse> {
  const currentDate = new Date();
  const passportExpiry = new Date(data.passportExpiration);
  const departure = new Date(data.departureDate);
  const daysUntilDeparture = Math.ceil((departure.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthsUntilPassportExpiry = Math.ceil((passportExpiry.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  const systemPrompt = `You are an advanced AI travel advisor with expertise in international travel regulations, visa requirements, and document verification. Provide comprehensive, accurate, and up-to-date travel guidance.`;

  const userPrompt = `
Analyze this travel scenario and provide a detailed response:

Traveler Profile:
- Nationality: ${data.nationality}
- Passport Expiration: ${data.passportExpiration} (${monthsUntilPassportExpiry} months from now)
- Departure: ${data.leavingFrom} → ${data.goingTo}
- Departure Date: ${data.departureDate} (${daysUntilDeparture} days from now)
- Visa Type: ${data.visaType}
- Purpose: ${data.purposeOfTravel}

Provide a JSON response with:
1. A detailed checklist with items categorized by priority (high/medium/low) and category (visa, passport, health, insurance, customs, etc.)
2. Each item should include estimated time to complete if applicable
3. Relevant official links for document applications
4. A summary of critical actions
5. Warnings about potential issues (e.g., passport validity requirements, visa processing times)
6. Personalized recommendations based on the trip profile
7. Visa requirements analysis with processing time and fees if applicable
8. A risk assessment score (0-100) based on document status and timing

Format your response as a JSON object matching this structure:
{
  "checklist": [
    {
      "id": "unique-id",
      "text": "Clear actionable item",
      "priority": "high|medium|low",
      "category": "visa|passport|health|insurance|customs|general",
      "estimatedTime": "e.g., 2-3 weeks",
      "links": ["https://official-link.gov"]
    }
  ],
  "summary": "Brief overview of what traveler needs to do",
  "warnings": ["Critical warning messages"],
  "recommendations": ["Helpful suggestions"],
  "visaRequirements": {
    "required": true/false,
    "processingTime": "e.g., 5-10 business days",
    "fee": "e.g., $160 USD",
    "applicationLink": "https://..."
  },
  "riskScore": 0-100
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const response: AIResponse = JSON.parse(content);
    
    // Validate and enhance response
    if (!response.checklist || response.checklist.length === 0) {
      throw new Error('Invalid AI response: missing checklist');
    }

    return response;
  } catch (error) {
    console.error('Error generating checklist:', error);
    throw new Error('Failed to generate travel checklist. Please try again.');
  }
}

export async function analyzeDocumentCompliance(
  data: TravelData,
  additionalContext?: string
): Promise<{ compliant: boolean; issues: string[]; score: number }> {
  const systemPrompt = `You are a travel compliance analyzer. Evaluate if the traveler's documents meet requirements for their destination.`;

  const userPrompt = `
Analyze document compliance for:
- ${data.nationality} citizen traveling to ${data.goingTo}
- Passport expires: ${data.passportExpiration}
- Departure: ${data.departureDate}
- Visa type: ${data.visaType}
${additionalContext ? `\nAdditional context: ${additionalContext}` : ''}

Provide JSON:
{
  "compliant": true/false,
  "issues": ["list of compliance issues"],
  "score": 0-100 (compliance score)
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing compliance:', error);
    return {
      compliant: false,
      issues: ['Unable to analyze compliance at this time'],
      score: 0,
    };
  }
}

export async function generateSmartRecommendations(
  data: TravelData,
  userHistory?: any[]
): Promise<string[]> {
  const systemPrompt = `You are a personalized travel assistant. Provide smart, actionable recommendations.`;

  const userPrompt = `
Generate 5-7 personalized travel recommendations for:
- Trip: ${data.leavingFrom} → ${data.goingTo}
- Purpose: ${data.purposeOfTravel}
- Nationality: ${data.nationality}
${userHistory ? `\n- Previous trips: ${JSON.stringify(userHistory)}` : ''}

Provide JSON array of recommendation strings:
{
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return [];
    }

    const parsed = JSON.parse(content);
    return parsed.recommendations || [];
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}
