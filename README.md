# WeatherBot AI - Intelligent Weather Assistant

A stunning, modern weather chatbot powered by OpenAI GPT-4o Mini with real-time weather data integration. Built with Next.js 15, Tailwind CSS v4, and featuring an elegant ChatGPT-like interface.

![WeatherBot AI](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-blue?style=for-the-badge&logo=tailwindcss)

## ✨ Features

### 🤖 Agentic AI Capabilities

- **Real-time Weather Data**: Get current conditions for any location worldwide
- **5-Day Forecasts**: Detailed weather predictions with temperature, humidity, and wind data
- **Weather Alerts**: Active warnings and weather alerts for specific locations
- **Smart Recommendations**: AI-powered suggestions based on weather conditions
- **Natural Language Processing**: Ask questions in plain English

### 🎨 Modern Design

- **ChatGPT-like Interface**: Familiar and intuitive chat experience
- **Light Blue Theme**: Clean, professional white and light blue color scheme
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Glass Effects**: Modern backdrop blur and transparency effects

### 🚀 Technical Features

- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety and excellent developer experience
- **Tailwind CSS v4**: Latest utility-first CSS framework
- **OpenAI Integration**: GPT-4o Mini with function calling
- **Real-time Weather API**: Integration with OpenWeatherMap
- **Auto-resizing Input**: Dynamic textarea that adapts to content

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed on your system
- An OpenAI API key
- An OpenWeatherMap API key (free tier available)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd weather-agentic-ai

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Weather API Configuration (OpenWeatherMap)
# Get your free API key at: https://openweathermap.org/api
WEATHER_API_KEY=your_openweathermap_api_key_here

# Optional: Set to production for deployment
NODE_ENV=development
```

### 3. Get Your API Keys

#### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

#### OpenWeatherMap API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to your API Keys section
4. Copy your default API key
5. Add it to your `.env.local` file

### 4. Run the Application

```bash
# Start the development server
npm run dev

# The application will be available at http://localhost:3000
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel's dashboard
4. Deploy with one click

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🎯 Usage Examples

### Basic Weather Queries

- "What's the weather in New York?"
- "Show me the temperature in London"
- "Is it raining in Seattle right now?"

### Forecast Requests

- "5-day forecast for Tokyo"
- "What will the weather be like tomorrow in Paris?"
- "Show me this week's weather for Miami"

### Advanced Queries

- "Should I bring an umbrella in San Francisco today?"
- "What's the best time to go for a walk in Chicago?"
- "Compare the weather between New York and Los Angeles"

## 🎨 Design Features

### Color Palette

- **Primary Blue**: `#3b82f6` - Main interactive elements
- **Light Blue**: `#dbeafe` - Backgrounds and accents
- **White**: `#ffffff` - Main background
- **Gray Tones**: Various shades for text and borders

### Typography

- **Geist Sans**: Primary font for clean, modern text
- **Geist Mono**: Monospace font for code elements

### Animations

- Smooth fade-in animations for new messages
- Slide-up effects for loading states
- Hover animations on interactive elements
- Auto-scrolling to new messages

## 🛡️ Security & Best Practices

- Environment variables for sensitive data
- Input validation and sanitization
- Error handling for API failures
- Rate limiting considerations
- Responsive security headers

## 🐛 Troubleshooting

### Common Issues

#### "API key not found" Error

- Ensure your `.env.local` file is in the root directory
- Check that your API keys are correctly formatted
- Restart the development server after adding environment variables

#### Weather data not loading

- Verify your OpenWeatherMap API key is active
- Check if you've exceeded your API rate limits
- Ensure your internet connection is stable

#### Build errors

- Update to Node.js 18 or higher
- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check for TypeScript errors: `npm run build`

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: OpenAI GPT-4o Mini with function calling
- **Weather API**: OpenWeatherMap
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Deployment**: Vercel (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- OpenAI for providing the GPT-4o Mini model
- OpenWeatherMap for weather data API
- Vercel for hosting and deployment
- Tailwind CSS team for the amazing styling framework
- Lucide for beautiful icons

---

**Built with ❤️ using cutting-edge AI and modern web technologies**
