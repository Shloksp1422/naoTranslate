"use client";
import "./global.css"; 
import { useState, useEffect } from "react";

// ✅ Define `SpeechRecognition` correctly
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

// ✅ Define Custom SpeechRecognition Event
interface CustomSpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

// ✅ Define API response type
interface TranslationResponse {
  translation: string;
  error?: string;
}
//hello

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

    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = inputLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    // ✅ Fix TypeScript issue in event handler
    recognition.onresult = (event: CustomSpeechRecognitionEvent): void => {
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

  // ✅ Function to translate text using API
  const translateText = async (text: string): Promise<void> => {
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Translation failed:", error.message);
      } else {
        console.error("Translation failed:", error);
      }
    }
  };

  // ✅ Auto-translate when outputLang is changed (Fixed `useEffect` warning)
  useEffect(() => {
    if (delayedText && outputLang) {
      translateText(delayedText);
    }
  }, [delayedText, outputLang, translateText]);  // ✅ Added dependencies

  // ✅ Function to swap languages
  const swapLanguages = () => {
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
            disabled={!inputLang}  // ✅ Disabled before selecting language
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
            disabled={!outputLang}  // ✅ Disabled before selecting language
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
