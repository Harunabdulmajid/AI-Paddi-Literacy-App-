import React, { useState, useContext, useEffect, useRef } from 'react';
import { Scenario } from '../types';
import { CheckCircle, ArrowRight, User, AlertCircle, Loader2 } from 'lucide-react';
import { useTranslations } from '../i18n';
import { AppContext } from './AppContext';

// Simple Canvas Confetti Component
const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const particleCount = 150;
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: window.innerWidth / 2, // Start from center
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 3,
        gravity: 0.25,
        drag: 0.95
      });
    }

    let animationId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        if (p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
             particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(render);
      }
    };
    render();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ zIndex: 9999 }} />;
};

interface ScenarioChallengeProps {
  scenario: Scenario;
  onComplete: () => void;
}

export const ScenarioChallenge: React.FC<ScenarioChallengeProps> = ({ scenario, onComplete }) => {
  const context = useContext(AppContext);
  if (!context) throw new Error("ScenarioChallenge must be used within an AppProvider");
  const { addTransaction } = context;
  const t = useTranslations();

  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Use a ref for onComplete to prevent useEffect cleanup issues
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleChoiceSelect = (index: number) => {
    if (isSubmitted && selectedChoiceIndex !== null && scenario.choices[selectedChoiceIndex].isOptimal) return;
    setSelectedChoiceIndex(index);
    setIsSubmitted(false); // Reset submission state if they change selection
  };

  const handleConfirm = () => {
    if (selectedChoiceIndex === null) return;
    
    setIsSubmitted(true);
    const isCorrect = scenario.choices[selectedChoiceIndex].isOptimal;

    if (isCorrect) {
        if (attempts === 0) {
            addTransaction({
                type: 'earn',
                description: `Solved scenario: ${scenario.title}`,
                amount: 25
            });
        }
        setShowConfetti(true);
        setCountdown(3); // Start 3s countdown
    } else {
        setAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
      if (countdown !== null && countdown > 0) {
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
          return () => clearTimeout(timer);
      } else if (countdown === 0) {
          onCompleteRef.current();
      }
  }, [countdown]);

  const isCorrect = selectedChoiceIndex !== null && scenario.choices[selectedChoiceIndex].isOptimal;

  return (
    <div className="mt-12 pt-8 border-t-2 border-dashed border-neutral-200 animate-fade-in relative">
      {showConfetti && <Confetti />}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
            <User size={28} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-neutral-800">{t.lesson.scenarioChallenge || "Scenario Challenge"}</h2>
            <p className="text-neutral-500 font-medium">{scenario.title}</p>
        </div>
      </div>

      <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200 mb-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-1.5 h-full bg-primary"></div>
         <h3 className="font-bold text-lg text-neutral-700 mb-2">The Situation:</h3>
         <p className="text-lg text-neutral-800 leading-relaxed">{scenario.situation}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-neutral-600">What would you do?</h3>
        {scenario.choices.map((choice, index) => {
            const isSelected = selectedChoiceIndex === index;
            let containerClass = "border-2 border-neutral-200 bg-white hover:border-primary/50";
            
            if (isSelected) {
                containerClass = "border-primary bg-primary/5 ring-1 ring-primary";
            }
            if (isSubmitted && isSelected) {
                if (choice.isOptimal) {
                    containerClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                } else {
                    containerClass = "border-red-400 bg-red-50 ring-1 ring-red-400";
                }
            }

            return (
                <button
                    key={index}
                    onClick={() => handleChoiceSelect(index)}
                    disabled={isSubmitted && isCorrect}
                    className={`w-full text-left p-5 rounded-xl transition-all duration-200 relative group ${containerClass}`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-primary' : 'border-neutral-300'}`}>
                            {isSelected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                        </div>
                        <span className="font-medium text-lg text-neutral-800">{choice.text}</span>
                    </div>
                </button>
            );
        })}
      </div>

      {selectedChoiceIndex !== null && !isSubmitted && (
          <div className="mt-6 flex justify-end">
              <button 
                onClick={handleConfirm}
                className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-transform active:scale-95 flex items-center gap-2"
              >
                  Make Decision <ArrowRight size={20} />
              </button>
          </div>
      )}

      {isSubmitted && (
          <div className={`mt-6 p-6 rounded-xl animate-slide-up ${isCorrect ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              <div className="flex items-start gap-4">
                  {isCorrect ? <CheckCircle size={32} className="flex-shrink-0" /> : <AlertCircle size={32} className="flex-shrink-0" />}
                  <div className="flex-grow">
                      <h4 className="font-bold text-xl mb-1">{isCorrect ? "Excellent Decision!" : "Not quite ideal..."}</h4>
                      <p className="text-lg leading-relaxed">{scenario.choices[selectedChoiceIndex!].response}</p>
                      
                      {isCorrect ? (
                          <button 
                            onClick={() => onCompleteRef.current()}
                            className="mt-4 bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-all inline-flex items-center gap-2 shadow-lg scale-105 transform origin-left"
                          >
                              {countdown !== null && countdown > 0 ? (
                                  <>Continuing in {countdown}s <Loader2 className="animate-spin" size={18}/></>
                              ) : (
                                  <>Complete Lesson <ArrowRight size={18} /></>
                              )}
                          </button>
                      ) : (
                          <button 
                            onClick={() => { setIsSubmitted(false); setSelectedChoiceIndex(null); }}
                            className="mt-4 bg-white text-red-700 font-bold py-2 px-6 rounded-lg hover:bg-red-50 transition border border-red-200"
                          >
                              Try Another Option
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};