import { useState, useEffect, useRef, useCallback } from 'react';

// FIX: Add types for Web Speech API which are not included in standard TypeScript DOM library
// This resolves errors like "Cannot find name 'SpeechRecognition'" and "Property 'SpeechRecognition' does not exist on type 'Window'".
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

// FIX: Wrap window augmentation in `declare global` to correctly extend the global Window type from within a module.
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}


interface UseWebSpeechOptions {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
}

const useWebSpeech = ({ onResult, onError }: UseWebSpeechOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Speak now...');
    };

    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognition.onerror = (event) => {
      let errorMessage = "An error occurred during recognition.";
      if (event.error === 'no-speech') {
        errorMessage = "No speech was detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "Microphone not found. Ensure it's connected and enabled.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Permission to use microphone was denied. Please allow access in browser settings.";
      }
      onError(errorMessage);
    };

    recognition.onresult = (event) => {
      let interim_transcript = "";
      let final_transcript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      
      setTranscript(interim_transcript || 'Processing...');

      if (final_transcript) {
        onResult(final_transcript);
        recognition.stop();
      }
    };
    
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        if (e instanceof Error && e.name !== 'InvalidStateError') {
          onError("Could not start voice recognition.");
        }
      }
    }
  }, [isListening, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, startListening, stopListening };
};

export default useWebSpeech;