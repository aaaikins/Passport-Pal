'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import TravelForm from '@/components/TravelForm';
import ChecklistDisplay from '@/components/ChecklistDisplay';
import { AIResponse } from '@/lib/types';
import { Plane, Globe, Shield } from 'lucide-react';

export default function Home() {
  const [checklist, setChecklist] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChecklistGenerated = (response: AIResponse) => {
    setChecklist(response);
    setLoading(false);
  };

  const handleReset = () => {
    setChecklist(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="gradient-bg text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <Globe className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Passport Pal</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mt-2 text-blue-100"
          >
            Your AI-Powered Travel Document Assistant
          </motion.p>
        </div>
      </header>

      {/* Features Section */}
      {!checklist && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">Smart Checklists</h3>
              </div>
              <p className="text-gray-600">
                AI-generated personalized travel document checklists based on your specific trip details
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Compliance Check</h3>
              </div>
              <p className="text-gray-600">
                Automatic verification that your documents meet destination country requirements
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md card-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg">Real-time Updates</h3>
              </div>
              <p className="text-gray-600">
                Get notifications and reminders via email and WhatsApp before your departure
              </p>
            </div>
          </div>
        </motion.section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!checklist ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <TravelForm
              onChecklistGenerated={handleChecklistGenerated}
              setLoading={setLoading}
            />
          </motion.div>
        ) : (
          <ChecklistDisplay checklist={checklist} onReset={handleReset} />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Passport Pal - Powered by Advanced AI Technology
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Always verify requirements with official government sources
          </p>
        </div>
      </footer>
    </main>
  );
}
