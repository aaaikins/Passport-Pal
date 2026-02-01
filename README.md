# Passport Pal - Next.js ✈️

An AI-powered travel document assistant that generates personalized travel checklists using GPT-4 and advanced machine learning.

## 🚀 Features

### Core Features
- **AI-Powered Checklists**: Get personalized travel document checklists using GPT-4
- **Smart Compliance Analysis**: Automatic verification of document requirements
- **Risk Assessment**: ML-based risk scoring and predictive analytics
- **Email Notifications**: Receive your checklist via beautifully formatted emails
- **WhatsApp Reminders**: Get travel reminders 3 days before departure
- **Document Timeline**: Optimal preparation timeline suggestions

### Enhanced AI/ML Capabilities
- **Predictive Analytics**: Success probability calculations based on multiple factors
- **Risk Scoring**: Real-time risk assessment considering passport validity, visa complexity, and timing
- **Smart Recommendations**: Context-aware suggestions based on your travel profile
- **Document Compliance**: AI-powered validation of travel documents
- **Optimal Timeline Generation**: ML-based recommendations for when to apply for visas, book flights, etc.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI/ML**: OpenAI GPT-4, TensorFlow.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: Nodemailer, Twilio
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/passport-pal.git
cd passport-pal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your API keys:
```
OPENAI_API_KEY=your_openai_api_key
EMAIL_PASSWORD=your_gmail_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+18444991914
EMAIL_FROM=your_email@gmail.com
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 API Keys Setup

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API keys section
4. Create a new API key
5. Add it to your `.env.local` file

### Gmail for Email Notifications
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use this app password in `EMAIL_PASSWORD`

### Twilio for WhatsApp
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Set up WhatsApp sandbox or get approved number
4. Add credentials to `.env.local`

## 📁 Project Structure

```
passport-pal/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── generate-checklist/
│   │   ├── send-email/
│   │   ├── whatsapp-reminder/
│   │   ├── recommendations/
│   │   └── analyze/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/               # React components
│   ├── TravelForm.tsx
│   └── ChecklistDisplay.tsx
├── lib/                      # Utility functions
│   ├── types.ts
│   ├── ai-service.ts
│   ├── ml-service.ts
│   └── notification-service.ts
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🎯 API Endpoints

### POST `/api/generate-checklist`
Generate AI-powered travel checklist
```json
{
  "nationality": "United States",
  "passportExpiration": "2027-12-31",
  "leavingFrom": "New York",
  "goingTo": "London",
  "departureDate": "2026-06-15",
  "email": "user@example.com",
  "visaType": "Tourist",
  "purposeOfTravel": "Vacation"
}
```

### POST `/api/analyze`
Get predictive analysis and risk assessment

### POST `/api/send-email`
Send checklist via email

### POST `/api/whatsapp-reminder`
Schedule WhatsApp reminder

### POST `/api/recommendations`
Get personalized travel recommendations

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

```bash
npm run build
vercel --prod
```

## 🧪 Development

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📝 Key Improvements from Original Version

### Architecture
- ✅ Migrated from Python/FastAPI to Next.js/TypeScript
- ✅ Modern React components with TypeScript
- ✅ App Router for better performance
- ✅ API routes with proper error handling

### AI/ML Enhancements
- ✅ Enhanced GPT-4 prompts with JSON mode
- ✅ Structured AI responses with categorized items
- ✅ Risk scoring algorithm
- ✅ Predictive analytics using ML
- ✅ Document compliance analysis
- ✅ Smart recommendations engine
- ✅ Optimal timeline generation

### UX Improvements
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Smooth animations with Framer Motion
- ✅ Loading states and error handling
- ✅ Priority-based checklist organization
- ✅ Visual risk indicators
- ✅ Download and email functionality
- ✅ Real-time form validation

### Features Added
- ✅ Compliance scoring
- ✅ Visa requirement analysis
- ✅ Warning system
- ✅ Document categorization
- ✅ Estimated completion times
- ✅ Official links for applications
- ✅ Success probability calculation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Vercel for hosting platform
- Twilio for WhatsApp integration

## ⚠️ Disclaimer

This tool provides general guidance. Always verify travel requirements with official government sources before traveling.

---

Made with ❤️ by Passport Pal Team
