import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { PatientPortalPage } from "./pages/PatientPortalPage";
import { ClinicianDashboardView } from "./components/doctor/ClinicianDashboardView";
import { AuthPage } from "./pages/AuthPage";
import { AIChatbotPage } from "./pages/AIChatbotPage";
import { FloatingChatWidget } from "./components/chat/FloatingChatWidget";
import { ErrorBoundary } from "./components/common/ErrorBoundary";

function MainContent() {
  const [activeView, setActiveView] = useState("landing");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white relative">
      {/* Top Navbar */}
      <Navbar activeView={activeView} setActiveView={setActiveView} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "landing" && (
          <LandingPage
            onStartPatient={() => setActiveView("patient")}
            onOpenDoctor={() => setActiveView("doctor")}
            onOpenChatbot={() => setActiveView("chatbot")}
          />
        )}

        {activeView === "chatbot" && (
          <AIChatbotPage
            onStartIntake={() => setActiveView("patient")}
            onOpenDoctor={() => setActiveView("doctor")}
          />
        )}

        {activeView === "patient" && (
          <PatientPortalPage onNavigateDoctor={() => setActiveView("doctor")} />
        )}

        {activeView === "doctor" && (
          <ClinicianDashboardView />
        )}

        {activeView === "auth" && (
          <AuthPage
            onSuccess={(role) => {
              if (role === "doctor") setActiveView("doctor");
              else setActiveView("patient");
            }}
          />
        )}
      </main>

      {/* Persistent Floating Chat Widget across all views */}
      <FloatingChatWidget onOpenFullChat={() => setActiveView("chatbot")} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-1 font-semibold text-slate-700">
          <span>MediMitra — AI-Assisted Patient Case-Taking</span>
          <span>•</span>
          <span className="text-teal-700 font-bold">Clinical MedTech Platform</span>
        </div>

        <p className="max-w-xl mx-auto text-slate-400 text-[11px] leading-relaxed">
          MediMitra is an intake decision-support system. It facilitates structured patient communication and highlights possible red-flag markers. It does not replace medical consultation or provide autonomous diagnosis.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
        <Analytics />
      </AppProvider>
    </ErrorBoundary>
  );
}
