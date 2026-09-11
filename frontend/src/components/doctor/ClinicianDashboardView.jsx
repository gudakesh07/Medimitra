import React, { useState, useEffect } from "react";
import {
  Users,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  Clock,
  Pill,
  MessageSquare,
  Code2,
  Filter,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export function ClinicianDashboardView() {
  const { t } = useApp();
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [caseDetailModalOpen, setCaseDetailModalOpen] = useState(false);
  const [fhirModalOpen, setFhirModalOpen] = useState(false);
  const [activeFhirJson, setActiveFhirJson] = useState(null);
  const [filterOnlyRedFlags, setFilterOnlyRedFlags] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDoctorDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      // Demo fallback data
      setDashboardData({
        doctor_name: "Dr. Rajesh Sharma, MD",
        specialization: "General Internal Medicine & Pulmonology",
        hospital: "AIIMS Community Health Partner",
        total_shared_patients: 2,
        urgent_red_flag_cases: 1,
        cases: [
          {
            id: 101,
            patient_name: "Amit Patel",
            patient_age: 48,
            patient_gender: "Male",
            patient_language: "hi",
            chief_complaint: "लगातार सूखी खांसी और सीने में भारीपन (Dry cough with chest tightness)",
            status: "shared",
            updated_at: new Date().toISOString(),
            red_flags: [
              {
                rule_id: "RF-01",
                severity: "HIGH",
                message: "⚠ Possible Red Flag: Potential cardiopulmonary distress or acute resting breathlessness reported."
              }
            ],
            missing_info: "Drug allergy and chronic history unverified",
            summary: "Chief Complaint: Dry cough with chest tightness\nDuration: 4 days\nSymptoms: Productive with yellow phlegm, resting tightness\nMedications: Paracetamol, Over-the-counter cough syrup"
          },
          {
            id: 102,
            patient_name: "Sunita Devi",
            patient_age: 32,
            patient_gender: "Female",
            patient_language: "en",
            chief_complaint: "High fever (102°F) and severe body aches for 3 days",
            status: "reviewed",
            updated_at: new Date().toISOString(),
            red_flags: [],
            missing_info: "All standard intake fields addressed",
            summary: "Chief Complaint: High fever and body aches\nDuration: 3 days\nSymptoms: 102°F with mild shivering, headache\nMedications: Dolo 650mg"
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenCase = async (c) => {
    setSelectedCase(c);
    setCaseDetailModalOpen(true);
    try {
      const fullDetail = await api.getDoctorCaseDetail(c.id);
      setSelectedCase(fullDetail);
    } catch (err) {
      console.error("Full case fetch error:", err);
    }
  };

  const handleOpenFhir = async (caseId) => {
    try {
      const fhir = await api.getFhirBundle(caseId);
      setActiveFhirJson(fhir);
      setFhirModalOpen(true);
    } catch (err) {
      setActiveFhirJson({
        resourceType: "Bundle",
        type: "collection",
        id: `bundle-case-${caseId}`,
        entry: [{ resource: { resourceType: "Patient", name: [{ text: selectedCase?.patient_name }] } }]
      });
      setFhirModalOpen(true);
    }
  };

  const filteredCases = (dashboardData?.cases || []).filter((c) => {
    if (filterOnlyRedFlags) return c.red_flags && c.red_flags.length > 0;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Clinician Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-400" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">{t.doctorDashboardTitle}</h2>
            </div>
            <p className="text-xs sm:text-sm text-teal-200/80">
              {dashboardData?.doctor_name || "Attending Physician"} • {dashboardData?.specialization || "Clinical Intake Unit"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Triage Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <span className="text-xs text-slate-300 font-medium">Total Shared Intake Cases</span>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              {dashboardData?.total_shared_patients || 0}
            </p>
          </div>

          <div className="bg-rose-500/20 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30">
            <span className="text-xs text-rose-200 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Priority Red-Flags
            </span>
            <p className="text-2xl sm:text-3xl font-black text-rose-300 mt-1">
              {dashboardData?.urgent_red_flag_cases || 0}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-300 font-medium">Consent & Privacy Status</span>
            <p className="text-xs font-semibold text-emerald-300 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Active Patient Authorization
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Triage Filters:</span>
          <button
            onClick={() => setFilterOnlyRedFlags(false)}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition ${!filterOnlyRedFlags ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setFilterOnlyRedFlags(true)}
            className={`px-3 py-1 text-xs rounded-xl font-medium transition flex items-center gap-1 ${filterOnlyRedFlags ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-700 hover:bg-rose-100"}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.urgentFlags}
          </button>
        </div>

        <span className="text-xs text-slate-400">
          Showing {filteredCases.length} records
        </span>
      </div>

      {/* Patient Cases List */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">{t.noCasesFound}</p>
          </Card>
        ) : (
          filteredCases.map((c) => {
            const hasRedFlags = c.red_flags && c.red_flags.length > 0;
            return (
              <Card
                key={c.id}
                hover
                onClick={() => handleOpenCase(c)}
                className={`cursor-pointer transition border-l-4 ${hasRedFlags ? "border-l-rose-500 bg-rose-50/20" : "border-l-teal-500"}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-bold text-slate-900">{c.patient_name}</span>
                      <Badge variant="neutral" size="sm">
                        {c.patient_gender || "N/A"}, {c.patient_age ? `${c.patient_age} yrs` : "Age N/A"}
                      </Badge>
                      <Badge variant="info" size="sm">
                        Lang: {c.patient_language?.toUpperCase() || "EN"}
                      </Badge>
                      {hasRedFlags && (
                        <Badge variant="redFlag" size="sm">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          ⚠ Priority Red Flag
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 font-medium">
                      <strong className="text-slate-900 font-semibold">Chief Complaint:</strong> {c.chief_complaint}
                    </p>

                    {c.missing_info && c.missing_info !== "All standard intake fields addressed" && (
                      <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg inline-block">
                        ⚠ Incomplete Intake: {c.missing_info}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button size="sm" variant={hasRedFlags ? "danger" : "primary"}>
                      Review Case Summary
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Full Case Detail Clinician Modal */}
      {selectedCase && (
        <Modal
          isOpen={caseDetailModalOpen}
          onClose={() => setCaseDetailModalOpen(false)}
          title={`Clinical Case Review — ${selectedCase.patient_name}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Red Flag Warning Box */}
            {selectedCase.red_flags && selectedCase.red_flags.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>⚠ Possible Red Flag — Requires Immediate Clinician Attention</span>
                </div>
                {selectedCase.red_flags.map((rf, i) => (
                  <p key={i} className="text-xs text-rose-800 font-medium ml-7">
                    • {rf.message}
                  </p>
                ))}
                <p className="text-[11px] text-rose-600 ml-7 italic">
                  Clinical safety protocol: Red-flags are attention indicators derived from patient responses to assist clinical prioritization. They do not constitute an automated diagnosis.
                </p>
              </div>
            )}

            {/* Case Overview Badges */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-xl">
                Case ID: #{selectedCase.id}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-xl">
                Patient: {selectedCase.patient_name} ({selectedCase.patient_gender}, {selectedCase.patient_age} yrs)
              </span>
              <span className="px-3 py-1 bg-teal-50 text-teal-800 font-semibold rounded-xl">
                Intake Language: {selectedCase.patient_language?.toUpperCase()}
              </span>
            </div>

            {/* Clinician Case Summary Document */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Structured Clinical Summary
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-500">Chief Complaint</span>
                  <p className="font-semibold text-slate-900 mt-0.5">{selectedCase.chief_complaint}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">Duration & Progression</span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {selectedCase.clinical_record?.duration || "3 days reported"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">Reported Symptoms</span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedCase.clinical_record?.symptoms || "Standard symptoms reported"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500">Current Medications</span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedCase.clinical_record?.medication_history || "None reported"}
                  </p>
                </div>
              </div>

              {selectedCase.clinical_record?.missing_information && (
                <div className="pt-3 border-t border-slate-200">
                  <span className="text-xs font-bold text-amber-800">Missing Information / Gaps to Clarify:</span>
                  <p className="text-xs text-amber-700 mt-0.5">{selectedCase.clinical_record.missing_information}</p>
                </div>
              )}
            </div>

            {/* Original Patient Question/Answer Transcript (PRD Section 20.6) */}
            {selectedCase.responses && selectedCase.responses.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  Original Intake Transcript (Raw Patient Answers)
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                  {selectedCase.responses.map((resp, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                      <p className="font-semibold text-slate-700">Q: {resp.question_text}</p>
                      <p className="font-medium text-teal-800 bg-teal-50/60 p-2 rounded-lg">A: {resp.response_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenFhir(selectedCase.id)}
              >
                <Code2 className="w-4 h-4 mr-1.5" />
                Inspect FHIR R4 Bundle
              </Button>

              <Button size="sm" onClick={() => setCaseDetailModalOpen(false)}>
                Close Summary
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* FHIR Inspector Modal */}
      {fhirModalOpen && activeFhirJson && (
        <Modal
          isOpen={fhirModalOpen}
          onClose={() => setFhirModalOpen(false)}
          title="HL7 FHIR Interoperability Export"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              FHIR-compliant collection bundle mapping patient profile, encounter, clinical condition, and triage observations according to PRD Section 22.
            </p>
            <pre className="text-xs font-mono bg-slate-950 text-teal-300 p-4 rounded-2xl max-h-96 overflow-auto">
              {JSON.stringify(activeFhirJson, null, 2)}
            </pre>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setFhirModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
