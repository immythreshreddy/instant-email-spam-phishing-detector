import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize GoogleGenAI SDK
const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Deep Email Forensic & Phishing Analysis endpoint
app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { emailText, sender = 'Unknown Sender', subject = 'No Subject' } = req.body;
    if (!emailText || typeof emailText !== 'string') {
      return res.status(400).json({ error: 'Valid emailText is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured. Built-in NLP/ML pipeline remains fully functional!',
      });
    }

    const prompt = `You are a Principal Cybersecurity & NLP Forensic Analyst specializing in spam filters, phishing detection, and social engineering counter-measures.
Analyze this email thoroughly:

Subject: ${subject}
Sender: ${sender}
Body:
"""
${emailText.slice(0, 4000)}
"""

Provide a structured JSON output with the following exact keys:
{
  "classification": "SPAM" | "HAM" | "PHISHING",
  "threatSeverity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidenceScore": number (0 to 100),
  "primaryIntent": string (1 brief sentence describing sender's goal),
  "socialEngineeringTactics": string[] (e.g. "False Urgency", "Authority Impersonation", "Artificial Scarcity", "Greed/Lottery Hook"),
  "suspiciousElements": string[] (specific phrases, links, or patterns found in this text),
  "filterEvadingTechniques": string[] (e.g., character substitution, hidden text, uppercase shouting, disguised links),
  "technicalVerdict": string (2-3 sentences explaining why a classic Bayesian or TF-IDF filter flags or passes this email),
  "securityAdvice": string (1-2 sentences on what the recipient should do or watch out for)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text ?? '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = {
        classification: 'UNKNOWN',
        technicalVerdict: rawText,
      };
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze:', error);
    return res.status(500).json({
      error: error.message || 'Internal error during email analysis',
    });
  }
});

// Email De-Spamify & Rewrite endpoint
app.post('/api/gemini/rewrite', async (req, res) => {
  try {
    const { emailText, tone = 'professional' } = req.body;
    if (!emailText || typeof emailText !== 'string') {
      return res.status(400).json({ error: 'Valid emailText is required' });
    }

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const prompt = `You are an expert copywriter and email deliverability engineer.
Take the following email text which was either flagged as spam or sounds promotional/risky, and rewrite it so it will safely pass Bayesian and TF-IDF spam filters while preserving the core message and intent.
Desired tone: ${tone} (e.g. professional, concise, friendly).
Rules:
- Eliminate spam trigger words (e.g. replace '100% free!', 'Act now or lose out!', 'CLICK HERE!', 'guaranteed cash') with natural, credible phrasing.
- Balance capitalization and punctuation.
- Maintain legitimate calls to action.

Email text:
"""
${emailText.slice(0, 3000)}
"""

Provide JSON:
{
  "rewrittenEmail": string,
  "changesMade": string[],
  "deliverabilityTips": string[]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/rewrite:', error);
    return res.status(500).json({
      error: error.message || 'Failed to rewrite email',
    });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SpamGuard NLP server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
