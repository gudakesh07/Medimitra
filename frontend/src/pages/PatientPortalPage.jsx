import React, { useState, useEffect } from "react";
import { PlusCircle, History, FileText, ArrowRight, ShieldCheck, Share2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ConsentModal } from "../components/patient/ConsentModal";
import { CaseTakingStepper } from "../components/patient/CaseTakingStepper";
import { CaseReviewModal } from "../components/patient/CaseReviewModal";
import { DoctorShareModal } from "../components/patient/DoctorShareModal";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export function PatientPortalPage({ onNavigateDoctor }) {
  const { user, t } = useApp();
  const [hasConsent, setHasConsent] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [isTakingCase, setIsTakingCase] = useState(false);
  const [completedCaseId, setCompletedCaseId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pastCases, setPastCases] = useState([]);

  useEffect(() => {
    if (user?.patient_id) {
      api.getConsent(user.patient_id)
        .then(() => setHasConsent(true))
        .catch(() => setHasConsent(false));

      api.getPatientCases()
        .then((cases) => setPastCases(cases))
        .catch(() => setPastCases([]));
    }
  }, [user]);

  const handleStartNewCase = () => {
    if (!hasConsent) {
      setShowConsentModal(true);
    } else {
      setIsTakingCase(true);
    }
  };

  const handleConsentAccepted = () => {
    setHasConsent(true);
    setShowConsentModal(false);
    setIsTakingCase(true);
  };

  const handleCaseCompleted = (caseId, summary) => {
    setCompletedCaseId(caseId);
    setSummaryData(summary);
    setIsTakingCase(false);
    setShowReviewModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans-custom">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 uppercase tracking-wide">
              Patient Portal
            </span>
            <span className="text-xs text-slate-400">ID: #{user?.patient_id || "DEMO-01"}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {user ? `Namaste, ${user.name}` : "Patient Health Intake"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Guided conversational intake before your doctor's appointment.
          </p>
        </div>

        <div>
          {!isTakingCase ? (
            <Button size="lg" variant="primary" onClick={handleStartNewCase} className="shadow-md shadow-teal-500/20">
              <PlusCircle className="w-5 h-5 mr-1.5" />
              New Case Intake
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsTakingCase(false)}>
              Cancel Intake
            </Button>
          )}
        </div>
      </div>

      {/* Main Intake Area or History */}
      {isTakingCase ? (
        <CaseTakingStepper
          patientId={user?.patient_id || 1}
          onCaseCompleted={handleCaseCompleted}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Your Intake Records
            </h3>
          </div>

          {pastCases.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No previous case history yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                Ready to describe your health concern? Start an intake session and we will guide you step by step.
              </p>
              <Button variant="primary" onClick={handleStartNewCase}>
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Start First Intake
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastCases.map((c) => (
                <Card key={c.id} hover className="border-l-4 border-l-teal-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">Case #{c.id}</span>
                        <Badge variant={c.status === "shared" ? "success" : "default"} size="sm">
                          {c.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        <strong>Chief Complaint:</strong> {c.chief_complaint}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setCompletedCaseId(c.id);
                          setSummaryData(c.clinical_record || { chief_complaint: c.chief_complaint });
                          setShowReviewModal(true);
                        }}
                      >
                        View Summary
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          setCompletedCaseId(c.id);
                          setShowShareModal(true);
                        }}
                      >
                        <Share2 className="w-3.5 h-3.5 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consent Modal */}
      <ConsentModal
        isOpen={showConsentModal}
        patientId={user?.patient_id}
        onConsentAccepted={handleConsentAccepted}
      />

      {/* Case Review Modal */}
      <CaseReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        caseId={completedCaseId}
        summaryData={summaryData}
        onOpenShare={() => setShowShareModal(true)}
      />

      {/* Doctor Sharing Modal */}
      <DoctorShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        caseId={completedCaseId}
      />
    </div>
  );
}
