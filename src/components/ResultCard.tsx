import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle, AlertTriangle, XCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResultCardProps {
  result: {
    answer: string;
    confidence: number;
    actions: string[];
    sources: Array<{
      title: string;
      url: string;
      snippet: string;
    }>;
  };
}

export const ResultCard = ({ result }: ResultCardProps) => {
  const { t } = useTranslation();
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-gradient-confidence-high';
    if (confidence >= 0.4) return 'bg-gradient-confidence-medium';
    return 'bg-gradient-confidence-low';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.7) return <CheckCircle className="h-5 w-5 text-success" />;
    if (confidence >= 0.4) return <AlertTriangle className="h-5 w-5 text-warning" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.7) return t('confidence.high');
    if (confidence >= 0.4) return t('confidence.medium');
    return t('confidence.low');
  };

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ stiffness: 120 }}
    >
      <Card className="overflow-hidden shadow-medium bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-0 rounded-2xl">
      {/* Main Answer */}
        <div className="p-4 sm:p-6 space-y-6">
        {/* Answer Text */}
        <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
            {result.answer}
          </h2>
        </div>

        {/* Confidence Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getConfidenceIcon(result.confidence)}
                <span className="font-medium text-slate-900 dark:text-slate-100">
                {t('confidence.label')}: {getConfidenceText(result.confidence)}
              </span>
            </div>
              <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
              {Math.round(result.confidence * 100)}%
            </Badge>
          </div>
          
          {/* Confidence Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
                className="h-full confidence-fill transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${result.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t('actions.title')}</h3>
          </div>
          
          <div className="space-y-2">
            {result.actions.map((action, index) => (
                <motion.div
                key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f7fbf7] to-white rounded-lg border border-[#2a8f6d]/20"
              >
                  <div className="w-6 h-6 bg-[#2a8f6d] text-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold">{index + 1}</span>
                </div>
                  <span className="text-slate-900 dark:text-slate-100 font-medium">{action}</span>
                </motion.div>
            ))}
          </div>
        </div>

        {/* Sources Section */}
        <Collapsible open={isSourcesOpen} onOpenChange={setIsSourcesOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between hover:bg-muted/50 transition-smooth"
            >
                <span className="font-medium text-slate-900 dark:text-slate-100">{t('sources.title')} ({result.sources.length})</span>
              {isSourcesOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4 space-y-3">
            {result.sources.map((source, index) => (
                <motion.div
                key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">
                    {source.title}
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="flex-shrink-0 hover:bg-accent/20"
                      onClick={() => {
                        // Log click event for analytics
                        console.log('Source clicked:', source.url);
                      }}
                  >
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">{t('sources.visit')}</span>
                    </a>
                  </Button>
                </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {source.snippet}
                </p>
                </motion.div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
      </Card>
    </motion.div>
  );
};