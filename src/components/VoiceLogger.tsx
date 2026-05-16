import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Check, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";

interface VoiceLoggerProps {
  onTranscriptionComplete: (text: string) => void;
}

export default function VoiceLogger({ onTranscriptionComplete }: VoiceLoggerProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error !== "no-speech") {
          setError(event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError("Speech recognition not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setError(null);
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (transcript.trim()) {
      onTranscriptionComplete(transcript);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="relative">
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 0.2 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-blue-500 blur-2xl"
            />
          )}
        </AnimatePresence>
        
        <button
          onClick={toggleListening}
          id="voice-toggle-btn"
          className={cn(
            "relative flex h-48 w-48 items-center justify-center rounded-full transition-all duration-500 shadow-2xl active:scale-95",
            isListening ? "bg-red-500 text-white" : "bg-white text-blue-600 hover:bg-gray-50"
          )}
        >
          {isListening ? (
            <MicOff className="h-16 w-16" />
          ) : (
            <Mic className="h-16 w-16" />
          )}
        </button>
      </div>

      <div className="h-24 px-6 text-center">
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.p
              key="listening"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-medium text-gray-800"
            >
              {transcript || "Listening..."}
            </motion.p>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <p className="text-2xl font-semibold tracking-tight text-gray-900">
                Hold or Tap to Log
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">
                Voice First Intake
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</p>
      )}
    </div>
  );
}
