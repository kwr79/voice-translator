'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define the type for our SpeechRecognition instance
declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

const VoiceTranslator = () => {
  const [isListening, setIsListening] = useState(false);
  const [dutchText, setDutchText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [error, setError] = useState('');
  
  // Define the type for our recognition ref
  const recognitionRef = useRef<any>(null);
  const lastSpeechRef = useRef<number>(Date.now());
  const currentSentenceRef = useRef<string>('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'nl-NL';

        recognitionRef.current.onresult = (event: any) => {
          const currentTime = Date.now();
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          if (currentTime - lastSpeechRef.current > 1000) {
            setDutchText(prev => prev + (prev ? '\n' : '') + transcript);
            const mockTranslate = (text: string) => {
              return text + " (Translated to English)";
            };
            setEnglishText(prev => prev + (prev ? '\n' : '') + mockTranslate(transcript));
          } else {
            setDutchText(prev => {
              const lines = prev.split('\n');
              lines[lines.length - 1] = transcript;
              return lines.join('\n');
            });
            const mockTranslate = (text: string) => {
              return text + " (Translated to English)";
            };
            setEnglishText(prev => {
              const lines = prev.split('\n');
              lines[lines.length - 1] = mockTranslate(transcript);
              return lines.join('\n');
            });
          }
          
          lastSpeechRef.current = currentTime;
        };

        recognitionRef.current.onerror = (event: any) => {
          setError('Error occurred in recognition: ' + event.error);
        };
      }
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        setDutchText('');
        setEnglishText('');
        recognitionRef.current.start();
        setIsListening(true);
        setError('');
        lastSpeechRef.current = Date.now();
      }
    }
  }, [isListening]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col space-y-4">
        <button
          onClick={toggleListening}
          className={`flex items-center justify-center space-x-2 p-4 rounded-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white transition-colors`}
        >
          {isListening ? (
            <>
              <MicOff className="h-6 w-6" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="h-6 w-6" />
              <span>Start Listening</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">Dutch (Original)</h2>
            <div className="min-h-[12rem] p-4 bg-white rounded border whitespace-pre-line">
              {dutchText || 'Waiting for speech...'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">English (Translated)</h2>
            <div className="min-h-[12rem] p-4 bg-white rounded border whitespace-pre-line">
              {englishText || 'Translation will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranslator;
