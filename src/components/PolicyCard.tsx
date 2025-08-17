import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, Copy, ChevronDown, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface PolicyMatch {
  scheme: string;
  code: string;
  description: string;
  url: string;
  eligibility: string[];
  required_docs: string[];
}

interface PolicyCardProps {
  state: string;
  crop: string;
  userId?: string;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ state, crop, userId }) => {
  const [policies, setPolicies] = useState<PolicyMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (state && crop) {
      fetchPolicies();
    }
  }, [state, crop, userId]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/policy-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, state, crop })
      });

      if (!response.ok) throw new Error('Failed to fetch policies');
      
      const data = await response.json();
      setPolicies(data.matches || []);
      setConfidence(data.confidence || 0);
    } catch (error) {
      console.error('Policy fetch error:', error);
      // Fallback to mock data
      const mockPolicies: PolicyMatch[] = [
        {
          scheme: "PM-KISAN",
          code: "PM-KISAN",
          description: "Income support scheme providing ₹6000 per year to eligible farmers",
          url: "https://pmkisan.gov.in",
          eligibility: ["Small and marginal farmers", "Landholding up to 2 hectares"],
          required_docs: ["Aadhaar card", "Land documents", "Bank account details"]
        },
        {
          scheme: "Pradhan Mantri Fasal Bima Yojana",
          code: "PMFBY", 
          description: "Crop insurance scheme protecting farmers from crop losses",
          url: "https://pmfby.gov.in",
          eligibility: ["All farmers", "Crop area should be insurable"],
          required_docs: ["Aadhaar card", "Land records", "Sowing certificate"]
        }
      ];
      setPolicies(mockPolicies);
      setConfidence(0.7);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'bg-emerald-100 text-emerald-800';
    if (conf >= 0.4) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  };

  if (loading) {
    return (
      <Card className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ stiffness: 120 }}
    >
      <Card className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Government Schemes
            </CardTitle>
            <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(confidence)}`}>
              <CheckCircle className="w-3 h-3 mr-1" />
              {Math.round(confidence * 100)}% match
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Available schemes for {crop} farmers in {state}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {policies.map((policy, index) => (
            <motion.div
              key={policy.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border rounded-lg p-4 bg-gradient-to-r from-[#f7fbf7] to-white dark:from-slate-700 dark:to-slate-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {policy.scheme}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {policy.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="ml-2 flex-shrink-0"
                >
                  <a href={policy.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Apply
                  </a>
                </Button>
              </div>

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between p-2">
                    <span className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Required Documents & Eligibility
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Eligibility:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {policy.eligibility.map((item, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-1 h-1 bg-[#f6a71d] rounded-full mt-2 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Required Documents:</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(policy.required_docs.join('\n'), 'Document list')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {policy.required_docs.map((doc, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-1 h-1 bg-[#2a8f6d] rounded-full mt-2 mr-2 flex-shrink-0" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};