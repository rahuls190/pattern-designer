try {
  process.loadEnvFile();
} catch (e) {}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(express.static(__dirname));

app.post('/api/generate-pattern-from-image', async (req, res) => {
  try {
    const { image, imageUrl, prompt } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please set your Gemini API key in environment variables.'
      });
    }

    let mimeType = 'image/jpeg';
    let base64Data = '';

    if (image) {
      if (image.startsWith('data:')) {
        const matches = image.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = image.split(',')[1] || image;
        }
      } else {
        base64Data = image;
      }
    } else if (imageUrl) {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) {
        return res.status(400).json({ error: `Failed to fetch image from URL: ${imgRes.statusText}` });
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } else {
      return res.status(400).json({ error: 'No image data or image URL was provided.' });
    }

    const ai = new GoogleGenAI();
    const systemPrompt = `You are an expert mathematician and geometrician specializing in Islamic geometric patterns, tilings, lattices, and decorative grid ornament (Field, Critchlow, Hankin, Kaplan methods).
Your task is to analyze the provided pattern image and reverse-engineer its exact repeating grid structure into a "Draw on a grid" specification.

CRITICAL RULES FOR PATTERN SPECIFICATION:
1. Grid Type (gType):
   - Choose "square" for 4-fold, 8-fold, orthogonal, diamond, or rectilinear lattices.
   - Choose "iso" for 3-fold, 6-fold, 12-fold, hexagonal, or isometric triangle lattices.
2. Repeat Dimensions (gW, gH):
   - Repeat width and height in grid steps (squares or triangle units).
   - Typically between 4 and 16 (e.g. 6x6, 8x8, 10x10, 12x12). For "iso" grid, gW and gH must be identical.
3. Subdivisions (gSub):
   - Points per square/cell. Usually 1 (for main vertices) or 2 (for midpoints / half-steps).
4. Symmetry (gSym):
   - For square: "none", "mx" (mirror x), "my" (mirror y), "mxy" (both mirrors), "r2" (2-fold rotation), "r4" (4-fold rotation), "d4" (4-fold + mirrors).
   - For iso: "none", "m" (mirror), "r2", "r3", "r6", "r3m", "d6" (6-fold + mirrors).
5. Line Segments (gData):
   - A semicolon-separated string of integer coordinate 4-tuples: "x1,y1,x2,y2;x1,y1,x2,y2;..."
   - Coordinates are integer grid steps ranging from 0 to gW*gSub horizontally and 0 to gH*gSub vertically.
   - Every line connects two valid integer grid points. Lines should form closed star motifs, hexagons, octagons, diamonds, bands, or interconnected straps.
6. Optional Circles (gCirc):
   - Format: "x,y,radius;..." if concentric rings, rosettes, or circular medallions are prominent.

Analyze the image carefully to capture its authentic motif proportions, star counts, and tessellation boundaries.`;

    const userInstruction = prompt 
      ? `Extract the geometric grid pattern from this image. Additional guidance: ${prompt}`
      : 'Analyze this geometric pattern or architectural ornament and convert it into a complete, repeating grid pattern specification.';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            },
            {
              text: `${systemPrompt}\n\n${userInstruction}`
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            name: { type: 'STRING', description: 'Descriptive title of the geometric pattern' },
            gType: { type: 'STRING', enum: ['square', 'iso'], description: 'Grid lattice type' },
            gW: { type: 'INTEGER', description: 'Repeat width (4-24)' },
            gH: { type: 'INTEGER', description: 'Repeat height (4-24)' },
            gSub: { type: 'INTEGER', description: 'Subdivisions per cell (1-3)' },
            gSym: { 
              type: 'STRING', 
              enum: ['none', 'mx', 'my', 'mxy', 'r2', 'r4', 'd4', 'm', 'r3', 'r6', 'r3m', 'd6'], 
              description: 'Symmetry group' 
            },
            gData: { type: 'STRING', description: 'Semicolon-separated line segments "x1,y1,x2,y2;..."' },
            gCirc: { type: 'STRING', description: 'Optional semicolon-separated circles "x,y,r;..."' },
            explanation: { type: 'STRING', description: 'Geometric structure analysis and detected motifs' }
          },
          required: ['name', 'gType', 'gW', 'gH', 'gSub', 'gSym', 'gData']
        }
      }
    });

    const resultText = response.text;
    const parsedData = JSON.parse(resultText);
    return res.json({ success: true, pattern: parsedData });
  } catch (error) {
    console.error('Error generating pattern from image:', error);
    let msg = error.message || 'Failed to generate pattern from image.';
    try {
      const parsed = JSON.parse(msg);
      if (parsed && parsed.error && parsed.error.message) {
        msg = parsed.error.message;
      }
    } catch (e) {}
    return res.status(500).json({ error: msg });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pattern Designer server running on http://0.0.0.0:${PORT}`);
});
