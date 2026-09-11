import React from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  ArrowRight,
  Stethoscope,
  HeartPulse,
  BrainCircuit,
  Languages
} from "lucide-react";
import { GeminiChatbot } from "../components/chat/GeminiChatbot";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { useApp } from "../context/AppContext";

export function AIChatbotPage({ onStartIntake, onOpenDoctor }) {
  const { lang, t } = useApp();

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 font-sans-custom">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Gemini Neural Core
            </span>
            <span className="text-xs text-slate-400">Clinical Triage & Health Guidance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dr. Mitra — AI Health Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Conversational triage powered by Google Gemini API. Ask questions about your symptoms, prepare for doctor appointments, and check critical red flags in English or हिन्दी.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onStartIntake && (
            <Button size="sm" variant="primary" onClick={onStartIntake} className="shadow-md shadow-teal-500/20">
              <FileText className="w-4 h-4 mr-1.5" />
              Start Official Intake
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Chatbot on Right (or full) + Clinical Guide on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Clinical Guidance & Quick Resources (4 cols) */}
        <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
          {/* Clinical Guardrails Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Assistance Rules</h3>
                <p className="text-[11px] text-slate-400">How Dr. Mitra analyzes symptoms</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>Timeline Tracking:</strong> Structures symptom duration, frequency, and severity.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>Multilingual:</strong> Converses seamlessly in both English and natural conversational Hindi.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">•</span>
                <span>
                  <strong>Consultation Ready:</strong> Formulates relevant questions to ask your healthcare provider.
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-teal-600 inline mr-1" />
              Dr. Mitra provides clinical information and does not prescribe medicines or replace licensed medical diagnosis.
            </div>
          </div>

          {/* Red Flag Warning Reference */}
          <div className="bg-rose-50/80 p-5 rounded-3xl border border-rose-200/90 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>When to Seek Immediate Emergency Care</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              If you or someone with you experiences any of the following, call <strong>112 / 108</strong> or go to an Emergency Department immediately:
            </p>
            <ul className="text-[11px] text-rose-700 space-y-1.5 list-disc list-inside">
              <li>Crushing chest pain or pressure</li>
              <li>Severe sudden breathlessness or gasping</li>
              <li>Sudden facial drooping or arm weakness</li>
              <li>High fever with stiff neck and confusion</li>
              <li>Coughing or vomiting substantial blood</li>
            </ul>
          </div>

          {/* Link to Full Intake Stepper */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 p-5 rounded-3xl text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Formal Case-Taking</span>
            </div>
            <h4 className="text-sm font-bold text-white">Need an official summary for your doctor?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              MediMitra's step-by-step case stepper generates a structured electronic clinical summary with FHIR records for your clinician.
            </p>
            {onStartIntake && (
              <Button
                variant="primary"
                size="sm"
                onClick={onStartIntake}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
              >
                Launch Case Stepper
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Side: Primary Gemini Chatbot Interface (8 cols) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <GeminiChatbot isEmbedded={false} onNavigateIntake={onStartIntake} />
        </div>
      </div>
    </div>
  );
}
