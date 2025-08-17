import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-smooth"
    >
      <Languages className="h-4 w-4 mr-2" />
      <span className="font-medium">
        {i18n.language === 'en' ? 'हिंदी' : 'English'}
      </span>
    </Button>
  );
};