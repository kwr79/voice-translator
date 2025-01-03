'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type SpeechRecognitionResult = {
  transcript: string;
}

type SpeechRecognitionResults = {
  length: number;
  [index: number]: SpeechRecognitionResult[];
}

type SpeechRecognitionEvent = {
  results: SpeechRecognitionResults;
}

const VoiceTranslator = () => {
  const [isListening, setIsListening] = useState(false);
  const [dutchText, setDutchText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [error, setError] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const lastSpeechRef = useRef<number>(Date.now());

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'nl-NL';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const currentTime = Date.now();
        const timeSinceLastSpeech = currentTime - lastSpeechRef.current;
        const results = event.results as unknown as SpeechRecognitionResults;
        const transcript = results[results.length - 1][0].transcript;

        setDutchText(prev => {
          // Add a newline if there's been a long pause and we're not at the start
          const prefix = (timeSinceLastSpeech > 1400 && prev.length > 0) ? '\n' : '';
          // If no prefix needed, just append/update the text
          return prev + prefix + transcript;
        });

        const mockTranslate = (text: string) => text + " (Translated to English)";
        setEnglishText(prev => {
          const prefix = (timeSinceLastSpeech > 1400 && prev.length > 0) ? '\n' : '';
          return prev + prefix + mockTranslate(transcript);
        });

        lastSpeechRef.current = currentTime;
      };

      recognitionRef.current.onerror = (event: any) => {
        setError('Error occurred in recognition: ' + event.error);
      };
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
