import React from "react";
import { Activity, Globe, User, LogOut, Sparkles, Bot } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/Button";

export function Navbar({ activeView, setActiveView }) {
  const { lang, changeLanguage, t, user, logoutUser } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs font-sans-custom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setActiveView("landing")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">MediMitra</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">Clinical AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">AI-Assisted Patient Intake</p>
          </div>
        </div>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
          <button
            onClick={() => setActiveView("landing")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition ${
              activeView === "landing" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.navHome}
          </button>
          <button
            onClick={() => setActiveView("chatbot")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition flex items-center gap-1.5 ${
              activeView === "chatbot"
                ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeView === "chatbot" ? "text-teal-200" : "text-teal-600"}`} />
            <span>{t.navChatbot || "AI Assistant"}</span>
          </button>
          <button
            onClick={() => setActiveView("patient")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition ${
              activeView === "patient" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.navPatient}
          </button>
          <button
            onClick={() => setActiveView("doctor")}
            className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition ${
              activeView === "doctor" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t.navDoctor}
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <button
              onClick={() => changeLanguage("en")}
              className={`px-1.5 py-0.5 rounded-md transition ${lang === "en" ? "bg-white shadow-xs text-teal-700 font-bold" : "text-slate-500"}`}
            >
              EN
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => changeLanguage("hi")}
              className={`px-1.5 py-0.5 rounded-md transition ${lang === "hi" ? "bg-white shadow-xs text-teal-700 font-bold" : "text-slate-500"}`}
            >
              हिन्दी
            </button>
          </div>

          {/* User state */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-teal-600 font-medium capitalize">{user.role}</span>
              </div>
              <button
                onClick={logoutUser}
                title="Log Out"
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveView("auth")}
            >
              <User className="w-4 h-4 mr-1" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
