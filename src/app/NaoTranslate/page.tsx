"use client";
import "../NaoTranslate/global.css"; 
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
  const [highlightError, setHighlightError] = useState<boolean>(false);

  // ✅ Function to start or stop speech recognition (Toggle on button click)
  const toggleListening = (): void => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!inputLang) {
      setInputLangError("Please select an input language.");
      setHighlightError(true);
      return;
    }
    if (!outputLang) {
      setOutputLangError("Please select a translation language.");
      setHighlightError(true);
      return;
    }

    stopSpeaking(); // ✅ Stop speaker if mic is clicked

    setInputLangError("");
    setOutputLangError("");
    setHighlightError(false);
    setIsListening(true);

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

    recog.onresult = (event: CustomSpeechRecognitionEvent): void => {
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

  // ✅ Function to stop speech recognition manually
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // ✅ Function to translate text using API (Fixed Issue with Real-time Updates)
  const translateText = async (text: string, targetLang?: string): Promise<void> => {
    const newOutputLang = targetLang || outputLang;
    
    if (!newOutputLang) {
      setOutputLangError("Please select a translation language.");
      return;
    }
    setOutputLangError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, inputLang, outputLang: newOutputLang }), // ✅ Always use the latest selected language
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`Translation API request failed: ${errorData.error || "Unknown error"}`);
      }

      const data: TranslationResponse = await response.json();
      setTranslatedText(data.translation);
    } catch (error: unknown) {
      console.error("Translation failed:", error instanceof Error ? error.message : error);
    }
  };

  // ✅ Function to swap languages


  // ✅ Function to play/stop translated text as speech
  // ✅ Function to play/stop translated text as speech
const toggleSpeaking = (): void => {
  if (isSpeaking) {
    stopSpeaking();
    return;
  }

  if (!translatedText) return;
  stopListening(); // ✅ Stop mic if speaker is clicked

  const synth = window.speechSynthesis;
  let utterance = new SpeechSynthesisUtterance(translatedText);

  // ✅ Set language properly
  utterance.lang = outputLang;

  // ✅ Fallback for unsupported languages
  const availableVoices = synth.getVoices();
  const voiceForLang = availableVoices.find(voice => voice.lang.startsWith(outputLang));

  if (!voiceForLang) {
    console.warn(`No voice found for ${outputLang}, using default English voice.`);
    utterance.lang = "en-US"; // ✅ Default to English if unsupported
  } else {
    utterance.voice = voiceForLang;
  }

  setIsSpeaking(true);
  synth.speak(utterance);

  utterance.onend = () => setIsSpeaking(false);
};

  // ✅ Function to stop translation speaker
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };
  // ✅ Function to swap input and output languages
const swapLanguages = () => {
  if (!inputLang || !outputLang) return; // Ensure both languages are selected before swapping

  setInputLang(outputLang);
  setOutputLang(inputLang);
  setInputText(translatedText); // Swap text fields as well
  setTranslatedText(inputText);
};


  // ✅ Function to clear text when input language changes
  const handleInputLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputLang(e.target.value);
    setInputText(""); // ✅ Clears text
  };

  // ✅ Function to handle output language changes & update translation immediately
  const handleOutputLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOutputLang = e.target.value;

    if (newOutputLang === inputLang) {
      setOutputLangError("Input and output languages cannot be the same.");
      return;
    }

    setOutputLangError("");
    setOutputLang(newOutputLang);

    // ✅ Immediately update translation if text exists
    if (inputText.trim()) {
      setTranslatedText(""); // Clear previous translation before updating
      await translateText(inputText, newOutputLang);
    }
  };

  return (
    <div className="container">
      <h1>Healthcare Translation Web App</h1>

      <div className="translation-container">
        {/* Left Column - Input */}
        <div className="column">
          <h2 className={highlightError ? "error-text" : ""}>Original Language <span className="required">*</span></h2>
          <select required value={inputLang} onChange={handleInputLangChange} className="select-box">
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

          <textarea placeholder="Type or speak here..." value={inputText} onChange={(e) => setInputText(e.target.value)} />

          <button className={`circle-button ${isListening ? "listening" : "speak"}`} onClick={toggleListening}>
            {isListening ? "⏹ Stop" : "🎤 Start"}
          </button>
        </div>

        {/* Right Column - Output */}
        <div className="column">
          <h2 className={highlightError ? "error-text" : ""}>Translated Language <span className="required">*</span></h2>
          <select required value={outputLang} onChange={handleOutputLangChange} className="select-box">
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

