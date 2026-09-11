import React, { useState } from "react";
import { Bot, X, Maximize2, Sparkles, MessageSquare } from "lucide-react";
import { GeminiChatbot } from "./GeminiChatbot";

export function FloatingChatWidget({ onOpenFullChat }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans-custom">
      {/* Floating Chat Window Card */}
      {isOpen && (
        <div className="mb-3 w-[94vw] sm:w-[440px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-slideUp">
          {/* Top Mini Control Bar */}
          <div className="bg-slate-900 px-4 py-2 text-white flex items-center justify-between border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Dr. Mitra AI • Quick Assistant</span>
            </div>
            <div className="flex items-center gap-2">
              {onOpenFullChat && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenFullChat();
                  }}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Expand to Full Screen View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-rose-400 transition"
                title="Minimize Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Chatbot */}
          <div className="flex-1 overflow-hidden">
            <GeminiChatbot isEmbedded={true} onNavigateIntake={onOpenFullChat} />
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="flex items-center justify-end">
        {!isOpen && !hasInteracted && (
          <div
            onClick={() => {
              setIsOpen(true);
              setHasInteracted(true);
            }}
            className="hidden sm:flex items-center gap-2 mr-3 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-lg border border-slate-700 cursor-pointer animate-pulse hover:scale-105 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Ask Dr. Mitra AI</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasInteracted(true);
          }}
          className={`relative p-3.5 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center group ${
            isOpen
              ? "bg-slate-800 text-white hover:bg-slate-700 rotate-90"
              : "bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 text-white hover:scale-105 hover:shadow-teal-500/30"
          }`}
          title={isOpen ? "Close AI Chatbot" : "Open Dr. Mitra AI Chatbot"}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
