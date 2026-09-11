import React from "react";
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  Languages,
  Sparkles,
  AlertTriangle,
  FileCheck2,
  Share2,
  Stethoscope,
  Bot
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardTitle, CardDescription } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useApp } from "../context/AppContext";

export function LandingPage({ onStartPatient, onOpenDoctor, onOpenChatbot }) {
  const { t } = useApp();

  return (
    <div className="space-y-16 pb-16 font-sans-custom">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Clinical MedTech • Powered by Google Gemini
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {t.heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              size="lg"
              variant="primary"
              onClick={onOpenChatbot}
              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/25"
            >
              <Bot className="w-5 h-5 mr-1.5" />
              {t.chatWithAiBtn || "Chat with Dr. Mitra AI"}
              <Sparkles className="w-4 h-4 ml-1.5 text-teal-200" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onStartPatient}
              className="w-full sm:w-auto"
            >
              {t.startIntakeBtn}
              <ArrowRight className="w-5 h-5 ml-1.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onOpenDoctor}
              className="w-full sm:w-auto"
            >
              <Stethoscope className="w-5 h-5 mr-1.5 text-teal-600" />
              {t.doctorLoginBtn}
            </Button>
          </div>

          {/* Safety Disclaimer Callout */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl max-w-2xl mx-auto text-left flex items-start gap-3 mt-4 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed font-medium">
              <strong className="font-bold">Clinical Support Notice:</strong> {t.clinicalSafetyNote}
            </p>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How MediMitra Transforms Clinical Intake
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Bridging the gap between verbal patient descriptions and clinician-ready electronic medical documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Languages className="w-6 h-6" />
            </div>
            <CardTitle>Multilingual Natural Input</CardTitle>
            <CardDescription>
              Patients communicate their chief complaint and symptoms in their preferred Indian language (English & हिन्दी supported in MVP).
            </CardDescription>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <CardTitle>Adaptive Questioning Engine</CardTitle>
            <CardDescription>
              No rigid, one-size-fits-all forms. MediMitra asks dynamic follow-up questions tailored specifically to the reported complaint and missing clinical data.
            </CardDescription>
          </Card>

          <Card hover className="space-y-3 border-rose-100 bg-rose-50/10">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <CardTitle className="text-rose-900">Safety Red-Flag Triggers</CardTitle>
            <CardDescription>
              Predefined clinical rules flag critical markers (e.g. chest tightness, acute severe pain, rigors) for priority doctor triage.
            </CardDescription>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <CardTitle>Clinician-Ready Summaries</CardTitle>
            <CardDescription>
              Converts conversational patient answers into structured medical notes detailing chief complaint, duration, medications, and allergies.
            </CardDescription>
          </Card>

          <Card hover className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Share2 className="w-6 h-6" />
            </div>
            <CardTitle>Patient-Controlled Sharing</CardTitle>
            <CardDescription>
              Zero unauthorized data access. Patients retain complete control and explicitly authorize which doctor can view their case.
            </CardDescription>
          </Card>

          <Card hover className="space-y-3 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-white border-teal-200/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-teal-950">Dr. Mitra — Gemini AI Chat</CardTitle>
            </div>
            <CardDescription>
              Interactive real-time clinical Q&A with voice input, text-to-speech, multilingual support, and immediate red-flag emergency screening.
            </CardDescription>
            <div className="pt-1">
              <button
                onClick={onOpenChatbot}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 group"
              >
                <span>Try Dr. Mitra AI</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>
      </section>

      {/* End-to-End Workflow Graphic */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <Badge variant="default">End-to-End Journey</Badge>
            <h3 className="text-xl font-bold text-slate-900">The MediMitra Flow</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mx-auto text-xs">1</div>
              <h4 className="text-xs font-bold text-slate-800">Consent & Concern</h4>
              <p className="text-[11px] text-slate-500">Patient gives consent and states chief health concern</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mx-auto text-xs">2</div>
              <h4 className="text-xs font-bold text-slate-800">Adaptive Inquiries</h4>
              <p className="text-[11px] text-slate-500">System asks targeted follow-ups and checks red-flag rules</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mx-auto text-xs">3</div>
              <h4 className="text-xs font-bold text-slate-800">Patient Review</h4>
              <p className="text-[11px] text-slate-500">Patient verifies summary and selects attending clinician</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center mx-auto text-xs">4</div>
              <h4 className="text-xs font-bold text-slate-800">Doctor Review</h4>
              <p className="text-[11px] text-slate-500">Clinician reviews triage summary in seconds before consultation</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
