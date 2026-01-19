'use client';

import { useState } from 'react';
import type { ResearchRuleParams } from '@/lib/types';

interface ResearchRuleModalProps {
    onGenerate: (params: ResearchRuleParams) => void;
    onClose: () => void;
}

export default function ResearchRuleModal({ onGenerate, onClose }: ResearchRuleModalProps) {
    const [objective, setObjective] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [includeIntentSignals, setIncludeIntentSignals] = useState(true);
    const [spendAnalysis, setSpendAnalysis] = useState(false);
    const [technologyFilters, setTechnologyFilters] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const params: ResearchRuleParams = {
            objective,
            targetAudience,
            includeIntentSignals,
            spendAnalysis,
            technologyFilters: technologyFilters
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0),
        };

        onGenerate(params);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Generate Research Rule</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Objective *
                        </label>
                        <textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="e.g., Find enterprise SaaS companies using Salesforce with recent intent signals"
                            required
                            rows={3}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Target Audience *
                        </label>
                        <input
                            type="text"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            placeholder="e.g., Enterprise AE team, SDRs, Marketing team"
                            required
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Technology Filters
                        </label>
                        <input
                            type="text"
                            value={technologyFilters}
                            onChange={(e) => setTechnologyFilters(e.target.value)}
                            placeholder="e.g., Salesforce, AWS, Azure (comma-separated)"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-400 mt-1">Comma-separated list of technologies</p>
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeIntentSignals}
                                onChange={(e) => setIncludeIntentSignals(e.target.checked)}
                                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">Include Intent Signals</span>
                        </label>

                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={spendAnalysis}
                                onChange={(e) => setSpendAnalysis(e.target.checked)}
                                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm">Spend Analysis</span>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={!objective || !targetAudience}
                            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            Generate Research Rule
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
