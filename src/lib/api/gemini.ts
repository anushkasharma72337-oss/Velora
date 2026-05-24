/**
 * Gemini AI API Service
 * Provides functions to interact with Google's Gemini API
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface GeminiMessage {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
}

export interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
            role: string;
        };
        finishReason: string;
        index: number;
    }>;
    promptFeedback?: {
        blockReason?: string;
        safetyRatings?: Array<{
            category: string;
            probability: string;
        }>;
    };
}

export interface GeminiError {
    code: number;
    message: string;
    status: string;
}

/**
 * Generate content using Gemini API
 */
export async function generateContent(
    prompt: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        topK?: number;
    }
): Promise<{ text: string | null; error: string | null }> {
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            return {
                text: null,
                error: 'Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env.local',
            };
        }

        const { temperature = 0.7, maxTokens = 2048, topP = 0.95, topK = 40 } = options || {};

        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                generationConfig: {
                    temperature,
                    maxOutputTokens: maxTokens,
                    topP,
                    topK,
                },
                safetySettings: [
                    {
                        category: 'HARM_CATEGORY_HARASSMENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_HATE_SPEECH',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                    {
                        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
                    },
                ],
            }),
        });

        if (!response.ok) {
            const error = (await response.json()) as { error: GeminiError };
            return {
                text: null,
                error: error.error?.message || 'Failed to generate content',
            };
        }

        const data = (await response.json()) as GeminiResponse;

        if (data.promptFeedback?.blockReason) {
            return {
                text: null,
                error: `Request blocked: ${data.promptFeedback.blockReason}`,
            };
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return {
                text: null,
                error: 'No content generated',
            };
        }

        return { text, error: null };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            text: null,
            error: message,
        };
    }
}

/**
 * Generate product insights/summary using Gemini
 */
export async function generateProductInsight(
    productName: string,
    description: string,
    reviews: string[]
): Promise<{ insight: string | null; error: string | null }> {
    const prompt = `
Analyze the following product and reviews, then provide a concise AI insight summary.

Product Name: ${productName}
Description: ${description}

Recent Reviews:
${reviews.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Provide a brief, professional insight about this product (2-3 sentences max).
Focus on key strengths and potential areas for improvement.
`;

    return generateContent(prompt, { maxTokens: 300 });
}

/**
 * Generate review sentiment analysis
 */
export async function analyzeReviewSentiment(reviewText: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral' | null;
    confidence: number | null;
    summary: string | null;
    error: string | null;
}> {
    const prompt = `
Analyze the sentiment of the following review and respond with ONLY valid JSON (no markdown, no extra text):

Review: "${reviewText}"

Respond with exactly this JSON structure:
{
  "sentiment": "positive" or "negative" or "neutral",
  "confidence": 0.0 to 1.0,
  "summary": "1-2 sentence summary of the review"
}
`;

    const { text, error } = await generateContent(prompt, { temperature: 0.3, maxTokens: 150 });

    if (error || !text) {
        return {
            sentiment: null,
            confidence: null,
            summary: null,
            error: error || 'Failed to analyze sentiment',
        };
    }

    try {
        // Clean the response (remove markdown code blocks if present)
        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        return {
            sentiment: parsed.sentiment,
            confidence: parsed.confidence,
            summary: parsed.summary,
            error: null,
        };
    } catch {
        return {
            sentiment: null,
            confidence: null,
            summary: null,
            error: 'Failed to parse sentiment analysis response',
        };
    }
}

/**
 * Generate product tags/categories suggestion
 */
export async function generateProductTags(
    productName: string,
    description: string
): Promise<{ tags: string[] | null; error: string | null }> {
    const prompt = `
Suggest 5-7 relevant tags/categories for this product. Respond with ONLY valid JSON (no markdown):

Product Name: ${productName}
Description: ${description}

Respond with exactly this JSON structure:
{
  "tags": ["tag1", "tag2", "tag3", ...]
}

Make tags lowercase, concise, and relevant to the product category.
`;

    const { text, error } = await generateContent(prompt, { temperature: 0.5, maxTokens: 200 });

    if (error || !text) {
        return {
            tags: null,
            error: error || 'Failed to generate tags',
        };
    }

    try {
        // Clean the response
        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        return {
            tags: parsed.tags || [],
            error: null,
        };
    } catch {
        return {
            tags: null,
            error: 'Failed to parse tags response',
        };
    }
}

