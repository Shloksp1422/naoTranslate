"use client";
import "../NaoTranslate/global.css"; 
import { useState } from "react";

// ✅ Define `SpeechRecognition` correctly
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
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
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [inputLangError, setInputLangError] = useState<string>("");
  const [outputLangError, setOutputLangError] = useState<string>("");

  // ✅ Function to start or stop speech recognition
  const toggleListening = (): void => {
    if (!inputLang) {
      setInputLangError("Please select an input language.");
      return;
    }
    if (!outputLang) {
      setOutputLangError("Please select a translation language.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    stopSpeaking(); // ✅ Stop speaker if mic is clicked
    setIsListening(true);
    setInputLangError("");
    setOutputLangError("");

    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      console.error("Speech recognition is not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = inputLang;
    recog.continuous = true;
    recog.interimResults = true;

    recog.onresult = (event: SpeechRecognitionEvent): void => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      setInputText(transcript.trim());
      if (outputLang) translateText(transcript.trim());
    };

    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    setRecognition(recog);
    recog.start();
  };

  // ✅ Function to stop speech recognition
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
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

      if (!response.ok) {
        console.error("API Error:", await response.json());
        return;
      }

      const data: TranslationResponse = await response.json();
      setTranslatedText(data.translation);
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };

  // ✅ Function to swap input and output languages
  const swapLanguages = () => {
    if (!inputLang || !outputLang) return;

    setInputLang(outputLang);
    setOutputLang(inputLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // ✅ Function to play translated text as speech
  const toggleSpeaking = (): void => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    if (!translatedText) return;
    stopListening(); // ✅ Stop mic if speaker is clicked

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = outputLang;

    // ✅ Ensure voice compatibility
    const availableVoices = synth.getVoices();
    const voiceForLang = availableVoices.find(voice => voice.lang.startsWith(outputLang));
    if (voiceForLang) utterance.voice = voiceForLang;

    setIsSpeaking(true);
    synth.speak(utterance);
    utterance.onend = () => setIsSpeaking(false);
  };

  // ✅ Function to stop translation speaker
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="container">
      <h1>Healthcare Translation Web App</h1>

      <div className="translation-container">
        {/* Left Column - Input */}
        <div className="column">
          <h2>Original Language <span className="required">*</span></h2>
          <select value={inputLang} onChange={(e) => setInputLang(e.target.value)} className="select-box">
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="zh-CN">Chinese</option>
            <option value="ru">Russian</option>
            <option value="uk">Ukrainian</option>
            <option value="tl">Filipino</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
          </select>
          {inputLangError && <p className="error-message">{inputLangError}</p>}

          <textarea 
            placeholder="Type or speak here..." 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)}
            disabled={!inputLang || !outputLang} // ✅ Disable if no language selected
            className={!inputLang || !outputLang ? "disabled-textarea" : ""}
          />

          <button className={`circle-button ${isListening ? "listening" : "speak"}`} onClick={toggleListening}>
            {isListening ? "⏹ Stop" : "🎤 Start"}
          </button>
        </div>

        {/* Right Column - Output */}
        <div className="column">
          <h2>Translated Language <span className="required">*</span></h2>
          <select value={outputLang} onChange={(e) => setOutputLang(e.target.value)} className="select-box">
            <option value="">Select Language</option>
            <option value="en">English</option>
            <option value="zh-CN">Chinese</option>
            <option value="ru">Russian</option>
            <option value="uk">Ukrainian</option>
            <option value="tl">Filipino</option>
            <option value="id">Indonesian</option>
            <option value="es">Spanish</option>
            <option value="hi">Hindi</option>
            <option value="fr">French</option>
          </select>
          {outputLangError && <p className="error-message">{outputLangError}</p>}

          <textarea placeholder="Translated text will appear here..." value={translatedText} readOnly />

          <button className="circle-button translate" onClick={toggleSpeaking}>
            🔊
          </button>
        </div>
        <button className="swap-button" onClick={swapLanguages}>
        🔄 Swap Languages
      </button>
      </div>     
    </div>
  );
};

export default TranslationPage;
