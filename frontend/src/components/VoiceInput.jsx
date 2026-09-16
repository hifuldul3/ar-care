import React, { useState, useRef } from 'react';
import { Button } from './Button';

export function VoiceInput({ onTranscript, defaultLang = 'en-US' }) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [warning, setWarning] = useState('');
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const recognitionRef = useRef(null);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setWarning('Voice recognition is unavailable in this browser. Please enter text manually.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setWarning('');
    setInterimText('');

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        setInterimText(currentInterim);

        if (finalTranscript.trim() && onTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'no-speech') {
          setWarning('No speech detected. Please speak clearly into your microphone.');
        } else if (event.error === 'not-allowed') {
          setWarning('Microphone access blocked. Please allow microphone permissions in browser address bar.');
        } else {
          setWarning(`Speech recognition status: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognition.start();
    } catch (e) {
      console.error('Speech recognition exception:', e);
      setWarning('Failed to start microphone speech recognition.');
      setIsListening(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? 'danger' : 'secondary'}
          size="sm"
          onClick={startListening}
          className="relative overflow-hidden"
        >
          <span className={isListening ? 'animate-ping' : ''}>🎤</span>
          <span>{isListening ? 'STOP LISTENING' : 'SPEAK TO TYPE'}</span>
        </Button>

        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-sky-500"
        >
          <option value="en-US">English (en-US)</option>
          <option value="ta-IN">Tamil (தமிழ்)</option>
          <option value="hi-IN">Hindi (हिन्दी)</option>
          <option value="te-IN">Telugu (తెలుగు)</option>
          <option value="ml-IN">Malayalam (മലയാളം)</option>
        </select>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 text-xs text-sky-400 bg-sky-500/10 border border-sky-500/30 p-2 rounded animate-pulse">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span>Listening... {interimText ? `"${interimText}"` : 'Speak into your microphone now'}</span>
        </div>
      )}

      {warning && (
        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 p-2 rounded">
          {warning}
        </p>
      )}
    </div>
  );
}
