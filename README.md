# FarmGuru - AI-Powered Agricultural Assistant

FarmGuru is an intelligent agricultural assistant that helps farmers make informed decisions through AI-powered crop advice, disease detection, weather insights, and government scheme information. Available in both English and Hindi.

## 🌾 Features

- **Smart Query System**: Ask questions via text or voice input
- **Image Analysis**: Upload crop images for disease detection and treatment recommendations
- **Weather Integration**: Real-time weather forecasts and agricultural recommendations
- **Market Prices**: Live market data with trend analysis and trading signals
- **Government Schemes**: Automatic matching with PM-KISAN, PMFBY, and other schemes
- **Community Forum**: Connect with other farmers and share experiences
- **Multilingual Support**: Full Hindi and English interface
- **Offline Support**: PWA with offline caching for essential features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database and storage)
- Python 3.8+ (for backend)

### Frontend Setup

1. **Clone and install dependencies:**
```bash
git clone <YOUR_GIT_URL>
cd farmguru
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your actual values
```

3. **Start development server:**
```bash
npm run dev
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. **Start backend server:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Enable required extensions:**
   - Go to Database → Extensions
   - Enable `vector` extension for pgvector support

3. **Run database migrations:**
   - Copy the SQL from `supabase/migrations/` and run in SQL Editor
   - Or use Supabase CLI: `supabase db push`

4. **Create storage bucket:**
   - Go to Storage → Create bucket
   - Name: `farm-images`
   - Make it public for image uploads

5. **Get your credentials:**
   - Project URL: `https://your-project.supabase.co`
   - Anon key: Found in Settings → API

## 📱 Usage

### Basic Queries
- **Text**: "When should I irrigate my wheat crop?"
- **Voice**: Click microphone and speak your question
- **Image**: Upload crop photos for disease analysis

### Government Schemes
- Select your state and crop to see applicable schemes
- Get eligibility criteria and required documents
- Direct links to application portals

### Market Analysis
- View current prices and 7-day trends
- Get BUY/SELL/HOLD recommendations
- Compare prices across different mandis

### Community Features
- Create posts to ask questions
- Share farming experiences
- Get help from other farmers

## 🛠️ Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Backend
uvicorn app.main:app --reload  # Start backend server
python -m pytest              # Run tests
```

### Project Structure

```
farmguru/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── lib/                # Utilities and configs
│   ├── integrations/       # Supabase integration
│   └── utils/              # Helper functions
├── backend/
│   ├── app/                # FastAPI application
│   ├── data_samples/       # Sample data for seeding
│   └── prompt_templates/   # LLM prompt templates
├── supabase/
│   └── migrations/         # Database migrations
└── public/                 # Static assets
```

## 🧪 Testing

### Test Flows

1. **Text Query Test:**
```bash
# Start both frontend and backend
npm run dev  # Terminal 1
cd backend && uvicorn app.main:app --reload  # Terminal 2

# Test: Ask "When should I irrigate my wheat in Bengaluru?"
# Expected: JSON response with sources and recommendations
```

2. **Voice Input Test:**
```bash
# Click microphone button and speak
# Expected: Speech transcription and query processing
```

3. **Image Upload Test:**
```bash
# Upload sample image from data_samples/
# Expected: Image uploaded to Supabase, analysis returned
```

4. **Policy Matching Test:**
```bash
# Select state: Karnataka, crop: wheat
# Expected: PM-KISAN and PMFBY schemes displayed
```

5. **Offline Test:**
```bash
# Disconnect network and reload
# Expected: PWA shows cached UI and last results
```

## 🔧 Troubleshooting

### Common Issues

**CORS Errors:**
```bash
# Ensure backend CORS_ORIGINS includes frontend URL
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**OpenAI API Fallback:**
```bash
# Backend works without OpenAI key using deterministic responses
# For full functionality, add OPENAI_API_KEY to backend/.env
```

**Supabase Connection:**
```bash
# Verify environment variables are set correctly
# Check Supabase project URL and anon key
# Ensure pgvector extension is enabled
```

## 🎥 Demo Script (60 seconds)

1. **Opening (10s)**: "FarmGuru - AI assistant for farmers in Hindi and English"
2. **Voice Query (15s)**: Click mic, ask "When to plant tomatoes in Karnataka?"
3. **Image Upload (15s)**: Upload leaf image, show disease detection
4. **Government Schemes (10s)**: Show PM-KISAN eligibility and documents
5. **Community (10s)**: Create post, show farmer interactions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Indian Council of Agricultural Research (ICAR) for agricultural guidelines
- India Meteorological Department (IMD) for weather data
- Ministry of Agriculture & Farmers Welfare for scheme information
- Farmers across India for their valuable feedback and insights