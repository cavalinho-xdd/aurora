import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

function QuizScreen({ quizData, quizError, apiKey, onSubmit, persona, scratchpadText }) {
  const { t } = useTranslation();
  const [answers, setAnswers] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [streamedText, setStreamedText] = useState('');

  React.useEffect(() => {
    if (window.api && window.api.gemini && window.api.gemini.onStream) {
      window.api.gemini.onStream((chunk) => {
        setStreamedText(prev => prev + chunk);
      });
    }
  }, []);

  if (!quizData || quizData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h3 className="text-2xl font-bold text-white mb-4">{t('quizScreen.notAvailable')}</h3>
        <p className="text-gray-500 mb-8 font-light max-w-md mx-auto">{quizError || t('quizScreen.failedToGenerate')}</p>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-full bg-white/10 border border-white/15 text-white font-medium hover:bg-white/15 transition-colors duration-150 ease-ui-out active:scale-95" 
          onClick={() => onSubmit(0, t('quizScreen.notAvailable'))}
        >
          {t('quizScreen.continue')}
        </motion.button>
      </div>
    );
  }

  const handleTextChange = (id, text) => {
    setAnswers(prev => ({ ...prev, [id]: text }));
  };

  const handleSubmit = async () => {
    setIsEvaluating(true);
    const pairs = quizData.map(q => ({
      question: q.question,
      hint: q.hint,
      answer: answers[q.id] || t('quizScreen.dontKnow')
    }));

    if (window.api && window.api.gemini && apiKey) {
      try {
        setStreamedText('');
        const res = await window.api.gemini.evaluate(pairs, apiKey, 'en', persona, scratchpadText);
        if (res && res.evaluation) {
          setEvaluationResult(res.evaluation);
        } else {
          setEvaluationResult({ score: 2, feedback: t('quizScreen.apiError') });
        }
      } catch (err) {
        console.error("Evaluation fallback", err);
        setEvaluationResult({ score: 2, feedback: t('quizScreen.fallbackApi') });
      }
    } else {
      setEvaluationResult({ score: 2, feedback: t('quizScreen.fallbackApi') });
    }
    setIsEvaluating(false);
  };

  if (isEvaluating || evaluationResult) {
    let displayScore = evaluationResult?.score ?? '?';
    let displayFeedback = evaluationResult?.feedback ?? streamedText;

    if (isEvaluating && !evaluationResult) {
      const scoreMatch = streamedText.match(/SCORE:\s*(\d+)/i);
      if (scoreMatch) {
        displayScore = scoreMatch[1];
        displayFeedback = streamedText.replace(/.*?SCORE:\s*\d+\s*/is, '').trim();
      }
    }

    return (
      <motion.div 
        className="flex flex-col items-center py-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <CheckCircle2 size={56} className="text-focus-secondary mb-8" />
        <h2 className="text-2xl font-bold text-white mb-8">{isEvaluating ? t('quizScreen.evaluating', 'Evaluating...') : t('quizScreen.evaluation')}</h2>
        <div className={`text-8xl font-black text-white tracking-tighter mb-2 leading-none font-mono ${isEvaluating ? 'opacity-50' : ''}`}>
          {displayScore}
        </div>
        <div className="text-gray-600 text-lg mb-10">/ 10</div>
        <p className={`text-lg leading-relaxed mb-12 max-w-md mx-auto font-light text-left ${isEvaluating ? 'text-gray-400' : 'text-gray-300'}`}>
          {displayFeedback}
          {isEvaluating && <span className="inline-block w-2 h-5 bg-focus-primary ml-1 animate-pulse align-middle"></span>}
        </p>
        {!isEvaluating && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-focus-primary text-white font-bold py-4 px-10 rounded-full shadow-glow-cta hover:shadow-glow-cta-hover transition-shadow" 
            onClick={() => onSubmit(evaluationResult.score, evaluationResult.feedback)}
          >
            {t('quizScreen.claimXp')}
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          {t('quizScreen.knowledgeCheckTitle')}
        </h2>
        <p className="text-gray-500 font-light text-lg mb-10">
          Answer to earn your XP.
        </p>
      </motion.div>
      
      <div className="flex flex-col gap-10 mb-10">
        {quizData.map((q, index) => (
          <motion.div 
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="pb-10 border-b border-white/5 last:border-0"
          >
            <p className="font-medium text-lg text-white mb-4 leading-relaxed">
              <span className="text-focus-primary mr-2">{index + 1}.</span> {q.question}
            </p>
            <textarea 
              placeholder={t('quizScreen.yourAnswer')}
              value={answers[q.id] || ''}
              onChange={(e) => handleTextChange(q.id, e.target.value)}
              rows="3"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/50 transition-colors resize-none"
            />
          </motion.div>
        ))}
      </div>
      
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-focus-primary text-white font-bold py-4 px-10 rounded-full shadow-glow-cta hover:shadow-glow-cta-hover transition-shadow flex items-center gap-3 self-start disabled:opacity-50 disabled:hover:shadow-none" 
        onClick={handleSubmit} 
        disabled={isEvaluating}
      >
        <Send size={18} />
        {isEvaluating ? t('quizScreen.evaluating') : t('quizScreen.submit')}
      </motion.button>
    </div>
  );
}

export default QuizScreen;
