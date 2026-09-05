import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Tractor,
  Car,
  HeartPulse,
  Droplets,
  TreePine,
  Waves,
  Flame,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { SectorImpact, ClimateAnalysisResponse } from '../../types/weather';
import { ProvenanceBadge } from './ProvenanceBadge';
import { fetchAIBriefing } from '../../services/weatherApi';

interface PredictedEffectsCardProps {
  analysis: ClimateAnalysisResponse;
  isDark: boolean;
}

export const PredictedEffectsCard: React.FC<PredictedEffectsCardProps> = ({ analysis, isDark }) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'ai_briefing'>('matrix');
  const [selectedSector, setSelectedSector] = useState<string>('agriculture');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const impacts = analysis.sectorImpacts;

  const getSectorIcon = (sector: SectorImpact['sector']) => {
    switch (sector) {
      case 'agriculture':
        return <Tractor className="w-4 h-4 text-emerald-500" />;
      case 'transportation':
        return <Car className="w-4 h-4 text-sky-500" />;
      case 'health':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'outdoor':
        return <TreePine className="w-4 h-4 text-amber-500" />;
      case 'flooding':
        return <Waves className="w-4 h-4 text-cyan-500" />;
      case 'drought':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSeverityBadge = (severity: SectorImpact['severity']) => {
    switch (severity) {
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Low Risk
          </span>
        );
      case 'moderate':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
            Moderate
          </span>
        );
      case 'elevated':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Elevated
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            High Warning
          </span>
        );
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            Critical Risk
          </span>
        );
    }
  };

  const currentSectorData = impacts.find((i) => i.sector === selectedSector) || impacts[0];

  const handleGenerateAIBriefing = async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    try {
      const res = await fetchAIBriefing(analysis);
      setAiReport(res.text);
      setActiveTab('ai_briefing');
    } catch (err: any) {
      setAiError(err.message || 'Failed to synthesize AI briefing.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopy = () => {
    if (!aiReport) return;
    navigator.clipboard.writeText(aiReport);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all ${
      isDark
        ? 'bg-slate-900/80 border-slate-800/80 shadow-lg shadow-black/20'
        : 'bg-white/90 border-slate-200/90 shadow-sm'
    }`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold tracking-tight">Predicted Weather Effects & Domain Impacts</h3>
            <ProvenanceBadge type="statistical" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assessing operational vulnerabilities for agriculture, transport, healthcare, municipal water, and flooding
          </p>
        </div>

        {/* View Tabs & AI Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'matrix'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sector Matrix
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ai_briefing');
                if (!aiReport && !isGeneratingAI) {
                  handleGenerateAIBriefing();
                }
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'ai_briefing'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-amber-500 dark:hover:text-amber-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Climate Report</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <div className="space-y-5">
          {/* Sector Navigation Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {impacts.map((item) => {
              const isSelected = item.sector === selectedSector;
              return (
                <button
                  key={item.sector}
                  type="button"
                  onClick={() => setSelectedSector(item.sector)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 border-sky-500 shadow-xs'
                      : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-1 rounded-lg bg-slate-200/50 dark:bg-slate-700/50">
                      {getSectorIcon(item.sector)}
                    </span>
                    {getSeverityBadge(item.severity)}
                  </div>
                  <div className="text-xs font-semibold truncate text-slate-800 dark:text-slate-200">
                    {item.title.split('&')[0]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Sector Card */}
          {currentSectorData && (
            <div className={`p-5 rounded-2xl border transition-all ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/60'
                : 'bg-slate-50/80 border-slate-200/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-white dark:bg-slate-700 shadow-xs">
                    {getSectorIcon(currentSectorData.sector)}
                  </span>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentSectorData.title}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Primary Driving Indicator: <strong className="text-sky-500">{currentSectorData.primaryMetric} = {currentSectorData.metricValue}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ProvenanceBadge type="statistical" size="sm" />
                  {getSeverityBadge(currentSectorData.severity)}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {/* Summary */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Synoptic Impact Assessment
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {currentSectorData.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Risks */}
                  <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Potential Vulnerabilities & Risks</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {currentSectorData.keyRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Strategic Mitigation Recommendations</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {currentSectorData.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* AI Climate Briefing Tab */
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Executive Climatologist Briefing:</strong> Grounded synthesis generated by Gemini model analyzing observed ERA5 metrics and upcoming forecast trajectories.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ProvenanceBadge type="ai_prediction" size="sm" />
              <button
                type="button"
                onClick={handleGenerateAIBriefing}
                disabled={isGeneratingAI}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-medium text-xs hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5 transition-all shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Synthesizing...' : 'Regenerate'}</span>
              </button>
            </div>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
              {aiError}
            </div>
          )}

          {isGeneratingAI ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Synthesizing meteorological intelligence from 365 daily observations...</p>
            </div>
          ) : aiReport ? (
            <div className={`p-6 rounded-2xl border relative ${
              isDark
                ? 'bg-slate-800/40 border-slate-700/60'
                : 'bg-slate-50/90 border-slate-200/90'
            }`}>
              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition-all shadow-xs"
                title="Copy Briefing"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>

              <div className="markdown-body prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-3 text-slate-700 dark:text-slate-300">
                <Markdown>{aiReport}</Markdown>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
