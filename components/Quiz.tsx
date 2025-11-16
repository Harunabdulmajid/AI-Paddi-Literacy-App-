import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Quiz as QuizType } from '../types';
import { CheckCircle, XCircle, Mic, RefreshCw } from 'lucide-react';
import { useTranslations } from '../i18n';
import { AppContext } from './AppContext';
import { useSpeech } from '../services/hooks/useSpeech';

interface QuizProps {
  quiz: QuizType;
  onComplete: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ quiz, onComplete }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("Quiz must be used within an AppProvider");
  const { addTransaction, isVoiceModeEnabled, language } = context;
  const { isListening, speak, startListening } = useSpeech();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [lastPointsAwarded, setLastPointsAwarded] = useState(0);
  const t = useTranslations();

  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const currentQuestion = quiz.questions[currentQuestionIndex];

  // FIX: Refactored the auto-advance logic to use a useCallback hook.
  // This is a more standard and robust pattern than using a ref to hold the function,
  // and it resolves the obscure TypeScript error about incorrect argument counts.
  const advanceToNextStep = useCallback(() => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(null);
      setInputValue('');
    } else {
      onComplete();
    }
  }, [currentQuestionIndex, quiz.questions.length, onComplete]);

  useEffect(() => {
    // Auto-advance only on correct answers
    if (isCorrect) {
      const timer = setTimeout(advanceToNextStep, 1500);

      return () => clearTimeout(timer);
    }
  }, [isCorrect, advanceToNextStep]);

  const handleSubmit = useCallback((answer: number | string) => {
    if (isAnswered) return;

    let isAnswerCorrect = false;
    if (currentQuestion.type === 'multiple-choice' && typeof answer === 'number') {
        setSelectedAnswer(answer);
        isAnswerCorrect = answer === currentQuestion.correctAnswerIndex;
    } else if (currentQuestion.type === 'fill-in-the-blank' && typeof answer === 'string') {
        setInputValue(answer);
        isAnswerCorrect = answer.toLowerCase().trim() === currentQuestion.answer?.toLowerCase().trim();
    }
    
    setIsAnswered(true);
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
        const points = 10 + (streak * 2);
        setLastPointsAwarded(points);
        addTransaction({
            type: 'earn',
            description: `Correct quiz answer`,
            amount: points
        });
        setStreak(prev => prev + 1);
    } else {
        setStreak(0);
    }
  }, [isAnswered, currentQuestion, streak, addTransaction]);

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setInputValue('');
    setIsAnswered(false);
    setIsCorrect(null);
  };

  useEffect(() => {
    if (isVoiceModeEnabled && !isAnswered) {
      // Voice logic can be added here if needed in the future
    }
  }, [isVoiceModeEnabled, isAnswered, currentQuestion, language, speak, startListening, handleSubmit]);

  useEffect(() => {
    optionRefs.current = optionRefs.current.slice(0, currentQuestion.options.length);
  }, [currentQuestionIndex, currentQuestion.options.length]);

  return (
    <div className="mt-12 pt-8 border-t-2 border-dashed border-neutral-200 animate-fade-in">
      <h2 className="text-2xl font-bold text-neutral-800 mb-2">{t.lesson.quizTitle}</h2>
      <p className="font-semibold text-neutral-600 mb-6">{currentQuestionIndex + 1} / {quiz.questions.length}: {currentQuestion.question}</p>

      {currentQuestion.type === 'multiple-choice' ? (
        <div role="radiogroup" className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === currentQuestion.correctAnswerIndex;
            let buttonClass = 'bg-white hover:bg-neutral-100 border-neutral-300';

            if (isAnswered) {
              if (isCorrectAnswer) {
                buttonClass = 'bg-green-100 border-green-400 text-green-800';
              } else if (isSelected) {
                buttonClass = 'bg-red-100 border-red-400 text-red-800';
              } else {
                 buttonClass = 'bg-neutral-100 border-neutral-200 opacity-60';
              }
            } else if (isSelected) {
                buttonClass = 'bg-primary/10 border-primary';
            }

            return (
              <button
                key={index}
                ref={(el) => { optionRefs.current[index] = el; }}
                onClick={() => handleSubmit(index)}
                disabled={isAnswered}
                role="radio"
                aria-checked={isSelected}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all text-md flex items-center justify-between ${buttonClass}`}
              >
                <span>{option}</span>
                {isAnswered && isSelected && (isCorrect ? <CheckCircle /> : <XCircle />)}
              </button>
            );
          })}
        </div>
      ) : ( // Fill-in-the-blank
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(inputValue); }} className="flex gap-2">
           <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t.lesson.yourAnswer}
                disabled={isAnswered}
                className="flex-grow p-4 border-2 border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary bg-white text-neutral-900"
            />
            <button
                type="submit"
                disabled={isAnswered || !inputValue.trim()}
                className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark transition disabled:bg-neutral-300"
            >
                {t.lesson.submitAnswer}
            </button>
        </form>
      )}

      {isAnswered && (
        isCorrect ? (
             <div className="mt-4 p-4 rounded-lg text-center bg-green-100 text-green-900 animate-fade-in">
              <p className="font-bold">{t.lesson.quizCorrect(lastPointsAwarded)}</p>
              <p>{currentQuestion.explanation}</p>
              {streak > 1 && <p className="font-bold mt-1">{t.lesson.quizStreak(streak)}</p>}
            </div>
        ) : (
            <div className="mt-4 p-4 rounded-lg text-center bg-red-100 text-red-900 animate-fade-in">
                <p className="font-bold">{t.lesson.quizIncorrect}</p>
                {currentQuestion.hint && <p className="mt-2 text-sm"><strong>Hint:</strong> {currentQuestion.hint}</p>}
                <button
                    onClick={handleTryAgain}
                    className="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto mx-auto bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-dark transition"
                >
                    <RefreshCw size={16}/> {t.lesson.tryAgainButton}
                </button>
            </div>
        )
      )}
      
      {isVoiceModeEnabled && !isAnswered && (
          <div className="mt-4 flex justify-center">
            <button onClick={() => {}} className="p-3 bg-neutral-100 rounded-full text-primary">
                <Mic className={isListening ? 'animate-pulse' : ''} />
            </button>
        </div>
      )}
    </div>
  );
};
