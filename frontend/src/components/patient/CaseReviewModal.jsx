import React, { useState } from "react";
import { CheckCircle, AlertTriangle, Share2, Code2, Clock, Pill, HeartPulse, FileText } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export function CaseReviewModal({ isOpen, onClose, caseId, summaryData, onOpenShare }) {
  const { t } = useApp();
  const [fhirData, setFhirData] = useState(null);
  const [showFhir, setShowFhir] = useState(false);
  const [loadingFhir, setLoadingFhir] = useState(false);

  const handleFetchFhir = async () => {
    setLoadingFhir(true);
    try {
      const data = await api.getFhirBundle(caseId);
      setFhirData(data);
      setShowFhir(true);
    } catch (err) {
      console.error("FHIR fetch error:", err);
      // Fallback preview
      setFhirData({
        resourceType: "Bundle",
        type: "collection",
        entry: [
          { resource: { resourceType: "Patient", id: "pat-demo", name: [{ text: "Patient" }] } },
          { resource: { resourceType: "Encounter", id: "enc-demo", reasonCode: [{ text: summaryData?.chief_complaint }] } }
        ]
      });
      setShowFhir(true);
    } finally {
      setLoadingFhir(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.reviewTitle} maxWidth="max-w-3xl">
      <div className="space-y-6">
        <p className="text-xs text-slate-500">{t.reviewSubtitle}</p>

        {/* Structured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chief Complaint */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-teal-600" />
              {t.chiefComplaint}
            </span>
            <p className="text-sm font-semibold text-slate-800">{summaryData?.chief_complaint || "N/A"}</p>
          </div>

          {/* Duration */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600" />
              {t.duration}
            </span>
            <p className="text-sm font-semibold text-slate-800">{summaryData?.duration || "N/A"}</p>
          </div>

          {/* Key Symptoms */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              {t.symptoms}
            </span>
            <p className="text-sm font-medium text-slate-700">{summaryData?.symptoms || "N/A"}</p>
          </div>

          {/* Medications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-amber-600" />
              {t.medications}
            </span>
            <p className="text-sm font-medium text-slate-700">{summaryData?.medication_history || "None reported"}</p>
          </div>
        </div>

        {/* Missing Information Alerts */}
        {summaryData?.missing_information && summaryData.missing_information !== "All standard intake fields addressed" && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {t.missingInfo}
            </span>
            <p className="text-xs text-amber-800">{summaryData.missing_information}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFetchFhir}
            disabled={loadingFhir}
          >
            <Code2 className="w-4 h-4 mr-1.5 text-slate-600" />
            {loadingFhir ? "Loading FHIR..." : t.exportFhirBtn}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              size="md"
              onClick={() => {
                onClose();
                onOpenShare();
              }}
            >
              <Share2 className="w-4 h-4 mr-1.5" />
              {t.shareWithDoctorBtn}
            </Button>
          </div>
        </div>

        {/* FHIR Inspector Submodal / Accordion */}
        {showFhir && fhirData && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-teal-400">HL7 FHIR R4 Bundle (Interoperability Spec)</span>
              <button
                onClick={() => setShowFhir(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Hide
              </button>
            </div>
            <pre className="text-[11px] font-mono overflow-x-auto max-h-60 p-2 bg-slate-950 rounded-xl">
              {JSON.stringify(fhirData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
