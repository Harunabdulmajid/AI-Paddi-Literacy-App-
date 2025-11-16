import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useTranslations } from '../i18n';
import { Loader2, Mic, Play, Pause, Download } from 'lucide-react';

// Helper to decode base64 string to Uint8Array
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

// Helper to create a WAV file Blob from raw PCM data
function pcmToWav(pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    const dataSize = pcmData.length;
    // The total file size is 44 bytes for the header minus 8 bytes for RIFF/fileSize, plus the data size. So, 36 + dataSize.
    const fileSize = 36 + dataSize; 

    writeString(0, 'RIFF');
    view.setUint32(4, fileSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Sub-chunk 1 size (16 for PCM)
    view.setUint16(20, 1, true); // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // Byte rate
    view.setUint16(32, numChannels * (bitsPerSample / 8), true); // Block align
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const wavBytes = new Uint8Array(44 + dataSize);
    wavBytes.set(new Uint8Array(header), 0);
    wavBytes.set(pcmData, 44);

    return new Blob([wavBytes], { type: 'audio/wav' });
}


export const PodcastGenerator: React.FC = () => {
    const t = useTranslations();
    const [script, setScript] = useState('');
    const [voice, setVoice] = useState('Kore');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioRef = useRef<HTMLAudioElement>(null);

    // Clean up the object URL when the component unmounts or a new URL is created
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    // Add event listeners for the audio element to sync playing state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
        };
    }, [audioUrl]);

    const handleGenerate = async () => {
        if (!script.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: script }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: voice },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

            if (base64Audio) {
                const pcmData = decode(base64Audio);
                // The API returns 16-bit PCM at 24000Hz with 1 channel
                const wavBlob = pcmToWav(pcmData, 24000, 1, 16);
                const url = URL.createObjectURL(wavBlob);
                setAudioUrl(url);
            } else {
                throw new Error("No audio data received from API.");
            }
        } catch (err) {
            console.error("Error generating audio:", err);
            setError(t.podcastGenerator.errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-800 mb-2">{t.podcastGenerator.title} 🎙️</h2>
            <p className="text-neutral-500 mb-8 text-base md:text-lg">{t.podcastGenerator.description}</p>
            
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
                {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 font-semibold text-center">{error}</div>}
                
                <div className="space-y-6">
                    <div>
                        <label htmlFor="script" className="font-bold text-lg text-neutral-700 block mb-2">{t.podcastGenerator.scriptLabel}</label>
                        <textarea
                            id="script"
                            value={script}
                            onChange={(e) => setScript(e.target.value)}
                            placeholder={t.podcastGenerator.scriptPlaceholder}
                            className="w-full p-4 border-2 border-neutral-200 rounded-xl bg-neutral-50 focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
                            rows={8}
                        />
                    </div>
                    <div>
                         <label htmlFor="voice" className="font-bold text-lg text-neutral-700 block mb-2">{t.podcastGenerator.voiceLabel}</label>
                         <select
                            id="voice"
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            className="w-full max-w-xs p-3 border-2 border-neutral-200 rounded-lg bg-white font-semibold"
                         >
                            <option value="Kore">{t.podcastGenerator.voices.kore}</option>
                            <option value="Puck">{t.podcastGenerator.voices.puck}</option>
                         </select>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-200">
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !script.trim()}
                        className="w-full flex items-center justify-center gap-3 bg-primary text-white font-bold py-4 px-6 rounded-xl text-lg hover:bg-primary-dark transition-transform active:scale-95 disabled:bg-neutral-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                {t.podcastGenerator.generatingButton}
                            </>
                        ) : (
                             <>
                                <Mic />
                                {t.podcastGenerator.generateButton}
                             </>
                        )}
                    </button>
                </div>

                {audioUrl && (
                    <div className="mt-8 animate-fade-in">
                        <h3 className="font-bold text-lg text-neutral-700 mb-3">{t.podcastGenerator.yourCreation}</h3>
                        <audio ref={audioRef} src={audioUrl} className="hidden" />
                        <div className="flex items-center gap-4 p-3 bg-primary/10 rounded-lg">
                            <button
                                onClick={handlePlayPause}
                                className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark transition-transform active:scale-90"
                                aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                            >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            </button>
                            <div className="flex-grow">
                                <p className="font-semibold text-primary">Your Generated Audio</p>
                            </div>
                            <a 
                                href={audioUrl} 
                                download="ai-paddi-podcast.wav"
                                className="flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:underline p-2 rounded-md hover:bg-primary/10"
                            >
                               <Download size={20}/>
                               <span className="hidden sm:inline">Download</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
