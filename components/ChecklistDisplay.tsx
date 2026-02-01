'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Mail,
  Download,
  RefreshCw,
  Shield,
  Clock,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { AIResponse, ChecklistItem } from '@/lib/types';

interface ChecklistDisplayProps {
  checklist: AIResponse;
  onReset: () => void;
}

export default function ChecklistDisplay({ checklist, onReset }: ChecklistDisplayProps) {
  const [emailSent, setEmailSent] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      const checklistText = checklist.checklist
        .map((item) => `${item.text}`)
        .join('\n');

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@example.com', // This should come from form data
          checklist: checklistText,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 3000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDownload = () => {
    const checklistText = checklist.checklist
      .map((item, index) => `${index + 1}. ${item.text}`)
      .join('\n\n');

    const fullText = `
PASSPORT PAL - TRAVEL CHECKLIST
================================

${checklist.summary}

CHECKLIST ITEMS:
${checklistText}

${
  checklist.warnings?.length
    ? `\nWARNINGS:\n${checklist.warnings.map((w) => `⚠️ ${w}`).join('\n')}`
    : ''
}

${
  checklist.recommendations?.length
    ? `\nRECOMMENDATIONS:\n${checklist.recommendations.map((r) => `💡 ${r}`).join('\n')}`
    : ''
}

Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'travel-checklist.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Travel Checklist</h2>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              emailSent
                ? 'bg-green-600 text-white'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            <Mail className="w-4 h-4" />
            {emailSent ? 'Sent!' : sendingEmail ? 'Sending...' : 'Email Me'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            New Search
          </motion.button>
        </div>
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl shadow-lg mb-6"
      >
        <div className="flex items-start gap-4">
          <Sparkles className="w-8 h-8 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">AI Summary</h3>
            <p className="text-blue-50">{checklist.summary}</p>
          </div>
          {checklist.riskScore !== undefined && (
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{checklist.riskScore}</div>
              <div className="text-sm">Readiness Score</div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Compliance Analysis */}
      {checklist.compliance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-6 rounded-xl shadow-lg mb-6 ${
            checklist.compliance.compliant
              ? 'bg-green-50 border-2 border-green-500'
              : 'bg-red-50 border-2 border-red-500'
          }`}
        >
          <div className="flex items-start gap-4">
            <Shield className={`w-6 h-6 ${checklist.compliance.compliant ? 'text-green-600' : 'text-red-600'}`} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {checklist.compliance.compliant ? 'Documents Compliant ✓' : 'Compliance Issues Found'}
              </h3>
              {checklist.compliance.issues && checklist.compliance.issues.length > 0 && (
                <ul className="space-y-1">
                  {checklist.compliance.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      • {issue}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2">
                <span className={`text-sm font-medium ${getRiskScoreColor(checklist.compliance.score)}`}>
                  Compliance Score: {checklist.compliance.score}/100
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warnings */}
      {checklist.warnings && checklist.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md mb-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Warnings</h3>
              <ul className="space-y-2">
                {checklist.warnings.map((warning, index) => (
                  <li key={index} className="text-yellow-800 text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Visa Requirements */}
      {checklist.visaRequirements && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border-2 border-blue-500 p-6 rounded-xl shadow-md mb-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Visa Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-900">Required:</span>{' '}
              <span className={checklist.visaRequirements.required ? 'text-red-600' : 'text-green-600'}>
                {checklist.visaRequirements.required ? 'Yes' : 'No'}
              </span>
            </div>
            {checklist.visaRequirements.processingTime && (
              <div>
                <span className="font-medium text-blue-900">Processing Time:</span>{' '}
                <span className="text-blue-800">{checklist.visaRequirements.processingTime}</span>
              </div>
            )}
            {checklist.visaRequirements.fee && (
              <div>
                <span className="font-medium text-blue-900">Fee:</span>{' '}
                <span className="text-blue-800">{checklist.visaRequirements.fee}</span>
              </div>
            )}
            {checklist.visaRequirements.applicationLink && (
              <div className="md:col-span-2">
                <a
                  href={checklist.visaRequirements.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  Apply Online <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Checklist Items */}
      <div className="space-y-4 mb-6">
        {checklist.checklist.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.05 }}
            className={`p-5 rounded-xl shadow-md border-l-4 ${getPriorityColor(item.priority)}`}
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityBadgeColor(item.priority)}`}>
                    {item.priority.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                    {item.category}
                  </span>
                  {item.estimatedTime && (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      {item.estimatedTime}
                    </span>
                  )}
                </div>
                <p className="text-gray-800 font-medium">{item.text}</p>
                {item.links && item.links.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.links.map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                      >
                        Official Link <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recommendations */}
      {checklist.recommendations && checklist.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 border-2 border-green-500 p-6 rounded-xl shadow-md"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Smart Recommendations
          </h3>
          <ul className="space-y-2">
            {checklist.recommendations.map((rec, index) => (
              <li key={index} className="text-green-800 text-sm flex items-start gap-2">
                <span className="text-green-600 font-bold">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}
