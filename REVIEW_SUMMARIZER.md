# AI Review Summarizer

The AI Review Summarizer uses Google Gemini API to analyze all product reviews and extract key insights.

## Features

- **Strengths**: Identifies what customers love about the product
- **Weaknesses**: Highlights common pain points and issues
- **Feature Requests**: Extracts requested features from reviews
- **Overall Summary**: Provides a balanced 2-3 sentence summary

## Usage

### Using the Component

```typescript
import ReviewSummarizer from '@/components/ReviewSummarizer';

function ProductPage() {
  const reviews = [
    'Great product but needs dark mode',
    'Love the UI, very intuitive',
    'Performance could be better',
    // ... more reviews
  ];

  return (
    <ReviewSummarizer
      reviews={reviews}
      productName="TaskFlow"
    />
  );
}
```

### Using the Hook

```typescript
import { useReviewSummary } from '@/lib/hooks/useGemini';

function AnalyzeReviews() {
  const { summarize, loading, error } = useReviewSummary();
  const [summary, setSummary] = useState(null);

  const handleAnalyze = async () => {
    const reviews = [
      'Great product!',
      'Needs improvement',
      // ... reviews
    ];

    const result = await summarize(reviews);
    if (result) {
      setSummary(result);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {summary && (
        <div>
          <h3>Strengths</h3>
          <ul>
            {summary.strengths.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}
```

### Using the API Directly

```typescript
import { summarizeReviews } from '@/lib/api/gemini';

const reviews = ['Review 1', 'Review 2', '...'];
const { summary, error } = await summarizeReviews(reviews);

if (summary) {
  console.log('Strengths:', summary.strengths);
  console.log('Weaknesses:', summary.weaknesses);
  console.log('Feature Requests:', summary.featureRequests);
  console.log('Summary:', summary.overallSummary);
}
```

## Return Type

```typescript
interface ReviewSummary {
  strengths: string[];           // 3-5 key strengths
  weaknesses: string[];          // 3-5 key weaknesses
  featureRequests: string[];     // 2-4 requested features
  overallSummary: string;        // 2-3 sentence summary
}
```

## Example Output

```json
{
  "strengths": [
    "Intuitive user interface",
    "Fast performance",
    "Great customer support",
    "Affordable pricing"
  ],
  "weaknesses": [
    "Lacks dark mode support",
    "Mobile app crashes on older devices",
    "Documentation could be more detailed",
    "Limited integrations"
  ],
  "featureRequests": [
    "Dark mode toggle",
    "API access for developers",
    "Team collaboration features",
    "Calendar sync capability"
  ],
  "overallSummary": "Users appreciate the product's intuitive design and good performance. Main concerns center around missing features like dark mode and better mobile support. The community is requesting enhanced integrations and developer APIs."
}
```

## How It Works

1. **Input**: Array of review strings
2. **Processing**: Sends reviews to Gemini API with structured prompt
3. **Analysis**: AI identifies patterns, themes, and recurring feedback
4. **Output**: Structured summary with categorized insights

## Component Features

- Beautiful gradient UI with icon indicators
- Separate sections for strengths, weaknesses, and requests
- Loading state with animated spinner
- Error handling and user-friendly messages
- Review count display
- "Analyze Again" button to generate new summary

## Tips for Best Results

1. **Quality Input**: Include diverse reviews (positive, negative, neutral)
2. **Quantity**: Works best with 10+ reviews for meaningful patterns
3. **Language**: Reviews should be in clear, readable language
4. **Caching**: Store summaries to avoid re-analyzing same reviews
5. **Filtering**: Remove spam or duplicate reviews before analyzing

## Error Handling

```typescript
const { summarize, loading, error } = useReviewSummary();

const result = await summarize(reviews);
if (error) {
  // Handle: "No reviews provided"
  // Handle: "API key not configured"
  // Handle: "Failed to parse review summary response"
}
```

## Performance Considerations

- Default temperature: 0.3 (for analytical consistency)
- Default max tokens: 800
- Typical response time: 2-5 seconds
- No caching - each call is fresh analysis

## Integration Example

```typescript
import { useReviews } from '@/lib/hooks';
import ReviewSummarizer from '@/components/ReviewSummarizer';

function ProductDetail({ productId }) {
  const { reviews } = useReviews(productId, { limit: 100 });
  const reviewTexts = reviews.map(r => r.content);

  return (
    <div>
      <h1>Product Details</h1>
      <ReviewSummarizer
        reviews={reviewTexts}
        productName="My Product"
      />
    </div>
  );
}
```

## Customization

### Custom Temperature

For more creative summaries:
```typescript
const { text } = await generateContent(prompt, {
  temperature: 0.7,
  maxTokens: 1000
});
```

### Custom Analysis Prompt

Create a wrapper function for specific analysis:
```typescript
export async function customReviewAnalysis(reviews: string[]) {
  const customPrompt = `
    Analyze reviews for the following specific criteria:
    - Enterprise readiness
    - Cost-effectiveness
    - Ease of deployment
    // ... custom criteria
  `;
  // ... call generateContent with custom prompt
}
```

## Limitations

- Free tier: 60 requests per minute
- Reviews should be in English
- Maximum reasonable review count: 100-200 (token limits)
- Safety filters may affect analysis of controversial content

## Next Steps

- Cache summaries in Supabase
- Add trending analysis (what's improving/worsening)
- Compare summaries across product versions
- Generate actionable recommendations
- Export summaries as PDF reports
