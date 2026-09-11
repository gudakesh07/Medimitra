import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Settings,
  Download,
  Trash2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Mic,
  MicOff,
  AlertTriangle,
  Globe,
  PhoneCall,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "../ui/Button";
import {
  getStoredApiKey,
  getStoredModel,
  sendGeminiMessage,
  checkTextForRedFlags
} from "../../services/geminiService";
import { GeminiConfigModal } from "./GeminiConfigModal";
import { useApp } from "../../context/AppContext";

export function GeminiChatbot({ isEmbedded = false, onNavigateIntake = null }) {
  const { lang, changeLanguage } = useApp();

  const [messages, setMessages] = useState([
    {
      id: "msg-init",
      role: "assistant",
      content:
        lang === "hi"
          ? "नमस्ते! मैं **Dr. Mitra AI** हूँ — आपका क्लिनिकल स्वास्थ्य व केस-टेकिंग सहायक।\n\nआप अपने लक्षणों, स्वास्थ्य समस्याओं या डॉक्टर की सलाह की तैयारी से जुड़ा कोई भी सवाल पूछ सकते हैं।\n\n*कृपया ध्यान दें: यह एक शैक्षिक व सहायक प्रणाली है, गंभीर आपातकाल में तुरंत डॉक्टर से संपर्क करें।*"
          : "Hello! I am **Dr. Mitra AI** — your clinical intake and health advisory assistant.\n\nYou can ask about your symptoms, medication precautions, or get help preparing a structured summary for your doctor.\n\n*Please note: This is an intake decision-support tool and does not replace emergency medical care.*",
      hasRedFlag: false,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeModel, setActiveModel] = useState("gemini-3.6-flash");
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync API key & model status on mount
  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));
    setActiveModel(getStoredModel());
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Speech-to-Text setup using Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === "hi" ? "hi-IN" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        setSpeechError("Mic error: " + event.error);
        setTimeout(() => setSpeechError(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Speech start failed:", e);
      }
    }
  };

  // Text-to-Speech playback
  const handleToggleSpeech = (msgId, text) => {
    if (!window.speechSynthesis) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio
    const cleanText = text.replace(/[*#_`>]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === "hi" ? "hi-IN" : "en-US";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Copy message
  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export conversation as text file
  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n`)
      .join("\n---\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediMitra-Chat-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm(lang === "hi" ? "क्या आप चैट इतिहास साफ़ करना चाहते हैं?" : "Clear all chat messages?")) {
      window.speechSynthesis?.cancel();
      setMessages([
        {
          id: "msg-reset",
          role: "assistant",
          content:
            lang === "hi"
              ? "चैट इतिहास साफ़ हो गया है। आप नए प्रश्न पूछ सकते हैं।"
              : "Chat history cleared. How may I assist your clinical intake today?",
          hasRedFlag: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  // Send message to Gemini
  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || inputText;
    if (!prompt.trim() || loading) return;

    const userMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: prompt.trim(),
      hasRedFlag: checkTextForRedFlags(prompt),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const response = await sendGeminiMessage({
        messages: newMessages
      });

      const botMessage = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: response.text,
        hasRedFlag: response.hasRedFlag,
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages([...newMessages, botMessage]);
    } catch (err) {
      console.error("Chat failure:", err);
      setMessages([
        ...newMessages,
        {
          id: "bot-err-" + Date.now(),
          role: "assistant",
          content: `⚠️ We encountered an unexpected error: ${err.message}. Please verify your Gemini API key in Settings.`,
          hasRedFlag: false,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick Starter Prompts
  const quickStarters = [
    {
      icon: "🌡️",
      title: lang === "hi" ? "बुखार और बदन दर्द" : "Fever & Body Ache",
      prompt:
        lang === "hi"
          ? "मुझे 2 दिनों से तेज बुखार और बदन दर्द है। मुझे किन लक्षणों पर ध्यान देना चाहिए?"
          : "I have had a fever (101°F) and body ache for 2 days. What symptoms should I monitor?"
    },
    {
      icon: "⚠️",
      title: lang === "hi" ? "रेड फ्लैग खतरे के संकेत" : "Emergency Red Flags",
      prompt:
        lang === "hi"
          ? "सीने में दर्द या सांस फूलने के किन लक्षणों में तुरंत इमरजेंसी जाना चाहिए?"
          : "What are the danger signs or red flags for chest discomfort and shortness of breath?"
    },
    {
      icon: "📋",
      title: lang === "hi" ? "डॉक्टर से पूछने हेतु सवाल" : "Questions for Doctor Visit",
      prompt:
        lang === "hi"
          ? "कल डॉक्टर से मेरी मुलाकात है, मुझे अपने लक्षणों के बारे में क्या मुख्य सवाल पूछने चाहिए?"
          : "I have a clinical appointment tomorrow. How should I prepare and what key questions should I ask?"
    },
    {
      icon: "💊",
      title: lang === "hi" ? "दवाओं के सामान्य निर्देश" : "Medication Precautions",
      prompt:
        lang === "hi"
          ? "पैरासिटामोल लेते समय क्या सावधानियां रखनी चाहिए?"
          : "What precautions should be observed when taking OTC Paracetamol?"
    }
  ];

  // Quick symptom tag pills to append
  const symptomTags = [
    lang === "hi" ? "+ बुखार (Fever)" : "+ Fever",
    lang === "hi" ? "+ सूखी खांसी" : "+ Dry Cough",
    lang === "hi" ? "+ सिरदर्द" : "+ Headache",
    lang === "hi" ? "+ सांस में तकलीफ" : "+ Breathlessness",
    lang === "hi" ? "+ पेट दर्द" : "+ Abdominal Pain"
  ];

  return (
    <div
      className={`flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden font-sans-custom transition-all ${
        isEmbedded ? "h-[620px]" : "h-[82vh] min-h-[580px]"
      }`}
    >
      {/* 1. Header Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 sm:px-6 text-white flex items-center justify-between gap-3 border-b border-slate-700/60 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                Dr. Mitra AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30">
                  Clinical Intake
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-mono text-[11px] text-teal-400">
                <Sparkles className="w-3 h-3" />
                {activeModel}
              </span>
              <span>•</span>
              {hasApiKey ? (
                <span className="text-[11px] text-emerald-400 font-medium">Gemini Connected</span>
              ) : (
                <button
                  onClick={() => setConfigModalOpen(true)}
                  className="text-[11px] text-amber-300 hover:text-amber-200 underline flex items-center gap-1"
                  title="Configure Gemini API key"
                >
                  Demo Mode (Add Key)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <button
            onClick={() => changeLanguage(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">{lang === "en" ? "EN" : "हिन्दी"}</span>
          </button>

          {/* Export Transcript */}
          <button
            onClick={handleExportChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Export Transcript"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-900 transition"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Gemini Settings */}
          <button
            onClick={() => setConfigModalOpen(true)}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
              hasApiKey
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 animate-pulse"
            }`}
            title="Gemini API Key Settings"
          >
            <Settings className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Key Settings</span>
          </button>
        </div>
      </div>

      {/* 2. Emergency Notice Callout */}
      <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="truncate">
            <strong>Clinical Safety Notice:</strong> AI advice is educational. For chest pain or severe distress, seek
            emergency care.
          </span>
        </div>
        <a
          href="tel:112"
          className="flex items-center gap-1 font-bold text-rose-700 hover:text-rose-900 shrink-0 ml-2 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200"
        >
          <PhoneCall className="w-3 h-3" />
          <span>Call 112 / 108</span>
        </a>
      </div>

      {/* 3. Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/60">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-3xl ${
                isUser ? "ml-auto flex-row-reverse" : "mr-auto"
              } animate-fadeIn`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 mt-1 shadow-sm ${
                  isUser
                    ? "bg-gradient-to-tr from-teal-700 to-teal-500"
                    : "bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-teal-400" />}
              </div>

              {/* Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs relative group ${
                  isUser
                    ? "bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-tr-xs"
                    : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs"
                }`}
              >
                {/* Red Flag Alert Box */}
                {msg.hasRedFlag && !isUser && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <div className="font-bold text-xs text-rose-900 uppercase tracking-wide">
                        ⚠ Priority Clinical Attention Alert
                      </div>
                      <p className="text-[11px] text-rose-800 mt-0.5">
                        These symptoms suggest immediate medical triage. Please contact emergency services (112 / 108)
                        or present to an acute care clinic without delay.
                      </p>
                    </div>
                  </div>
                )}

                {/* Formatted Markdown Content */}
                <div className="space-y-2 whitespace-pre-line break-words">
                  {formatMarkdownContent(msg.content)}
                </div>

                {/* Bubble Footer Actions */}
                <div
                  className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] gap-2 ${
                    isUser ? "border-teal-500/40 text-teal-100" : "border-slate-100 text-slate-400"
                  }`}
                >
                  <span className="font-medium">{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      {/* Text-to-Speech */}
                      <button
                        onClick={() => handleToggleSpeech(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition flex items-center gap-0.5"
                        title={speakingId === msg.id ? "Stop Speaking" : "Read Aloud"}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-teal-700 transition"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing / Thinking Indicator */}
        {loading && (
          <div className="flex items-start gap-3 mr-auto animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-teal-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs p-4 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
                <span>Dr. Mitra AI is processing your clinical query...</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Starter Prompts (visible when few messages) */}
      {messages.length <= 2 && !loading && (
        <div className="px-4 py-3 bg-slate-100/70 border-t border-slate-200/80 shrink-0">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-600" />
            {lang === "hi" ? "त्वरित विषय सुझाव (Quick Starters):" : "Suggested Clinical Inquiries:"}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickStarters.map((qs, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(qs.prompt)}
                className="text-left p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition text-xs flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{qs.icon}</span>
                  <span className="font-semibold text-slate-700 group-hover:text-teal-900 truncate">
                    {qs.title}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-teal-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 5. Input Dock */}
      <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-2">
        {/* Quick Symptom Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-slate-400 font-semibold shrink-0">Quick Add:</span>
          {symptomTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => setInputText((prev) => (prev ? `${prev}, ${tag}` : tag))}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-100 text-slate-600 hover:text-teal-800 font-medium whitespace-nowrap transition border border-slate-200/80"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          {/* Speech to text Mic button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-2xl border transition shrink-0 flex items-center justify-center ${
              isListening
                ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-500/30"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200"
            }`}
            title={isListening ? "Stop listening" : "Speak your symptoms"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isListening
                  ? "Listening to voice... speak clearly now"
                  : lang === "hi"
                  ? "अपने लक्षण या स्वास्थ्य प्रश्न यहाँ लिखें (Enter दबाएँ)..."
                  : "Type your symptoms or health inquiries here (Press Enter)..."
              }
              className="w-full p-3 bg-slate-50 border border-slate-300/80 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition resize-none"
            />
            {speechError && (
              <span className="absolute bottom-1 right-2 text-[10px] text-rose-600 font-medium">
                {speechError}
              </span>
            )}
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputText.trim() || loading}
            className="h-12 px-4 sm:px-5 rounded-2xl shadow-md shadow-teal-500/25 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {/* Footer Disclaimer */}
        <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-2">
          <span>MediMitra AI decision support</span>
          <span>•</span>
          <span>Not a substitute for certified medical evaluation</span>
        </div>
      </div>

      {/* Config Modal */}
      <GeminiConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        onKeyUpdated={({ hasKey, model }) => {
          setHasApiKey(hasKey);
          setActiveModel(model);
        }}
      />
    </div>
  );
}

