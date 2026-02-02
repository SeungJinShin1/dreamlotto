/**
 * Backend: Vercel Serverless Function
 * Model: Gemini 2.5 Flash (2026 Standard)
 * Features: Exponential Backoff, Native Fetch, JSON Mode
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed.' });
    }
  
    const { dream } = req.body;
    if (!dream) {
      return res.status(400).json({ error: '꿈 내용을 입력해주세요.' });
    }
  
    const apiKey = process.env.GEMINI_API_KEY || "";
    // Gemini 2.5 Flash Preview Endpoint (2026 Standard)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
    const systemPrompt = `너는 신비로운 꿈 해몽가야. 긍정적인 해몽과 로또 번호 6개, 행운의 아이템, 행운의 색상을 추천해줘.`;
    
    const payload = {
      contents: [{ 
        parts: [{ 
          text: `사용자의 꿈: ${dream}\n위 내용을 바탕으로 해몽과 로또 번호를 추천해줘.` 
        }] 
      }],
      systemInstruction: { 
        parts: [{ text: systemPrompt }] 
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            interpretation: { type: "STRING" },
            lucky_numbers: { 
              type: "ARRAY", 
              items: { type: "NUMBER" },
              minItems: 6,
              maxItems: 6
            },
            lucky_item: { type: "STRING" },
            lucky_color: { type: "STRING" }
          },
          required: ["interpretation", "lucky_numbers", "lucky_item", "lucky_color"]
        }
      }
    };
  
    // Exponential Backoff Implementation (Up to 5 retries)
    const fetchWithRetry = async (url, options, maxRetries = 5) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, options);
          if (response.ok) return response;
          
          // Only retry on rate limits or server errors
          if (response.status !== 429 && response.status < 500) {
            return response;
          }
        } catch (err) {
          if (i === maxRetries - 1) throw err;
        }
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      return fetch(url, options);
    };
  
    try {
      const response = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error?.message || 'API 호출 실패');
      }
  
      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('응답 데이터 형식이 올바르지 않습니다.');
      }
  
      const finalData = JSON.parse(content);
      return res.status(200).json(finalData);
  
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ 
        error: '신비로운 기운을 읽는 도중 오류가 발생했습니다.',
        details: error.message 
      });
    }
  }