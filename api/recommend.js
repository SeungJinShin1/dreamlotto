/**
 * Backend: Vercel Serverless Function
 * Dependency: None (Uses native fetch in Node.js 18+)
 */

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
    }
  
    const { dream } = req.body;
  
    if (!dream) {
      return res.status(400).json({ error: 'Dream description is required.' });
    }
  
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
    const systemInstruction = `
      너는 신비로운 꿈 해몽가야. 사용자가 입력한 꿈 내용을 바탕으로 다음을 수행해:
      1. 긍정적이고 희망적인 해몽을 3문장 이내로 작성해.
      2. 연관된 로또 번호 6개(1~45 사이, 중복 없음)를 추천해.
      3. 행운의 아이템과 행운의 색상을 각각 하나씩 정해줘.
      
      반드시 아래의 JSON 형식으로만 응답해:
      {
        "interpretation": "해몽 텍스트",
        "lucky_numbers": [1, 2, 3, 4, 5, 6],
        "lucky_item": "아이템 이름",
        "lucky_color": "색상 이름"
      }
    `;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `System: ${systemInstruction}\nUser: ${dream}` }
              ]
            }
          ],
          generationConfig: {
              responseMimeType: "application/json"
          }
        }),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to fetch from Gemini');
      }
  
      // Extract the JSON string from Gemini's response
      const resultText = data.candidates[0].content.parts[0].text;
      const resultJson = JSON.parse(resultText);
  
      return res.status(200).json(resultJson);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({ error: '신비로운 기운이 일시적으로 차단되었습니다. 잠시 후 다시 시도해주세요.' });
    }
  }