/**
 * Lightweight helper to render markdown bolding, lists, and headers without heavy external libraries
 */
function formatMarkdownContent(content) {
  if (!content) return null;

  const lines = content.split("\n");

  return lines.map((line, idx) => {
    // Headers (### Header)
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="font-bold text-slate-900 text-xs sm:text-sm mt-2 mb-1">
          {formatInline(line.replace("### ", ""))}
        </h4>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h3 key={idx} className="font-extrabold text-slate-900 text-sm mt-2 mb-1">
          {formatInline(line.replace("## ", ""))}
        </h3>
      );
    }

    // Bullet points (- or *)
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-teal-600 font-bold">•</span>
          <span className="flex-1">{formatInline(line.trim().substring(2))}</span>
        </div>
      );
    }

    // Numbered lists (1. 2.)
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={idx} className="flex items-start gap-2 ml-2 my-0.5">
          <span className="text-teal-700 font-bold text-xs">{numberedMatch[1]}.</span>
          <span className="flex-1">{formatInline(numberedMatch[2])}</span>
        </div>
      );
    }

    // Italic disclaimer lines (*text*)
    if (line.trim().startsWith("*") && line.trim().endsWith("*")) {
      return (
        <p key={idx} className="text-[11px] italic text-slate-500 my-1">
          {formatInline(line.trim().slice(1, -1))}
        </p>
      );
    }

    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    // Standard paragraph
    return (
      <p key={idx} className="my-0.5">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(text) {
  if (!text) return "";
  // Split by bold markers **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
