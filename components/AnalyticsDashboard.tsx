'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock, Shield, AlertCircle } from 'lucide-react';
import { PredictiveAnalysis, OptimalTimeline } from '@/lib/ml-service';

interface AnalyticsDashboardProps {
  analysis: PredictiveAnalysis;
  timeline: OptimalTimeline;
  riskScore: number;
}

export default function AnalyticsDashboard({ analysis, timeline, riskScore }: AnalyticsDashboardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Success Probability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold">Success Probability</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(analysis.successProbability)}`}>
                {analysis.successProbability}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${getProgressBarColor(analysis.successProbability)}`}
                style={{ width: `${analysis.successProbability}%` }}
              />
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {Object.entries(analysis.riskFactors).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className={`font-semibold ${getScoreColor(value)}`}>
                    {Math.round(value)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getProgressBarColor(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Recommended Actions */}
      {analysis.recommendedActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-orange-50 border-2 border-orange-500 rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-semibold text-orange-900">Priority Actions</h3>
          </div>
          <ul className="space-y-3">
            {analysis.recommendedActions.map((action, index) => (
              <li key={index} className="flex items-start gap-3 text-orange-900">
                <span className="text-orange-600 font-bold text-lg">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Optimal Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold">Optimal Timeline</h3>
        </div>
        
        <div className="space-y-4">
          <TimelineItem
            date={timeline.startPreparation}
            label="Start Preparation"
            color="blue"
          />
          <TimelineItem
            date={timeline.applyForVisa}
            label="Apply for Visa"
            color="purple"
          />
          <TimelineItem
            date={timeline.bookFlight}
            label="Book Flight"
            color="green"
          />
          <TimelineItem
            date={timeline.finalChecklist}
            label="Final Checklist Review"
            color="orange"
          />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Estimated Preparation Time: {analysis.estimatedPreparationTime} days
            </span>
          </div>
        </div>
      </motion.div>

      {/* Overall Risk Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-xl shadow-lg p-6 ${
          riskScore >= 80 ? 'bg-green-50 border-2 border-green-500' :
          riskScore >= 60 ? 'bg-yellow-50 border-2 border-yellow-500' :
          'bg-red-50 border-2 border-red-500'
        }`}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Travel Readiness Score</h3>
          <div className={`text-6xl font-bold ${getScoreColor(riskScore)}`}>
            {riskScore}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {riskScore >= 80 ? '✓ Excellent - You\'re well prepared!' :
             riskScore >= 60 ? '⚠️ Good - A few things to address' :
             '⚠️ Attention Needed - Important actions required'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface TimelineItemProps {
  date: string;
  label: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

function TimelineItem({ date, label, color }: TimelineItemProps) {
  const colorClasses = {
    blue: 'bg-blue-500 border-blue-500',
    purple: 'bg-purple-500 border-purple-500',
    green: 'bg-green-500 border-green-500',
    orange: 'bg-orange-500 border-orange-500',
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`w-4 h-4 rounded-full ${colorClasses[color]}`} />
      <div className="flex-1">
        <div className="font-semibold text-gray-800">{label}</div>
        <div className="text-sm text-gray-600">{formatDate(date)}</div>
      </div>
    </div>
  );
}
