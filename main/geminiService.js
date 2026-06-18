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

async function evaluateAnswers(qaPairs, apiKey, lang = 'en') {
  if (!apiKey) return { error: 'Missing Gemini API key.' };
  
  const langText = lang === 'cs' ? 'Czech' : 'English';
  const prompt = `Evaluate the student's answers to the provided questions. Here are the questions, student answers, and expected hints:\n${JSON.stringify(qaPairs)}\n\nAssign a total score from 0 (completely wrong) to 10 (excellent understanding). Write a short, motivating evaluation in ${langText}. Reply ONLY in JSON format, without markdown blocks: {"score": 8, "feedback": "Great job..."}`;

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
    return { evaluation: JSON.parse(textResult) };
  } catch (error) {
    console.error('[Gemini Service] Evaluate Error:', error);
    return { error: 'Failed to evaluate answers.' };
  }
}

module.exports = { generateQuestions, evaluateAnswers };
