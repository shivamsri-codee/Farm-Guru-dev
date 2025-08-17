import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Camera, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryInputProps {
  onQuery: (text: string, imageFile?: File) => void;
  isLoading: boolean;
}

export const QueryInput = ({ onQuery, isLoading }: QueryInputProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: t('voice.error'),
        description: t('voice.notSupported'),
        variant: 'destructive',
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognizer = new SpeechRecognition();
    
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = t('voice.lang');

    recognizer.onstart = () => {
      setIsRecording(true);
    };

    recognizer.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(transcript);
      toast({
        title: t('voice.recognized'),
        description: transcript,
      });
    };

    recognizer.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: t('voice.error'),
        description: t('voice.tryAgain'),
        variant: 'destructive',
      });
      setIsRecording(false);
    };

    recognizer.onend = () => {
      setIsRecording(false);
    };

    recognizer.start();
    setRecognition(recognizer);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('image.error'),
          description: t('image.invalidType'),
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('image.error'),
          description: t('image.tooLarge'),
          variant: 'destructive',
        });
        return;
      }

      setText(t('image.analyzing'));
      onQuery(t('image.analyzing'), file);
    }
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onQuery(text.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="p-6 shadow-medium bg-white/95 backdrop-blur-sm border-0">
      <div className="space-y-4">
        {/* Text Input Area */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('input.placeholder')}
          className="min-h-20 text-base resize-none border-muted focus:border-accent focus:ring-accent/20 transition-smooth"
          disabled={isLoading}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Voice Input Button */}
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`
                relative overflow-hidden transition-spring
                ${isRecording ? 'pulse-recording' : 'hover:border-accent hover:text-accent'}
              `}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              <span className="sr-only">
                {isRecording ? t('voice.stop') : t('voice.start')}
              </span>
            </Button>

            {/* Image Upload Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="hover:border-accent hover:text-accent transition-smooth"
            >
              <Camera className="h-5 w-5" />
              <span className="sr-only">{t('image.upload')}</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            size="lg"
            className="bg-gradient-forest hover:shadow-glow transition-spring px-8"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="ml-2 font-medium">
              {isLoading ? t('input.analyzing') : t('input.ask')}
            </span>
          </Button>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="text-center">
            <p className="text-destructive font-medium animate-pulse">
              {t('voice.listening')}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};