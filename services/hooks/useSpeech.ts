import { useState, useRef, useCallback, useEffect } from 'react';
import { Language } from '../../types';

const languageMap: Record<Language, string> = {
    [Language.English]: 'en-US',
    [Language.Hausa]: 'ha-NG',
    [Language.Yoruba]: 'yo-NG',
    [Language.Igbo]: 'ig-NG',
    [Language.Pidgin]: 'en-NG',
    [Language.Swahili]: 'sw-KE',
    [Language.Amharic]: 'am-ET',
    [Language.Zulu]: 'zu-ZA',
    [Language.Shona]: 'sn-ZW',
    [Language.Somali]: 'so-SO',
};

// --- Speech Recognition Singleton ---
// This is created once and reused to avoid issues with multiple instances.
let recognition: any = null;
try {
  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
      recognition = new SpeechRecognition();
  }
} catch (e) {
  console.error("SpeechRecognition is not supported or failed to initialize.", e);
}


export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const isListeningRef = useRef(false);

    // Use a ref to store state that shouldn't trigger re-renders but needs to be
    // accessed by event handlers without stale closures.
    const listeningStateRef = useRef({
      isContinuous: false,
      callback: (transcript: string) => {},
    });
    
    // --- Effect to set up and tear down event listeners ---
    useEffect(() => {
        if (!recognition) return;

        const handleStart = () => {
            isListeningRef.current = true;
            setIsListening(true);
        };
        
        const handleResult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            if (listeningStateRef.current.callback) {
                listeningStateRef.current.callback(transcript);
            }
        };

        const handleError = (event: any) => {
            const error = event.error;
            if (error === 'network') {
                console.warn('Speech recognition network error. Attempting to recover.');
                // We don't disable continuous listening for network errors, `onend` will handle restart.
            } else if (error !== 'aborted' && error !== 'no-speech') {
                console.error('Speech recognition error:', error);
                // For other errors (like 'not-allowed' or 'audio-capture'), stop trying to restart.
                listeningStateRef.current.isContinuous = false;
            }
            isListeningRef.current = false;
            setIsListening(false);
        };
        
        const handleEnd = () => {
            isListeningRef.current = false;
            setIsListening(false);
            // If it was a continuous session that ended (e.g., due to browser timeout or a recoverable network error),
            // and we still want it to be listening, restart it after a short delay.
            if (listeningStateRef.current.isContinuous) {
                setTimeout(() => {
                    // Check again in case stopListening was called during the timeout
                    if (listeningStateRef.current.isContinuous && !isListeningRef.current) {
                        try {
                            recognition.start();
                        } catch(err) {
                            console.error("Error restarting speech recognition:", err);
                        }
                    }
                }, 1000); // 1-second delay to prevent spamming on persistent network issues.
            }
        };

        recognition.onstart = handleStart;
        recognition.onresult = handleResult;
        recognition.onerror = handleError;
        recognition.onend = handleEnd;
        
        // Cleanup function when the component using the hook unmounts.
        return () => {
            listeningStateRef.current.isContinuous = false;
            if (recognition) {
                recognition.abort();
            }
            isListeningRef.current = false;
        };
    }, []); // Empty array ensures this effect runs only once.

    const speak = useCallback((text: string, lang: Language) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = languageMap[lang] || 'en-US';
        synthRef.current.speak(utterance);
    }, []);

    // For single-shot recognition (like in the Quiz)
    const startListening = useCallback((callback: (transcript: string) => void, lang: Language) => {
        if (!recognition || isListeningRef.current) return;
        
        listeningStateRef.current = {
            isContinuous: false,
            callback: callback,
        };
        
        recognition.lang = languageMap[lang] || 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting speech recognition:", e);
        }
    }, []);

    // For continuous recognition (global navigation)
    const startContinuousListening = useCallback((callback: (transcript: string) => void, lang: Language) => {
        if (!recognition || isListeningRef.current) return;

        listeningStateRef.current = {
            isContinuous: true,
            callback: callback,
        };

        recognition.lang = languageMap[lang] || 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;
         try {
            recognition.start();
        } catch (e) {
            console.error("Error starting continuous speech recognition:", e);
        }
    }, []);

    const stopListening = useCallback(() => {
        // This is the key part: we signal that we no longer want to be listening.
        // The onend handler will then see isContinuous is false and won't restart.
        listeningStateRef.current.isContinuous = false;
        if (recognition && isListeningRef.current) {
            recognition.stop();
        } else {
            // If it's not listening but we call stop, ensure the state is correct.
            isListeningRef.current = false;
            setIsListening(false);
        }
    }, []);

    return { isListening, speak, startListening, startContinuousListening, stopListening };
};