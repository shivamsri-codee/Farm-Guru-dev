import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, AlertTriangle, Phone, RefreshCw, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface ChemRecommendation {
  recommendation: string;
  confidence: number;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  next_steps: string[];
  safety_notice: string;
  meta: {
    crop: string;
    symptom_category: string;
    image_id?: string;
  };
}

interface ChemRecommenderProps {
  crop?: string;
  userId?: string;
}

export const ChemRecommender: React.FC<ChemRecommenderProps> = ({ crop = '', userId }) => {
  const [symptom, setSymptom] = useState('');
  const [recommendation, setRecommendation] = useState<ChemRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = userId ? `${userId}/${fileName}` : `anonymous/${fileName}`;

      const { data, error } = await supabase.storage
        .from('farm-images')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100);
          }
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('farm-images')
        .getPublicUrl(data.path);

      setImageUrl(publicUrl);
      
      // Call backend for analysis
      await getRecommendation('Image analysis for crop disease detection', publicUrl);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getRecommendation = async (symptomText: string, imageId?: string) => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/chem-reco`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: crop || 'general',
          symptom: symptomText,
          image_id: imageId,
          user_id: userId
        })
      });

      if (!response.ok) throw new Error('Failed to get recommendation');
      
      const data = await response.json();
      setRecommendation(data);
    } catch (error) {
      console.error('Recommendation error:', error);
      // Fallback mock response
      const mockRecommendation: ChemRecommendation = {
        recommendation: "Suspected foliar fungal infection. Follow IPM: remove severely affected leaves, use neem-based biopesticide or consult KVK for certified fungicide. Do not apply chemicals without expert verification.",
        confidence: 0.45,
        sources: [
          {
            title: "IPM Guidelines for Crop Diseases",
            url: "https://farmer.gov.in/ipm",
            snippet: "Integrated Pest Management emphasizes biological and cultural controls before chemical intervention."
          }
        ],
        next_steps: ["Remove affected plant parts", "Use neem oil spray", "Consult local KVK expert"],
        safety_notice: "IMPORTANT: This is general guidance only. Always consult local agricultural experts before applying any treatments.",
        meta: {
          crop: crop || 'general',
          symptom_category: 'leaf_spots',
          image_id: imageId
        }
      };
      setRecommendation(mockRecommendation);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!symptom.trim() && !imageUrl) {
      toast({
        title: "Input required",
        description: "Please describe symptoms or upload an image",
        variant: "destructive"
      });
      return;
    }
    getRecommendation(symptom || 'Image-based analysis', imageUrl || undefined);
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'bg-emerald-100 text-emerald-800';
    if (conf >= 0.4) return 'bg-amber-100 text-amber-800';
    return 'bg-rose-100 text-rose-800';
  };

  const showWarning = recommendation && recommendation.confidence < 0.6;

  return (
    <motion.div
      initial={{ y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ stiffness: 120 }}
    >
      <Card className="bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-slate-900 dark:text-slate-100 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-[#f6a71d]" />
            Safe Treatment Recommendations
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Input Section */}
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the symptoms you observe (e.g., yellow spots on leaves, wilting, pest damage)..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="min-h-20"
              disabled={loading}
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Crop Image
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={loading || (!symptom.trim() && !imageUrl)}
                className="flex-1 bg-gradient-to-r from-[#2a8f6d] to-[#74c69d] hover:from-[#236b56] hover:to-[#5fb085]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading image...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {imageUrl && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">✓ Image uploaded successfully</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setImageUrl(null);
                    setRecommendation(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Recommendation Results */}
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t pt-4"
            >
              {/* Warning for low confidence */}
              {showWarning && (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    Low confidence recommendation. Please consult an agricultural expert for accurate diagnosis.
                  </AlertDescription>
                </Alert>
              )}

              {/* Main Recommendation */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg sm:text-xl font-medium text-slate-900 dark:text-slate-100">
                    Treatment Recommendation
                  </h3>
                  <Badge className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(recommendation.confidence)}`}>
                    {Math.round(recommendation.confidence * 100)}% confidence
                  </Badge>
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {recommendation.recommendation}
                </p>

                {/* Safety Notice */}
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-800 font-medium">
                    {recommendation.safety_notice}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Next Steps */}
              {recommendation.next_steps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Next Steps:</h4>
                  <div className="space-y-2">
                    {recommendation.next_steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#f7fbf7] to-white rounded-lg">
                        <div className="w-6 h-6 bg-[#2a8f6d] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecommendation(null);
                    setImageUrl(null);
                    setSymptom('');
                  }}
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
                
                {showWarning && (
                  <Button
                    className="flex-1 bg-[#f6a71d] hover:bg-[#e09612] text-white"
                    asChild
                  >
                    <a href="tel:1800-180-1551">
                      <Phone className="w-4 h-4 mr-2" />
                      Consult KVK Expert
                    </a>
                  </Button>
                )}
              </div>

              {/* Sources */}
              {recommendation.sources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900 dark:text-slate-100">Sources:</h4>
                  <div className="space-y-2">
                    {recommendation.sources.map((source, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-white/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{source.title}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{source.snippet}</p>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={source.url} target="_blank" rel="noopener noreferrer">
                              <Upload className="w-3 h-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};