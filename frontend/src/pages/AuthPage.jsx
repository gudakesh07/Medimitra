import React, { useState } from "react";
import { User, Lock, Mail, Stethoscope, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export function AuthPage({ onSuccess }) {
  const { loginUser } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("32");
  const [gender, setGender] = useState("Male");
  const [specialization, setSpecialization] = useState("General Physician");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register({
          name,
          email,
          password,
          role,
          age: parseInt(age) || 30,
          gender,
          specialization,
          hospital: "Community Clinic"
        });
        loginUser(res.user, res.access_token);
        onSuccess(res.user.role);
      } else {
        const res = await api.login({ email, password });
        loginUser(res.user, res.access_token);
        onSuccess(res.user.role);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoDoctor = async () => {
    setEmail("dr.sharma@medimitra.health");
    setPassword("Doctor@123");
    setRole("doctor");
    setIsRegister(false);
    setLoading(true);
    try {
      const res = await api.login({ email: "dr.sharma@medimitra.health", password: "Doctor@123" });
      loginUser(res.user, res.access_token);
      onSuccess("doctor");
    } catch (err) {
      loginUser({
        id: 1,
        name: "Dr. Rajesh Sharma, MD",
        email: "dr.sharma@medimitra.health",
        role: "doctor",
        doctor_id: 1
      }, "demo-token");
      onSuccess("doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoPatient = () => {
    loginUser({
      id: 2,
      name: "Rohan Verma",
      email: "rohan@example.com",
      role: "patient",
      patient_id: 1,
      preferred_language: "en"
    }, "demo-patient-token");
    onSuccess("patient");
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 font-sans-custom">
      <Card className="shadow-2xl border-slate-200">
        <CardHeader className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <User className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">
            {isRegister ? "Create MediMitra Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isRegister ? "Register to begin secure case-taking" : "Sign in to access your portal"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Quick Demo Credentials Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              ⚡ Instant 1-Click Evaluation Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPatient}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-700 transition text-slate-700 shadow-2xs"
              >
                👤 Demo Patient
              </button>
              <button
                type="button"
                onClick={handleQuickDemoDoctor}
                className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition shadow-2xs"
              >
                🩺 Dr. Sharma
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${!isRegister ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${isRegister ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"}`}
            >
              Register
            </button>
          </div>

          {/* Role selector for registration */}
          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${role === "patient" ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600"}`}
                >
                  <User className="w-4 h-4" />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${role === "doctor" ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600"}`}
                >
                  <Stethoscope className="w-4 h-4" />
                  Doctor
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isRegister && role === "patient" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            )}

            {isRegister && role === "doctor" && (
              <Input
                label="Specialization"
                placeholder="e.g. General Physician / Cardiologist"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
