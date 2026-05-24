# Gemini AI Integration Guide

This guide explains how to use the Gemini AI API integration in your React app.

## Setup

### 1. Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Get API Key" and create a new API key
3. Copy your API key

### 2. Add to Environment Variables

Add your API key to `.env.local`:

```env
VITE_GEMINI_API_KEY=your-actual-api-key-here
```

## Available Functions

### Core Functions

All functions are in `src/lib/api/gemini.ts`

#### `generateContent(prompt, options?)`

Generate arbitrary content from any prompt.

```typescript
import { generateContent } from '@/lib/api/gemini';

const { text, error } = await generateContent(
  'Write a product review for a task management app',
  { temperature: 0.7, maxTokens: 500 }
);

if (error) {
  console.error('Error:', error);
} else {
  console.log('Generated:', text);
}
```

**Options:**
- `temperature` (0-1): Controls randomness. Lower = more focused, higher = more creative
- `maxTokens`: Maximum number of tokens in the response

#### `generateProductInsight(productName, description, reviews)`

Generate AI insights about a product.

```typescript
import { generateProductInsight } from '@/lib/api/gemini';

const { insight, error } = await generateProductInsight(
  'TaskFlow',
  'A simple task management application',
  ['Great app!', 'Could use better UI', 'Very helpful']
);
```

#### `analyzeReviewSentiment(reviewText)`

Analyze the sentiment of a review.

```typescript
import { analyzeReviewSentiment } from '@/lib/api/gemini';

const result = await analyzeReviewSentiment('This product is amazing!');
// Returns: { sentiment: 'positive', confidence: 0.95, summary: '...', error: null }
```

**Returns:**
- `sentiment`: 'positive' | 'negative' | 'neutral'
- `confidence`: 0-1 score
- `summary`: Brief description

#### `generateProductTags(productName, description)`

Auto-generate relevant tags for a product.

```typescript
import { generateProductTags } from '@/lib/api/gemini';

const { tags, error } = await generateProductTags('TaskFlow', description);
// Returns: { tags: ['productivity', 'task-management', 'planning', ...], error: null }
```

#### `generateFeatureHighlights(description)`

Extract key features from a product description.

```typescript
import { generateFeatureHighlights } from '@/lib/api/gemini';

const { features, error } = await generateFeatureHighlights(productDescription);
// Returns: { features: ['Feature 1', 'Feature 2', ...], error: null }
```

#### `answerProductQuestion(productName, productInfo, question)`

Answer user questions about a product.

```typescript
import { answerProductQuestion } from '@/lib/api/gemini';

const { answer, error } = await answerProductQuestion(
  'TaskFlow',
  'A simple task management application',
  'Does this support team collaboration?'
);
```

#### `generateReviewResponse(reviewText, context?)`

Generate a response to a user review.

```typescript
import { generateReviewResponse } from '@/lib/api/gemini';

const { response, error } = await generateReviewResponse(
  'This app needs better dark mode support',
  'We are working on UI improvements'
);
```

#### `compareProducts(products)`

Compare multiple products.

```typescript
import { compareProducts } from '@/lib/api/gemini';

const { comparison, error } = await compareProducts([
  { name: 'TaskFlow', description: '...', price: 29 },
  { name: 'Competitor', description: '...', price: 49 }
]);
```

## React Hooks

All hooks are in `src/lib/hooks/useGemini.ts`

### `useGeminiContent()`

Generic hook for any content generation.

```typescript
import { useGeminiContent } from '@/lib/hooks/useGemini';

function MyComponent() {
  const { generate, loading, error } = useGeminiContent();

  const handleGenerate = async () => {
    const content = await generate('Your prompt here');
    if (content) console.log('Generated:', content);
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && <div>{error}</div>}
    </div>
  );
}
```

### `useProductInsight()`

```typescript
import { useProductInsight } from '@/lib/hooks/useGemini';

function ProductCard({ product }) {
  const { generate, loading, error } = useProductInsight();
  const [insight, setInsight] = useState(null);

  const handleGenerateInsight = async () => {
    const result = await generate(product.name, product.description, []);
    setInsight(result);
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleGenerateInsight} disabled={loading}>
        {loading ? 'Generating...' : 'Get AI Insight'}
      </button>
      {insight && <p>{insight}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
```

### `useReviewSentiment()`

Analyze review sentiment.

```typescript
import { useReviewSentiment } from '@/lib/hooks/useGemini';

function ReviewAnalysis({ reviewText }) {
  const { analyze, loading, error } = useReviewSentiment();
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    const analysis = await analyze(reviewText);
    setResult(analysis);
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>Analyze</button>
      {result && (
        <div>
          <p>Sentiment: {result.sentiment}</p>
          <p>Confidence: {(result.confidence * 100).toFixed(0)}%</p>
          <p>{result.summary}</p>
        </div>
      )}
    </div>
  );
}
```

### `useProductTags()`

