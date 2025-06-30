# Weather Assistant Relevance & Metrics System

## Overview

The Weather Assistant now includes a sophisticated relevance classification system that ensures queries stay within the weather domain, along with comprehensive metrics tracking to monitor and optimize performance.

## 🎯 Key Features

### Relevance Classification

- **Automatic Query Filtering**: Detects and rejects non-weather queries
- **Multi-Level Classification**: Categorizes queries into relevance levels
- **Performance Optimized**: Uses keyword pre-filtering + LLM classification
- **Graceful Handling**: Provides helpful redirects for out-of-scope queries

### Metrics & Monitoring

- **Real-time Tracking**: Monitors classification accuracy and performance
- **Error Detection**: Identifies false positives/negatives automatically
- **Performance Analysis**: Tracks response times, token usage, success rates
- **User Feedback**: Allows correction of classification mistakes

## 🔧 Architecture

### Components

1. **`relevanceClassifier.ts`** - Core classification logic
2. **`metrics.ts`** - Metrics collection and analysis
3. **`/api/chat/route.ts`** - Integrated classification in chat flow
4. **`/api/metrics/route.ts`** - Metrics API for monitoring

### Classification Levels

```typescript
enum RelevanceLevel {
  HIGHLY_RELEVANT = "highly_relevant", // Clear weather topics
  RELEVANT = "relevant", // Weather-adjacent content
  NEUTRAL = "neutral", // Greetings, basic conversation
  IRRELEVANT = "irrelevant", // Non-weather topics
}
```

## 🚀 Usage Examples

### Weather Queries (Accepted)

```
✅ "What's the weather in New York?"
✅ "Will it rain tomorrow?"
✅ "What should I wear for today's weather?"
✅ "Explain how hurricanes form"
✅ "Is there a storm warning?"
```

### Non-Weather Queries (Rejected)

```
🚫 "What is TypeScript?"
🚫 "How do I write JavaScript?"
🚫 "Tell me about React components"
🚫 "What's the best programming language?"
```

### Edge Cases (Context-Dependent)

```
✅ "Should I take an umbrella?" (weather-related activity)
✅ "Is it good flying weather?" (weather impact question)
✅ "Hello there!" (basic conversation)
```

## 📊 Metrics Tracked

### Relevance Metrics

- **Total Queries**: Number of queries processed
- **Accuracy Rate**: Percentage of correctly classified queries
- **Rejection Rate**: Percentage of queries rejected as non-weather
- **False Positives**: Non-weather queries incorrectly accepted
- **False Negatives**: Weather queries incorrectly rejected
- **Confidence Scores**: Average confidence of classifications

### Performance Metrics

- **Response Time**: Average time to process queries
- **Token Usage**: OpenAI API token consumption
- **Success Rate**: Percentage of successfully completed requests
- **Tool Calls**: Number of weather API calls executed

### Quality Metrics

- **User Corrections**: Manual feedback about classification errors
- **Alert Levels**: Automated detection of performance issues
- **Recommendations**: Suggested improvements based on metrics

## 🔍 Testing

### Run Classification Tests

```bash
node test-relevance.js
```

### Expected Output

```
🧪 Testing Weather Assistant Relevance Classification

✅ ACCEPTED |  95% | highly_relevant | "What's the weather in New York?"
🚫 REJECTED |  98% | irrelevant      | "What is TypeScript?"
   Reason: Contains obvious non-weather keywords

📈 Metrics Summary:
Total Queries: 23
Acceptance Rate: 70%
Rejection Rate: 30%
Average Confidence: 91%
Average Response Time: 245ms
```

## 📈 Monitoring & Analytics

### Access Metrics API

```bash
# Basic metrics
curl http://localhost:3000/api/metrics

# Detailed metrics with recent interactions
curl "http://localhost:3000/api/metrics?detailed=true&hours=24"
```

### Metrics Response Format

```json
{
  "timestamp": "2024-01-20T10:30:00.000Z",
  "relevance": {
    "totalQueries": 150,
    "accuracyRate": 94,
    "rejectionRate": 22,
    "averageConfidence": 89,
    "falsePositives": 2,
    "falseNegatives": 1
  },
  "performance": {
    "averageResponseTime": 340,
    "successRate": 98,
    "averageTokensUsed": 245,
    "totalInteractions": 150
  },
  "evaluation": {
    "alertLevel": "low",
    "issues": [],
    "recommendation": "Classification performance is optimal."
  }
}
```

## ⚙️ Configuration

### Environment Variables

```bash
# Required for classification
OPENAI_API_KEY=your_openai_api_key

# Optional: Adjust classification strictness
RELEVANCE_STRICTNESS=standard  # loose | standard | strict
```

### Tuning Parameters

#### Classification Settings

- **Temperature**: `0.1` (low for consistent classification)
- **Max Tokens**: `150` (sufficient for classification response)
- **Model**: `gpt-4o-mini` (cost-effective for classification)

#### Performance Thresholds

- **Target Accuracy**: `>90%`
- **Max False Positive Rate**: `<5%`
- **Target Confidence**: `>80%`
- **Alert Threshold**: `>30%` rejection rate may be too strict

## 🛠️ Implementation Details

### Quick Keyword Filter

Performance optimization that skips LLM classification for obvious cases:

```typescript
const weatherKeywords = ['weather', 'rain', 'snow', 'temperature', ...];
const nonWeatherKeywords = ['typescript', 'javascript', 'programming', ...];
```

### Classification Prompt

Structured prompt with clear examples and categories:

- ✅ Weather-related topics (accept)
- ❌ Non-weather topics (reject)
- ✅ Allowed conversational exchanges

### Error Handling

- Fallback to acceptance if classification fails
- Comprehensive error logging
- Graceful degradation

## 🔄 User Feedback Loop

### Record Classification Corrections

```bash
curl -X POST http://localhost:3000/api/metrics \
  -H "Content-Type: application/json" \
  -d '{"isClassificationWrong": true, "actuallyWeatherRelated": false}'
```

### Continuous Improvement

- Monitor false positive/negative rates
- Adjust classification parameters based on feedback
- Retrain classification examples if needed

## 📋 Quality Assurance

### Automated Alerts

The system automatically detects performance issues:

- **High Alert**: Accuracy < 90%
- **Medium Alert**: False positive rate > 5% OR confidence < 80%
- **Low Alert**: Rejection rate > 30% (may be too strict)

### Regular Monitoring

- Daily metrics review recommended
- Weekly classification accuracy analysis
- Monthly system optimization review

## 🚀 Benefits

### For Users

- ✅ Focused weather assistance without topic drift
- ✅ Clear feedback when queries are out of scope
- ✅ Helpful suggestions for weather-related alternatives
- ✅ Faster responses through optimized filtering

### For Developers

- 📊 Comprehensive performance insights
- 🔍 Real-time classification monitoring
- ⚡ Optimized token usage and costs
- 🛡️ Quality assurance through metrics

### For Business

- 💰 Reduced API costs through efficient filtering
- 📈 Improved user experience and satisfaction
- 🎯 Maintained product focus and positioning
- 📊 Data-driven optimization opportunities

## 🔮 Future Enhancements

1. **Machine Learning**: Train custom classification models
2. **A/B Testing**: Test different classification strategies
3. **Advanced Analytics**: User behavior analysis
4. **Integration**: Connect with external monitoring systems
5. **Auto-tuning**: Automatically adjust parameters based on performance
