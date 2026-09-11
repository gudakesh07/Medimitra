function getBaseUrl() {
  const envUrl = import.meta.env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  // In production on Vercel and in local dev (via Vite proxy), use relative /api
  return "/api";
}

function getAuthHeader() {
  const token = localStorage.getItem("medimitra_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return response.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Unable to connect to MediMitra API server. Please check your internet or deployment status.");
    }
    throw error;
  }
}

export const api = {
  // Health
  checkHealth: () => request("/"),

  // Auth
  register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getProfile: () => request("/auth/me"),

  // Patient
  giveConsent: (patientId) => request("/patient/consent", {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, consent_status: true, consent_version: "1.0" })
  }),
  getConsent: (patientId) => request(`/patient/consent/${patientId}`),
  getPatientCases: () => request("/patient/cases"),

  // Case Taking
  startCase: (patientId, initialComplaint, language) => request("/cases/start", {
    method: "POST",
    body: JSON.stringify({ patient_id: patientId, initial_complaint: initialComplaint, language })
  }),
  submitResponse: (caseId, questionId, questionText, responseText) => request("/cases/response", {
    method: "POST",
    body: JSON.stringify({
      case_id: caseId,
      question_id: questionId,
      question_text: questionText,
      response_text: responseText
    })
  }),
  generateSummary: (caseId) => request(`/cases/${caseId}/generate-summary`, { method: "POST" }),
  getCaseDetails: (caseId) => request(`/cases/${caseId}`),
  getFhirBundle: (caseId) => request(`/cases/${caseId}/fhir`),

  // Clinician
  getDoctorDashboard: () => request("/doctor/dashboard"),
  getDoctorCaseDetail: (caseId) => request(`/doctor/cases/${caseId}`),

  // Sharing
  getDoctors: () => request("/sharing/doctors"),
  grantCaseAccess: (caseId, doctorId) => request(`/sharing/grant?case_id=${caseId}`, {
    method: "POST",
    body: JSON.stringify({ doctor_id: doctorId })
  }),
  revokeCaseAccess: (caseId, doctorId) => request(`/sharing/revoke?case_id=${caseId}&doctor_id=${doctorId}`, {
    method: "POST"
  })
};