/**
 * Generate feature highlights from product description
 */
export async function generateFeatureHighlights(description: string): Promise<{
    features: string[] | null;
    error: string | null;
}> {
    const prompt = `
Extract and list the key features from this product description. Respond with ONLY valid JSON (no markdown):

Description: ${description}

Respond with exactly this JSON structure:
{
  "features": ["feature1", "feature2", "feature3", ...]
}

Make each feature a short, clear statement (5-10 words max).
`;

    const { text, error } = await generateContent(prompt, { temperature: 0.3, maxTokens: 250 });

    if (error || !text) {
        return {
            features: null,
            error: error || 'Failed to generate features',
        };
    }

    try {
        // Clean the response
        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        return {
            features: parsed.features || [],
            error: null,
        };
    } catch {
        return {
            features: null,
            error: 'Failed to parse features response',
        };
    }
}

/**
 * Generate a response to a user question about a product
 */
export async function answerProductQuestion(
    productName: string,
    productInfo: string,
    question: string
): Promise<{ answer: string | null; error: string | null }> {
    const prompt = `
Answer the following question about a product based on the provided information.

Product: ${productName}
Information:
${productInfo}

User Question: ${question}

Provide a helpful, concise answer (2-3 sentences).
`;

    return generateContent(prompt, { maxTokens: 300 });
}

/**
 * Generate review response suggestion
 */
export async function generateReviewResponse(
    reviewText: string,
    context?: string
): Promise<{ response: string | null; error: string | null }> {
    const prompt = `
Generate a professional and friendly response to the following product review.

Review: "${reviewText}"
${context ? `Context: ${context}` : ''}

Provide a response that:
- Acknowledges the reviewer's feedback
- Addresses any concerns mentioned
- Thanks them for their time
- Keeps it to 2-3 sentences

Response:`;

    return generateContent(prompt, { temperature: 0.7, maxTokens: 300 });
}

/**
 * Compare products using Gemini
 */
export async function compareProducts(
    products: Array<{
        name: string;
        description: string;
        price: number;
    }>
): Promise<{ comparison: string | null; error: string | null }> {
    const prompt = `
Provide a brief comparison of the following products.

${products.map((p, i) => `Product ${i + 1}: ${p.name}\nPrice: $${p.price}\nDescription: ${p.description}`).join('\n\n')}

Highlight key differences, value for money, and which might be best for different use cases.
Keep the response concise (3-4 sentences).
`;

    return generateContent(prompt, { maxTokens: 400 });
}

export interface ReviewSummary {
    strengths: string[];
    weaknesses: string[];
    featureRequests: string[];
    overallSummary: string;
}

/**
 * Summarize all reviews and extract key insights
 */
export async function summarizeReviews(reviews: string[]): Promise<{
    summary: ReviewSummary | null;
    error: string | null;
}> {
    if (!reviews || reviews.length === 0) {
        return {
            summary: null,
            error: 'No reviews provided',
        };
    }

    const prompt = `
Analyze the following user reviews and provide a comprehensive summary. 
Respond with ONLY valid JSON (no markdown, no extra text):

Reviews:
${reviews.map((r, i) => `${i + 1}. "${r}"`).join('\n')}

Respond with exactly this JSON structure:
{
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "featureRequests": ["requested feature 1", "requested feature 2"],
    "overallSummary": "A 2-3 sentence summary of the product based on all reviews"
}

Guidelines:
- Extract 3-5 key strengths from the reviews
- Extract 3-5 key weaknesses mentioned
- List 2-4 commonly requested features
- Provide a balanced overall summary
- Use concise, professional language
`;

    const { text, error } = await generateContent(prompt, { temperature: 0.3, maxTokens: 800 });

    if (error || !text) {
        return {
            summary: null,
            error: error || 'Failed to summarize reviews',
        };
    }

    try {
        // Clean the response (remove markdown code blocks if present)
        const cleanedText = text
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedText);

        return {
            summary: {
                strengths: parsed.strengths || [],
                weaknesses: parsed.weaknesses || [],
                featureRequests: parsed.featureRequests || [],
                overallSummary: parsed.overallSummary || '',
            },
            error: null,
        };
    } catch {
        return {
            summary: null,
            error: 'Failed to parse review summary response',
        };
    }
}
