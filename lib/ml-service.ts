import * as tf from '@tensorflow/tfjs';
import { TravelData } from './types';

/**
 * Machine Learning service for predictive analytics and risk assessment
 */

export interface RiskFactors {
  passportValidity: number;
  timeUntilDeparture: number;
  visaComplexity: number;
  destinationRisk: number;
  documentCompleteness: number;
}

export interface PredictiveAnalysis {
  successProbability: number;
  recommendedActions: string[];
  riskFactors: RiskFactors;
  estimatedPreparationTime: number;
}

/**
 * Calculate risk score using weighted factors
 */
export function calculateRiskScore(data: TravelData): number {
  const currentDate = new Date();
  const passportExpiry = new Date(data.passportExpiration);
  const departure = new Date(data.departureDate);

  // Days until departure
  const daysUntilDeparture = Math.ceil((departure.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Months until passport expiry
  const monthsUntilExpiry = Math.ceil((passportExpiry.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  // Risk factors (0-100 scale)
  let riskScore = 100;

  // Passport validity risk (most destinations require 6 months)
  if (monthsUntilExpiry < 6) {
    riskScore -= 40;
  } else if (monthsUntilExpiry < 12) {
    riskScore -= 20;
  }

  // Time until departure risk
  if (daysUntilDeparture < 7) {
    riskScore -= 30;
  } else if (daysUntilDeparture < 30) {
    riskScore -= 15;
  } else if (daysUntilDeparture < 60) {
    riskScore -= 5;
  }

  // Visa complexity risk
  const highComplexityVisas = ['Student', 'Work', 'Business'];
  if (highComplexityVisas.some(v => data.visaType.includes(v))) {
    if (daysUntilDeparture < 60) {
      riskScore -= 20;
    } else if (daysUntilDeparture < 90) {
      riskScore -= 10;
    }
  }

  return Math.max(0, Math.min(100, riskScore));
}

/**
 * Perform predictive analysis on travel preparation
 */
export async function performPredictiveAnalysis(data: TravelData): Promise<PredictiveAnalysis> {
  const currentDate = new Date();
  const passportExpiry = new Date(data.passportExpiration);
  const departure = new Date(data.departureDate);

  const daysUntilDeparture = Math.ceil((departure.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  const monthsUntilExpiry = Math.ceil((passportExpiry.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

  // Calculate individual risk factors
  const riskFactors: RiskFactors = {
    passportValidity: monthsUntilExpiry >= 6 ? 100 : (monthsUntilExpiry / 6) * 100,
    timeUntilDeparture: Math.min(100, (daysUntilDeparture / 90) * 100),
    visaComplexity: getVisaComplexityScore(data.visaType),
    destinationRisk: 75, // This could be enhanced with real-time data
    documentCompleteness: 85, // This would be calculated based on uploaded documents
  };

  // Calculate success probability
  const weights = {
    passportValidity: 0.25,
    timeUntilDeparture: 0.25,
    visaComplexity: 0.20,
    destinationRisk: 0.15,
    documentCompleteness: 0.15,
  };

  const successProbability = Object.entries(riskFactors).reduce(
    (acc, [key, value]) => acc + value * weights[key as keyof RiskFactors],
    0
  );

  // Generate recommended actions
  const recommendedActions: string[] = [];

  if (riskFactors.passportValidity < 60) {
    recommendedActions.push('🚨 Renew your passport immediately - many countries require 6 months validity');
  }

  if (riskFactors.timeUntilDeparture < 50) {
    recommendedActions.push('⏰ Expedite visa processing if possible - time is limited');
  }

  if (riskFactors.visaComplexity < 60) {
    recommendedActions.push('📋 Consider hiring an immigration consultant for complex visa types');
  }

  if (successProbability < 70) {
    recommendedActions.push('💡 Consider travel insurance with trip cancellation coverage');
  }

  // Estimate preparation time in days
  const estimatedPreparationTime = estimatePreparationTime(data, riskFactors);

  return {
    successProbability: Math.round(successProbability),
    recommendedActions,
    riskFactors,
    estimatedPreparationTime,
  };
}

function getVisaComplexityScore(visaType: string): number {
  const complexityMap: Record<string, number> = {
    'No Visa Required': 100,
    'Tourist': 80,
    'Transit': 85,
    'Business': 60,
    'Student': 40,
    'Work': 35,
    'Other': 70,
  };

  return complexityMap[visaType] || 70;
}

function estimatePreparationTime(data: TravelData, riskFactors: RiskFactors): number {
  let days = 0;

  // Base preparation time
  days += 7;

  // Add time based on visa complexity
  if (riskFactors.visaComplexity < 50) {
    days += 60; // Complex visas take longer
  } else if (riskFactors.visaComplexity < 70) {
    days += 30;
  } else if (riskFactors.visaComplexity < 90) {
    days += 14;
  }

  // Add time if passport needs renewal
  if (riskFactors.passportValidity < 60) {
    days += 45; // Passport renewal time
  }

  // Add buffer for document gathering
  days += 7;

  return days;
}

/**
 * Analyze travel patterns to provide personalized insights
 */
export interface TravelPattern {
  frequentDestinations: string[];
  averageLeadTime: number;
  preferredTravelPurpose: string;
  complianceHistory: number;
}

export function analyzeTravelPatterns(previousTrips: TravelData[]): TravelPattern | null {
  if (previousTrips.length === 0) return null;

  const destinations: Record<string, number> = {};
  let totalLeadTime = 0;
  const purposes: Record<string, number> = {};

  previousTrips.forEach(trip => {
    destinations[trip.goingTo] = (destinations[trip.goingTo] || 0) + 1;
    purposes[trip.purposeOfTravel] = (purposes[trip.purposeOfTravel] || 0) + 1;

    const departure = new Date(trip.departureDate);
    const leadTime = Math.ceil((departure.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    totalLeadTime += leadTime;
  });

  const frequentDestinations = Object.entries(destinations)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([dest]) => dest);

  const preferredTravelPurpose = Object.entries(purposes)
    .sort(([, a], [, b]) => b - a)[0][0];

  return {
    frequentDestinations,
    averageLeadTime: Math.round(totalLeadTime / previousTrips.length),
    preferredTravelPurpose,
    complianceHistory: 85, // This would be calculated from actual compliance data
  };
}

/**
 * Generate time-series prediction for optimal booking/preparation dates
 */
export interface OptimalTimeline {
  startPreparation: string;
  bookFlight: string;
  applyForVisa: string;
  finalChecklist: string;
}

export function generateOptimalTimeline(departureDate: string, visaType: string): OptimalTimeline {
  const departure = new Date(departureDate);
  
  // Visa application timing
  const visaProcessingDays = visaType.includes('Student') || visaType.includes('Work') ? 90 : 
                             visaType.includes('Business') ? 60 :
                             visaType === 'No Visa Required' ? 0 : 30;

  const applyForVisa = new Date(departure);
  applyForVisa.setDate(applyForVisa.getDate() - visaProcessingDays - 14); // Add buffer

  // Flight booking (typically 6-8 weeks before for best prices)
  const bookFlight = new Date(departure);
  bookFlight.setDate(bookFlight.getDate() - 45);

  // Start preparation
  const startPreparation = new Date(departure);
  startPreparation.setDate(startPreparation.getDate() - (visaProcessingDays + 30));

  // Final checklist review
  const finalChecklist = new Date(departure);
  finalChecklist.setDate(finalChecklist.getDate() - 3);

  return {
    startPreparation: startPreparation.toISOString().split('T')[0],
    bookFlight: bookFlight.toISOString().split('T')[0],
    applyForVisa: applyForVisa.toISOString().split('T')[0],
    finalChecklist: finalChecklist.toISOString().split('T')[0],
  };
}