```typescript
import { useProductTags } from '@/lib/hooks/useGemini';

function ProductForm() {
  const { generate, loading } = useProductTags();
  const [tags, setTags] = useState<string[]>([]);

  const handleGenerateTags = async (name, desc) => {
    const generatedTags = await generate(name, desc);
    setTags(generatedTags);
  };

  return (
    <div>
      <button onClick={() => handleGenerateTags(name, description)} disabled={loading}>
        {loading ? 'Generating tags...' : 'Auto-generate tags'}
      </button>
      <div className="flex gap-2">
        {tags.map(tag => <span key={tag}>{tag}</span>)}
      </div>
    </div>
  );
}
```

### `useFeatureHighlights()`

```typescript
import { useFeatureHighlights } from '@/lib/hooks/useGemini';

function FeatureList({ description }) {
  const { generate, loading, error } = useFeatureHighlights();
  const [features, setFeatures] = useState<string[]>([]);

  return (
    <div>
      <button
        onClick={async () => {
          const result = await generate(description);
          setFeatures(result);
        }}
        disabled={loading}
      >
        Extract Features
      </button>
      <ul>
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
    </div>
  );
}
```

### `useProductQuestion()`

Answer questions about products.

```typescript
import { useProductQuestion } from '@/lib/hooks/useGemini';

function ProductQA({ product }) {
  const { answer, loading, error } = useProductQuestion();
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    const result = await answer(product.name, product.description, question);
    setResponse(result);
  };

  return (
    <div>
      <input
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="Ask about this product..."
      />
      <button onClick={handleAsk} disabled={loading}>Ask</button>
      {response && <p>{response}</p>}
    </div>
  );
}
```

### `useReviewResponse()`

Generate responses to reviews.

```typescript
import { useReviewResponse } from '@/lib/hooks/useGemini';

function ReviewReplyForm({ review }) {
  const { generate, loading } = useReviewResponse();
  const [reply, setReply] = useState('');

  const handleGenerateReply = async () => {
    const result = await generate(review.content);
    setReply(result);
  };

  return (
    <div>
      <button onClick={handleGenerateReply} disabled={loading}>
        Generate Reply
      </button>
      {reply && <textarea value={reply} readOnly />}
    </div>
  );
}
```

### `useProductComparison()`

```typescript
import { useProductComparison } from '@/lib/hooks/useGemini';

function ComparisonView({ products }) {
  const { compare, loading } = useProductComparison();
  const [comparison, setComparison] = useState('');

  const handleCompare = async () => {
    const result = await compare(products);
    setComparison(result);
  };

  return (
    <div>
      <button onClick={handleCompare} disabled={loading}>Compare Products</button>
      {comparison && <p>{comparison}</p>}
    </div>
  );
}
```

## Complete Example Component

See `src/components/AIProductInsights.tsx` for a full-featured example component that demonstrates all AI features in a tabbed interface.

Usage:

```typescript
import AIProductInsights from '@/components/AIProductInsights';

<AIProductInsights
  productName="TaskFlow"
  description="A simple yet powerful task management app"
  reviews={userReviews}
/>
```

## Error Handling

All functions return error messages when something goes wrong:

```typescript
const { text, error } = await generateContent(prompt);

if (error) {
  if (error.includes('API key')) {
    console.log('Missing API key - check .env.local');
  } else if (error.includes('blocked')) {
    console.log('Content was blocked by safety filters');
  } else {
    console.log('Error:', error);
  }
}
```

## Safety Features

All Gemini requests include safety settings:

- Harassment filtering
- Hate speech filtering
- Sexually explicit content filtering
- Dangerous content filtering

## Best Practices

1. **Temperature Settings**
   - Use 0.3-0.5 for analytical tasks (sentiment analysis, tagging)
   - Use 0.7-0.9 for creative tasks (insights, descriptions)

2. **Token Limits**
   - Set appropriate `maxTokens` to avoid unnecessary API costs
   - Feature generation: 200-300 tokens
   - Product insights: 300-500 tokens
   - Comparisons: 400-600 tokens

3. **Error Messages**
   - Always display user-friendly error messages
   - Never expose API errors directly to users

4. **Loading States**
   - Show loading indicators for API calls
   - Disable buttons while generating
   - Consider timeout after 30 seconds

5. **API Rate Limits**
   - Free tier: 60 requests per minute
   - Be mindful of batch operations
   - Implement retry logic for transient failures

## Troubleshooting

**"API key not configured" error**
- Add `VITE_GEMINI_API_KEY` to `.env.local`
- Restart the development server

**"Request blocked" error**
- The content was flagged by safety filters
- Try rephrasing the prompt
- Use lower temperature for more controlled outputs

**"No content generated" error**
- The model refused to generate content
- Try a different prompt
- Check safety settings

**Slow responses**
- Normal for first request (model loading)
- Subsequent requests should be faster
- API rate limiting might apply on free tier
