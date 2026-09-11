import React, { useState, useEffect } from "react";
import { Key, Sparkles, Check, AlertCircle, Eye, EyeOff, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  setStoredApiKey,
  getStoredModel,
  setStoredModel,
  validateGeminiApiKey,
  isKeyFromEnv
} from "../../services/geminiService";

export function GeminiConfigModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEnvKey, setIsEnvKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSelectedModel(getStoredModel());
      setIsEnvKey(isKeyFromEnv());
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: "Please enter an API key to test." });
      return;
    }

    setTesting(true);
    setTestResult(null);

    const result = await validateGeminiApiKey(apiKey);
    setTesting(false);

    if (result.valid) {
      setTestResult({ success: true, message: "Key verified successfully! Gemini API is connected." });
    } else {
      setTestResult({ success: false, message: result.error || "Connection test failed." });
    }
  };

  const handleSave = () => {
    setStoredApiKey(apiKey.trim());
    setStoredModel(selectedModel);
    setSavedSuccess(true);

    if (onKeyUpdated) {
      onKeyUpdated({
        hasKey: Boolean(apiKey.trim()),
        model: selectedModel
      });
    }

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClearKey = () => {
    setApiKey("");
    setStoredApiKey("");
    setTestResult(null);
    if (onKeyUpdated) {
      onKeyUpdated({ hasKey: false, model: selectedModel });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Google Gemini AI" maxWidth="max-w-xl">
      <div className="space-y-6 pt-2 font-sans-custom">
        {/* Header Description */}
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-teal-50/80 border border-teal-100 text-xs text-teal-900 leading-relaxed">
          <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Google Gemini Neural Core:</span> Connect your official Gemini API key to enable instant, real-time medical triage and clinical patient inquiries directly in MediMitra.
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-teal-600" />
                Gemini API Key
              </label>
              {isEnvKey && (
                <Badge variant="success" size="sm" className="text-[10px]">
                  Loaded from .env
                </Badge>
              )}
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 hover:underline flex items-center gap-1"
            >
              Get Free Key from Google AI Studio
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
                setSavedSuccess(false);
              }}
              placeholder="AQ... or AIzaSy..."
              className="w-full pl-3.5 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 transition shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="p-1.5 text-slate-400 hover:text-slate-600 transition"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Stored locally in your browser session. Never transferred to external third-party servers.
          </p>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800">Select Gemini Model</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-500 bg-teal-50/50 shadow-sm ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{m.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <Badge variant={isSelected ? "success" : "default"} size="sm" className="text-[9px]">
                      {m.badge}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 leading-tight">{m.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Connection Output */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              testResult.success
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-rose-50 border border-rose-200 text-rose-800"
            }`}
          >
            {testResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium">{testResult.message}</div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestKey}
              disabled={testing || !apiKey.trim()}
              className="text-xs"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin text-teal-600" />
                  Testing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                  Test Connection
                </>
              )}
            </Button>
            {apiKey && (
              <button
                type="button"
                onClick={handleClearKey}
                className="text-xs text-slate-400 hover:text-rose-600 transition px-2 py-1"
              >
                Clear Key
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              className="text-xs shadow-md shadow-teal-500/20"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-white" />
                  Saved!
                </>
              ) : (
                "Save & Apply"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
