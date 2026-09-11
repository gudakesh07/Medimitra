import React, { useState } from "react";
import { ShieldCheck, Info, CheckCircle2 } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useApp } from "../../context/AppContext";
import { api } from "../../services/api";

export function ConsentModal({ isOpen, onConsentAccepted, patientId }) {
  const { t } = useApp();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      if (patientId) {
        await api.giveConsent(patientId);
      }
      onConsentAccepted();
    } catch (err) {
      console.error("Consent record error:", err);
      // Still allow proceeding in demo mode
      onConsentAccepted();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title={t.consentTitle}>
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
          <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-900">Secure & Confidential Case-Taking</h4>
            <p className="text-xs text-teal-700 mt-1 leading-relaxed">{t.consentDesc}</p>
          </div>
        </div>

        <ul className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <span>{t.consentPoint1}</span>
          </li>
          <li className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <span className="font-medium text-slate-800">{t.consentPoint2}</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <span>{t.consentPoint3}</span>
          </li>
        </ul>

        <div className="pt-3 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded-lg border-slate-300 focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800">{t.consentCheckbox}</span>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleAccept}
            disabled={!agreed || loading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {loading ? "Recording..." : t.consentAcceptBtn}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
