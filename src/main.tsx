import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/backgrounds.css'
import { register } from './serviceWorkerRegistration'

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline functionality
register({
  onSuccess: () => {
    console.log('FarmGuru is ready for offline use');
  },
  onUpdate: () => {
    console.log('New FarmGuru content is available');
  }
});
