'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const VoiceTranslator = () => {
  const [isListening, setIsListening] = useState(false);
  const [dutchText, setDutchText] = useState('');
  const [englishText, setEnglishText] = useState('');
  const [error, setError] = useState('');
  
  // Use useRef instead of let for recognition
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'nl-NL'; // Set language to Dutch
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setDutchText(transcript);
        
        // Simulate translation (in a real app, you'd use a translation API)
        const mockTranslate = (text: string) => {
          // This is a mock translation - in a real app you'd call a translation API
          return text + " (Translated to English)";
        };
        
        setEnglishText(mockTranslate(transcript));
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
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setError('');
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
            <div className="min-h-48 p-4 bg-white rounded border">
              {dutchText || 'Waiting for speech...'}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-100">
            <h2 className="text-lg font-semibold mb-2">English (Translated)</h2>
            <div className="min-h-48 p-4 bg-white rounded border">
              {englishText || 'Translation will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTranslator;