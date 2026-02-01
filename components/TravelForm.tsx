'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Send } from 'lucide-react';
import { TravelData, AIResponse } from '@/lib/types';

interface TravelFormProps {
  onChecklistGenerated: (response: AIResponse) => void;
  setLoading: (loading: boolean) => void;
}

export default function TravelForm({ onChecklistGenerated, setLoading }: TravelFormProps) {
  const [formData, setFormData] = useState<Partial<TravelData>>({
    nationality: '',
    passportExpiration: '',
    leavingFrom: '',
    goingTo: '',
    departureDate: '',
    email: '',
    visaType: '',
    purposeOfTravel: '',
    phoneNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nationality || formData.nationality.length < 2) {
      newErrors.nationality = 'Nationality is required';
    }
    if (!formData.passportExpiration) {
      newErrors.passportExpiration = 'Passport expiration date is required';
    }
    if (!formData.leavingFrom || formData.leavingFrom.length < 2) {
      newErrors.leavingFrom = 'Departure location is required';
    }
    if (!formData.goingTo || formData.goingTo.length < 2) {
      newErrors.goingTo = 'Destination is required';
    }
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.visaType) {
      newErrors.visaType = 'Visa type is required';
    }
    if (!formData.purposeOfTravel || formData.purposeOfTravel.length < 2) {
      newErrors.purposeOfTravel = 'Purpose of travel is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      const response = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate checklist');
      }

      const data = await response.json();
      onChecklistGenerated(data);

      // Schedule WhatsApp reminder if phone number provided
      if (formData.phoneNumber && formData.departureDate) {
        fetch('/api/whatsapp-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            departureDate: formData.departureDate,
            travelDetails: `Trip to ${formData.goingTo}`,
          }),
        }).catch(console.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate checklist. Please try again.');
      setLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = (fieldName: string) =>
    `w-full px-4 py-3 border ${
      errors[fieldName] ? 'border-red-500' : 'border-gray-300'
    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Travel Information
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
              Nationality *
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className={inputClasses('nationality')}
              placeholder="e.g., United States"
            />
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-500">{errors.nationality}</p>
            )}
          </div>

          {/* Passport Expiration */}
          <div>
            <label htmlFor="passportExpiration" className="block text-sm font-medium text-gray-700 mb-2">
              Passport Expiration Date *
            </label>
            <input
              type="date"
              id="passportExpiration"
              name="passportExpiration"
              value={formData.passportExpiration}
              onChange={handleChange}
              className={inputClasses('passportExpiration')}
            />
            {errors.passportExpiration && (
              <p className="mt-1 text-sm text-red-500">{errors.passportExpiration}</p>
            )}
          </div>

          {/* Leaving From */}
          <div>
            <label htmlFor="leavingFrom" className="block text-sm font-medium text-gray-700 mb-2">
              Leaving From *
            </label>
            <input
              type="text"
              id="leavingFrom"
              name="leavingFrom"
              value={formData.leavingFrom}
              onChange={handleChange}
              className={inputClasses('leavingFrom')}
              placeholder="e.g., New York, USA"
            />
            {errors.leavingFrom && (
              <p className="mt-1 text-sm text-red-500">{errors.leavingFrom}</p>
            )}
          </div>

          {/* Going To */}
          <div>
            <label htmlFor="goingTo" className="block text-sm font-medium text-gray-700 mb-2">
              Going To *
            </label>
            <input
              type="text"
              id="goingTo"
              name="goingTo"
              value={formData.goingTo}
              onChange={handleChange}
              className={inputClasses('goingTo')}
              placeholder="e.g., London, UK"
            />
            {errors.goingTo && (
              <p className="mt-1 text-sm text-red-500">{errors.goingTo}</p>
            )}
          </div>

          {/* Departure Date */}
          <div>
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-2">
              Departure Date *
            </label>
            <input
              type="date"
              id="departureDate"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              className={inputClasses('departureDate')}
            />
            {errors.departureDate && (
              <p className="mt-1 text-sm text-red-500">{errors.departureDate}</p>
            )}
          </div>

          {/* Visa Type */}
          <div>
            <label htmlFor="visaType" className="block text-sm font-medium text-gray-700 mb-2">
              Visa Type *
            </label>
            <select
              id="visaType"
              name="visaType"
              value={formData.visaType}
              onChange={handleChange}
              className={inputClasses('visaType')}
            >
              <option value="">Select visa type</option>
              <option value="Tourist">Tourist</option>
              <option value="Student">Student (F-1)</option>
              <option value="Work">Work (H-1B)</option>
              <option value="Business">Business</option>
              <option value="Transit">Transit</option>
              <option value="No Visa Required">No Visa Required</option>
              <option value="Other">Other</option>
            </select>
            {errors.visaType && (
              <p className="mt-1 text-sm text-red-500">{errors.visaType}</p>
            )}
          </div>

          {/* Purpose of Travel */}
          <div>
            <label htmlFor="purposeOfTravel" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose of Travel *
            </label>
            <input
              type="text"
              id="purposeOfTravel"
              name="purposeOfTravel"
              value={formData.purposeOfTravel}
              onChange={handleChange}
              className={inputClasses('purposeOfTravel')}
              placeholder="e.g., Tourism, Education, Business"
            />
            {errors.purposeOfTravel && (
              <p className="mt-1 text-sm text-red-500">{errors.purposeOfTravel}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses('email')}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone Number (Optional) */}
          <div className="md:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (WhatsApp) - Optional
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={inputClasses('phoneNumber')}
              placeholder="+1234567890"
            />
            <p className="mt-1 text-sm text-gray-500">
              Receive travel reminders via WhatsApp
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          className={`w-full py-4 px-6 rounded-lg text-white font-semibold text-lg flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'gradient-bg hover:shadow-lg transition-all'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Your Checklist...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Generate Travel Checklist
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
