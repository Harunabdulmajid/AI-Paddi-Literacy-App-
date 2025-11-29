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
let recognition: any = null;
let isSupported = false;

try {
  // @ts-ignore
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      isSupported = true;
  }
} catch (e) {
  console.error("SpeechRecognition is not supported or failed to initialize.", e);
}

export const useSpeech = () => {
    const [isListening, setIsListening] = useState(false);
    const synthRef = useRef(window.speechSynthesis);
    const isListeningRef = useRef(false);

    const listeningStateRef = useRef({
      isContinuous: false,
      callback: (transcript: string) => {},
    });
    
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
            } else if (error !== 'aborted' && error !== 'no-speech') {
                console.error('Speech recognition error:', error);
                listeningStateRef.current.isContinuous = false;
            }
            isListeningRef.current = false;
            setIsListening(false);
        };
        
        const handleEnd = () => {
            isListeningRef.current = false;
            setIsListening(false);
            if (listeningStateRef.current.isContinuous) {
                setTimeout(() => {
                    if (listeningStateRef.current.isContinuous && !isListeningRef.current) {
                        try {
                            recognition.start();
                        } catch(err) {
                            console.error("Error restarting speech recognition:", err);
                        }
                    }
                }, 1000); 
            }
        };

        recognition.onstart = handleStart;
        recognition.onresult = handleResult;
        recognition.onerror = handleError;
        recognition.onend = handleEnd;
        
        return () => {
            listeningStateRef.current.isContinuous = false;
            if (recognition) {
                recognition.abort();
            }
            isListeningRef.current = false;
        };
    }, []);

    const speak = useCallback((text: string, lang: Language) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = languageMap[lang] || 'en-US';
        synthRef.current.speak(utterance);
    }, []);

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
        listeningStateRef.current.isContinuous = false;
        if (recognition && isListeningRef.current) {
            recognition.stop();
        } else {
            isListeningRef.current = false;
            setIsListening(false);
        }
    }, []);

    return { isListening, speak, startListening, startContinuousListening, stopListening, isSupported };
};