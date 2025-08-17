import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      header: {
        subtitle: 'Your AI-powered agricultural assistant for smart farming decisions'
      },
      input: {
        placeholder: 'Ask about crops, weather, fertilizers, pests, or government schemes...',
        ask: 'Ask FarmGuru',
        analyzing: 'Analyzing...'
      },
      voice: {
        start: 'Start voice input',
        stop: 'Stop recording',
        listening: '🎤 Listening... Speak now',
        recognized: 'Voice recognized',
        error: 'Voice input error',
        notSupported: 'Voice input not supported in this browser',
        tryAgain: 'Please try again',
        lang: 'en-IN'
      },
      image: {
        upload: 'Upload crop image',
        analyzing: 'Analyzing crop image for diseases and issues...',
        error: 'Image upload error',
        invalidType: 'Please upload a valid image file',
        tooLarge: 'Image file too large (max 5MB)'
      },
      confidence: {
        label: 'Confidence',
        high: 'High',
        medium: 'Medium', 
        low: 'Low'
      },
      actions: {
        title: 'Recommended Actions'
      },
      sources: {
        title: 'Sources & Evidence',
        visit: 'Visit'
      },
      tips: {
        title: 'How to use FarmGuru',
        voice: 'Use voice input to ask questions in Hindi or English',
        image: 'Upload photos of crops, leaves, or soil for instant analysis',
        schemes: 'Get information about PM-KISAN, PMFBY, and other government schemes'
      }
    }
  },
  hi: {
    translation: {
      header: {
        subtitle: 'स्मार्ट खेती के निर्णयों के लिए आपका AI-संचालित कृषि सहायक'
      },
      input: {
        placeholder: 'फसल, मौसम, उर्वरक, कीट या सरकारी योजनाओं के बारे में पूछें...',
        ask: 'फार्मगुरु से पूछें',
        analyzing: 'विश्लेषण कर रहे हैं...'
      },
      voice: {
        start: 'आवाज़ इनपुट शुरू करें',
        stop: 'रिकॉर्डिंग बंद करें',
        listening: '🎤 सुन रहे हैं... अब बोलें',
        recognized: 'आवाज़ पहचानी गई',
        error: 'आवाज़ इनपुट त्रुटि',
        notSupported: 'इस ब्राउज़र में आवाज़ इनपुट समर्थित नहीं है',
        tryAgain: 'कृपया फिर से कोशिश करें',
        lang: 'hi-IN'
      },
      image: {
        upload: 'फसल की तस्वीर अपलोड करें',
        analyzing: 'बीमारियों और समस्याओं के लिए फसल की तस्वीर का विश्लेषण कर रहे हैं...',
        error: 'तस्वीर अपलोड त्रुटि',
        invalidType: 'कृपया वैध तस्वीर फ़ाइल अपलोड करें',
        tooLarge: 'तस्वीर फ़ाइल बहुत बड़ी है (अधिकतम 5MB)'
      },
      confidence: {
        label: 'विश्वास',
        high: 'उच्च',
        medium: 'मध्यम',
        low: 'कम'
      },
      actions: {
        title: 'सुझाई गई कार्रवाई'
      },
      sources: {
        title: 'स्रोत और प्रमाण',
        visit: 'देखें'
      },
      tips: {
        title: 'फार्मगुरु का उपयोग कैसे करें',
        voice: 'हिंदी या अंग्रेजी में प्रश्न पूछने के लिए आवाज़ इनपुट का उपयोग करें',
        image: 'तुरंत विश्लेषण के लिए फसल, पत्ते या मिट्टी की तस्वीरें अपलोड करें',
        schemes: 'पीएम-किसान, पीएमएफबीवाई और अन्य सरकारी योजनाओं की जानकारी प्राप्त करें'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;