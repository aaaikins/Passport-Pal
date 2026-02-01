import { z } from 'zod';

export const TravelDataSchema = z.object({
  nationality: z.string().min(2, 'Nationality is required'),
  passportExpiration: z.string().min(1, 'Passport expiration date is required'),
  leavingFrom: z.string().min(2, 'Departure location is required'),
  goingTo: z.string().min(2, 'Destination is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  email: z.string().email('Invalid email address'),
  visaType: z.string().min(1, 'Visa type is required'),
  purposeOfTravel: z.string().min(2, 'Purpose of travel is required'),
  phoneNumber: z.string().optional(),
});

export type TravelData = z.infer<typeof TravelDataSchema>;

export interface ChecklistItem {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime?: string;
  links?: string[];
}

export interface AIResponse {
  checklist: ChecklistItem[];
  summary: string;
  warnings: string[];
  recommendations: string[];
  visaRequirements?: {
    required: boolean;
    processingTime?: string;
    fee?: string;
    applicationLink?: string;
  };
  riskScore?: number;
  compliance?: {
    compliant: boolean;
    issues: string[];
    score: number;
  };
}

export interface DocumentAnalysis {
  documentType: string;
  isValid: boolean;
  expirationDate?: string;
  confidence: number;
  warnings: string[];
}
