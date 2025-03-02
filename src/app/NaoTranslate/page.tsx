"use client";
import "./global.css"; 
import { useState, useEffect, useCallback } from "react";

// ✅ Extend `Window` interface to define `SpeechRecognition`
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ✅ Define SpeechRecognitionEvent interface
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

interface CustomSpeechRecognitionEvent extends Event {
  results: {
    length: number;
    isFinal: boolean;
    [index: number]: SpeechRecognitionResult[];
  };
}

// ✅ Define API response type
interface TranslationResponse {
  translation: string;
  error?: string;
}

const TranslationPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [translatedText, setTranslatedText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [delayedText, setDelayedText] = useState<string>("");
  const [inputLangError, setInputLangError] = useState<string>("");
  const [outputLangError, setOutputLangError] = useState<string>("");

  // ✅ Function to handle speech recognition
  const startListening = (): void => {
    if (!inputLang) {
      setInputLangError("Please select an input language.");
      return;
    }
    setInputLangError("");
    setIsListening(true);

    // ✅ Correctly accessing `SpeechRecognition` from the window object
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = inputLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent): void => {
      if (event.results.length > 0) {
        const transcript: string = event.results[0][0].transcript;
        setInputText(transcript);
        setDelayedText(transcript);
        if (outputLang) translateText(transcript);
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // ✅ Function to translate text using API (with useCallback fix)
  const translateText = useCallback(async (text: string): Promise<void> => {
    if (!outputLang) {
      setOutputLangError("Please select a translation language.");
      return;
    }
    setOutputLangError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, inputLang, outputLang }),
      });

      const data: TranslationResponse = await response.json();

      if (!response.ok) {
        console.error("API Error Response:", data);
        throw new Error(`Translation API request failed: ${data.error || "Unknown error"}`);
      }

      setTranslatedText(data.translation);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Translation failed:", error.message);
      } else {
        console.error("Translation failed:", error);
      }
    }
  }, [inputLang, outputLang]); // ✅ Added dependencies

  // ✅ Auto-translate when outputLang is changed
  useEffect(() => {
    if (delayedText && outputLang) {
      translateText(delayedText);
    }
  }, [delayedText, outputLang, translateText]); // ✅ Now includes translateText

  // ✅ Function to swap languages
  const swapLanguages = (): void => {
    setInputLang(outputLang);
    setOutputLang(inputLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // ✅ Function to play translated text as speech
  const playTranslatedAudio = (): void => {
    if (!translatedText) return;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = outputLang;
    synth.speak(utterance);
  };

  return (
    <div className="container">
      <h1>Healthcare Translation Web App</h1>

      <div className="translation-container">
        {/* Left Column - Input */}
        <div className="column">
          <h2>Original Language <span className="required">*</span></h2>
          <select
            required
            value={inputLang}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setInputLang(e.target.value)}
            className={`select-box ${inputLangError ? "error-border" : ""}`}
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="bn">Bengali</option>
            <option value="te">Telugu</option>
            <option value="zh-CN">Chinese (Mandarin)</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
          </select>
          {inputLangError && <p className="error-message">{inputLangError}</p>}

          <textarea
            placeholder="Type or speak here..."
            value={inputText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
          />

          <button
            className={`circle-button ${isListening ? "listening" : "speak"}`}
            onClick={startListening}
            disabled={!inputLang}
          >
            🎤
          </button>
        </div>

        {/* Right Column - Output */}
        <div className="column">
          <h2>Translated Language <span className="required">*</span></h2>
          <select
            required
            value={outputLang}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOutputLang(e.target.value)}
            className={`select-box ${outputLangError ? "error-border" : ""}`}
          >
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="bn">Bengali</option>
            <option value="te">Telugu</option>
            <option value="zh-CN">Chinese (Mandarin)</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
          </select>
          {outputLangError && <p className="error-message">{outputLangError}</p>}

          <textarea
            placeholder="Translated text will appear here..."
            value={translatedText}
            readOnly
          />

          <button 
            className="circle-button translate" 
            onClick={playTranslatedAudio} 
            disabled={!outputLang}
          >
            🔊
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mt-4">
        <button className="swap-button" onClick={swapLanguages}>🔄 Swap Languages</button>
      </div>
    </div>
  );
};

export default TranslationPage;
