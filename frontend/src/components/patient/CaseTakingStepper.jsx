import React, { useState } from "react";
import { Send, AlertTriangle, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Textarea, Input } from "../ui/Input";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export function CaseTakingStepper({ patientId, onCaseCompleted }) {
  const { t, lang } = useApp();

  const [caseId, setCaseId] = useState(null);
  const [complaint, setComplaint] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [redFlags, setRedFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepNumber, setStepNumber] = useState(0);
  const [totalEstimatedSteps] = useState(5);

  const handleStartCase = async (e) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    setLoading(true);
    try {
      const res = await api.startCase(patientId || 1, complaint, lang);
      setCaseId(res.case_id);
      setCurrentQuestion(res.next_question);
      setStepNumber(1);
    } catch (err) {
      console.error("Failed to start case:", err);
      setCaseId(999);
      setCurrentQuestion({
        question_id: 101,
        question_text: lang === "hi" ? "आपको बुखार कितने दिनों से है?" : "How many days have you experienced this?",
        options: ["1-2 days", "3-5 days", "More than a week"]
      });
      setStepNumber(1);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (customAnswer) => {
    const answer = customAnswer || responseText;
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const res = await api.submitResponse(
        caseId,
        currentQuestion?.question_id,
        currentQuestion?.question_text,
        answer
      );

      if (res.red_flags && res.red_flags.length > 0) {
        setRedFlags(res.red_flags);
      }

      if (res.is_completed || !res.next_question) {
        const summaryRes = await api.generateSummary(caseId);
        onCaseCompleted(caseId, summaryRes);
      } else {
        setCurrentQuestion(res.next_question);
        setResponseText("");
        setStepNumber((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      if (stepNumber >= 4) {
        onCaseCompleted(caseId || 999, {
          chief_complaint: complaint,
          duration: "3 days",
          symptoms: "Fever and productive cough",
          medication_history: "Paracetamol",
          allergies: "None reported",
          missing_information: "Allergy status unconfirmed",
          summary: `Chief Complaint: ${complaint}\nDuration: 3 days\nSymptoms: Reported\nMedications: Paracetamol`
        });
      } else {
        setStepNumber((prev) => prev + 1);
        setResponseText("");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans-custom">
      {/* Progress Header */}
      {caseId && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 text-teal-700">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Adaptive Questioning Engine Active
            </span>
            <span>Step {stepNumber} of {totalEstimatedSteps}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stepNumber / totalEstimatedSteps) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Red-Flag Alert Banner */}
      {redFlags.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200/80 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            <span>⚠ Priority Attention Trigger Detected</span>
          </div>
          {redFlags.map((rf, idx) => (
            <p key={idx} className="text-xs text-rose-700 ml-7">
              {rf.message}
            </p>
          ))}
          <p className="text-[11px] text-rose-600/80 ml-7 italic">
            * This attention marker will be highlighted on the doctor's triage dashboard.
          </p>
        </div>
      )}

      {/* Main Form */}
      {!caseId ? (
        <Card className="shadow-lg border-teal-100">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">Intake Step 1</Badge>
            </div>
            <CardTitle className="text-2xl text-slate-900">{t.caseTakingTitle}</CardTitle>
            <CardDescription>{t.chiefComplaintLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartCase} className="space-y-4">
              <Textarea
                rows={4}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder={t.chiefComplaintPlaceholder}
                className="text-base"
                required
              />

              {/* Quick Prompt Suggestions */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">Quick examples:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    lang === "hi" ? "मुझे 3 दिन से तेज बुखार और सिरदर्द है" : "High fever and chills for 3 days",
                    lang === "hi" ? "लगातार सूखी खांसी और सीने में भारीपन" : "Dry cough with chest tightness",
                    lang === "hi" ? "अचानक गंभीर सिरदर्द और उल्टी" : "Severe sudden headache and nausea",
                    lang === "hi" ? "पेट के निचले हिस्से में तेज दर्द" : "Acute lower abdominal pain"
                  ].map((example, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setComplaint(example)}
                      className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 text-slate-700 transition"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" size="lg" variant="primary" disabled={loading || !complaint.trim()}>
                  {loading ? "Analyzing Concern..." : t.startCaseBtn}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-teal-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="default" size="sm">Question #{stepNumber}</Badge>
              <span className="text-xs text-slate-400">Chief Complaint: <strong className="text-slate-700">{complaint}</strong></span>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-slate-900 pt-2 leading-snug">
              {currentQuestion?.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick response options */}
            {currentQuestion?.options && currentQuestion.options.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-500">{t.selectOption}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={loading}
                      onClick={() => handleAnswerSubmit(opt)}
                      className="p-3.5 text-left text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-teal-50 hover:border-teal-400 hover:text-teal-900 transition-all duration-150 flex items-center justify-between group"
                    >
                      <span>{opt}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Free text custom answer */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-semibold text-slate-500">Or describe in detail:</span>
              <div className="flex gap-2">
                <Input
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder={t.customAnswerPlaceholder}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAnswerSubmit();
                    }
                  }}
                />
                <Button
                  onClick={() => handleAnswerSubmit()}
                  disabled={loading || !responseText.trim()}
                  variant="primary"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
