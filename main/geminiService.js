/**
 * @file geminiService.js
 * @description Internal integration with Google's Gemini LLM.
 * Facilitates the generation of context-aware educational material and subsequent
 * evaluation of user responses to determine XP progression.
 */

async function generateQuestions(topic, apiKey, lang = 'en', documentText = '') {
  if (!apiKey) return { error: 'Missing Gemini API key.' };
  
  const langText = lang === 'cs' ? 'Czech' : 'English';
  let prompt = `You are a teacher. Generate exactly 3 questions in ${langText} that test knowledge about: "${topic}". Reply ONLY in JSON format matching this schema without markdown blocks: [{"id": 1, "question": "Question?", "hint": "Key concepts or expected direction"}]`;
  
  if (documentText) {
    prompt += `\n\nHere is the provided study material. Base your questions primarily on this document:\n\n${documentText}`;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'API Error');
    
    let textResult = data.candidates[0].content.parts[0].text;
    return { questions: JSON.parse(textResult) };
  } catch (error) {
    console.error('[Gemini Service] Generate Error:', error);
    return { error: 'Failed to generate questions. Check API key or network connection.' };
  }
}

async function evaluateAnswers(qaPairs, apiKey, lang = 'en', persona = 'encouraging', scratchpadText = '', onChunk) {
  if (!apiKey) return { error: 'Missing Gemini API key.' };
  
  const langText = lang === 'cs' ? 'Czech' : 'English';
  
  let personaPrompt = "";
  if (persona === 'hardcore') {
    personaPrompt = `You are a brutally strict, David Goggins-style teacher. Your feedback must be brutal, honest, and EXTREMELY concise. DO NOT address individual questions. Give ONE overall comment.

EXAMPLES OF YOUR OUTPUT FORMAT:
SCORE: 0
Zero effort. Zero results. You didn't even try. Get back to the material and don't come back until you're ready to put in the work.

SCORE: 8
Not terrible, but not perfect. You missed the core concept of state management. Stop making excuses and fix the gaps in your knowledge.

SCORE: 10
Flawless execution. But don't get comfortable. The next topic will break you if you lose focus. Stay hard.`;
  } else if (persona === 'operator') {
    personaPrompt = `You are a tactical, cybernetic mission operator. Your feedback must be cold, precise, and EXTREMELY concise. DO NOT address individual questions. Give ONE overall comment.

EXAMPLES OF YOUR OUTPUT FORMAT:
SCORE: 0
Mission failed. Intel acquisition zero. Return to base and review mission briefing.

SCORE: 7
Partial success. Target acquired but execution lacked precision in the routing protocols. Recalibrate and try again.

SCORE: 10
Mission accomplished. Optimal execution. Awaiting next directive.`;
  } else {
    personaPrompt = `You are an encouraging and supportive teacher. Your feedback must be motivating, kind, and EXTREMELY concise. DO NOT address individual questions. Give ONE overall comment.

EXAMPLES OF YOUR OUTPUT FORMAT:
SCORE: 2
I see you're struggling, but that's part of the learning process! Review the section on components again and you'll get it next time.

SCORE: 10
Fantastic work! You have a perfect grasp of the material. Keep up this incredible momentum!`;
  }

  let prompt = `${personaPrompt}\n\n====================\n\nEvaluate the student's answers to the provided questions based ONLY on the criteria above. Here are the questions, student answers, and expected hints:\n${JSON.stringify(qaPairs)}\n\n`;
  if (scratchpadText) {
    prompt += `Additionally, the student wrote these notes during their focus session. Use them for context:\n"${scratchpadText}"\n\n`;
  }
  prompt += `Assign a total score from 0 to 10. Write your evaluation in ${langText}. \nCRITICAL: Follow the exact format and length of the examples provided. DO NOT write more than 3 sentences. DO NOT use bullet points.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API Error');
    }

    let fullText = '';
    // Process SSE stream
    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr) {
              try {
                const dataObj = JSON.parse(dataStr);
                const textPart = dataObj.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textPart) {
                  fullText += textPart;
                  if (onChunk) onChunk(textPart);
                }
              } catch (e) {
                // ignore JSON parse errors
              }
            }
          }
        }
      }
    }
    
    let score = 5;
    let feedback = fullText;
    const scoreMatch = fullText.match(/SCORE:\s*(\d+)/i);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1], 10);
      feedback = fullText.replace(/.*?SCORE:\s*\d+\s*/is, '').trim();
    }
    
    if (!feedback) {
      feedback = lang === 'cs' ? 'Nebylo poskytnuto žádné hodnocení.' : 'No feedback provided.';
    }
    
    return { evaluation: { score, feedback } };
  } catch (error) {
    console.error('[Gemini Service] Evaluate Error:', error);
    return { error: 'Failed to evaluate answers.' };
  }
}

module.exports = { generateQuestions, evaluateAnswers };
