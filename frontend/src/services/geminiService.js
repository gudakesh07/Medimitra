// Gemini AI Service for MediMitra Clinical Intake & Patient Triage Assistant

const STORAGE_KEY_API_KEY = "medimitra_gemini_api_key";
const STORAGE_KEY_MODEL = "medimitra_gemini_model";

export const DEFAULT_MODEL = "gemini-3.6-flash";

export const AVAILABLE_MODELS = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    badge: "Fastest & Recommended",
    description: "State-of-the-art clinical intake and multimodal health reasoning"
  },
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    badge: "High Performance",
    description: "Balanced speed and deep diagnostic triage reasoning"
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash Latest",
    badge: "Auto-updating",
    description: "Always points to Google's latest stable Flash model"
  }
];

const VALID_MODEL_IDS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest"];

export const CLINICAL_SYSTEM_INSTRUCTION = `You are Dr. Mitra AI, an intelligent, empathetic medical triage and healthcare intake assistant for MediMitra — an AI-assisted clinical MedTech platform.

CORE PRINCIPLES & CLINICAL GUIDANCE:
1. EMPATHY & CLARITY: Listen carefully to the patient's symptoms and respond warmly, clearly, and accessibly. Explain medical terms in simple language without condescension.
2. MULTILINGUAL SUPPORT: Respond fluently in the language the patient uses (primarily English or Hindi/Hinglish). If the patient greets or writes in Hindi, reply in clear, reassuring Hindi.
3. STRUCTURED CLINICAL INTAKE: Ask 1-2 focused follow-up questions when relevant:
   - Onset & Duration (When did it start? Constant or intermittent?)
   - Severity & Progression (Mild, moderate, severe? Getting worse?)
   - Associated Symptoms (Fever, pain, nausea, shortness of breath, etc.)
   - Past History & Current Medications (Any chronic conditions or OTC medicines taken?)
4. SAFETY & BOUNDARIES (STRICT MEDICAL DISCLAIMER):
   - You provide educational guidance and clinical structuring support only.
   - You DO NOT formally diagnose diseases or prescribe prescription medications.
   - Always encourage consulting an authorized in-person physician for definitive diagnosis and treatment.
5. PRIORITY ATTENTION / RED FLAG PROTOCOL:
   - If any high-risk red-flag symptoms are mentioned (such as: severe crushing chest pain, pain radiating to left arm/jaw, acute shortness of breath or cyanosis, sudden severe weakness or facial droop, sudden vision/speech loss, coughing or vomiting blood, stiff neck with high fever, suicidal ideation):
   - Immediately highlight a prominent warning: "⚠ EMERGENCY / RED FLAG DETECTED".
   - Advise the user to call emergency services (112 or 108 in India, or local emergency) or proceed to the nearest emergency department immediately without waiting.
6. FORMATTING: Use clean markdown with concise bullet points, bold key terms, and easy-to-read sections. Keep answers focused and actionable.`;

// Red flag detection patterns for instant client-side identification
const RED_FLAG_PATTERNS = [
  /chest\s+pain/i,
  /radiat(ing|es?)\s+(to\s+)?(arm|jaw|back)/i,
  /shortness\s+of\s+breath|difficulty\s+breathing|cannot\s+breathe|gasping/i,
  /coughing\s+(up\s+)?blood|hemoptysis/i,
  /vomiting\s+blood|hematemesis/i,
  /sudden\s+(weakness|numbness|paralysis|slurred\s+speech)/i,
  /loss\s+of\s+consciousness|fainted|blackout/i,
  /stiff\s+neck\s+(and|with)\s+(high\s+)?fever/i,
  /सीने\s+में\s+दर्द/i,
  /सांस\s+लेने\s+में\s+तकलीफ़|सांस\s+फूलना/i,
  /खून\s+की\s+उल्टी/i,
  /अचानक\s+बेहोशी|चक्कर\s+खाकर\s+गिरना/i
];

export function checkTextForRedFlags(text) {
  if (!text) return false;
  return RED_FLAG_PATTERNS.some((pattern) => pattern.test(text));
}

export function getStoredApiKey() {
  const localKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  return "";
}

export function isKeyFromEnv() {
  const localKey = localStorage.getItem(STORAGE_KEY_API_KEY);
  if (localKey && localKey.trim()) {
    return false;
  }
  const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
  return Boolean(envKey && envKey.trim());
}

export function setStoredApiKey(key) {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}

export function getStoredModel() {
  const stored = localStorage.getItem(STORAGE_KEY_MODEL);
  if (stored && VALID_MODEL_IDS.includes(stored)) {
    return stored;
  }
  return DEFAULT_MODEL;
}

export function setStoredModel(model) {
  if (VALID_MODEL_IDS.includes(model)) {
    localStorage.setItem(STORAGE_KEY_MODEL, model);
  } else {
    localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
  }
}

/**
 * Validates a Gemini API key by making a minimal generateContent ping.
 */
export async function validateGeminiApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) {
    return { valid: false, error: "API key cannot be empty" };
  }

  const testModel = getStoredModel() || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 5 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Validation failed with status ${response.status}`;
      return { valid: false, error: message };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, error: err.message || "Network connection failed" };
  }
}

/**
 * Call Gemini API directly from client with fallback support
 */
export async function sendGeminiMessage({
  messages,
  apiKey = null,
  model = null,
  systemInstruction = CLINICAL_SYSTEM_INSTRUCTION
}) {
  const activeKey = apiKey || getStoredApiKey();
  let activeModel = model || getStoredModel();
  if (!VALID_MODEL_IDS.includes(activeModel)) {
    activeModel = DEFAULT_MODEL;
  }

  // If no API key is provided, use high-quality intelligent clinical fallback
  if (!activeKey) {
    return generateFallbackClinicalResponse(messages);
  }

  async function callGemini(modelName) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${activeKey.trim()}`;
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.35,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 1500
      }
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      const errorMsg = errorJson.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(`Gemini API Error: ${errorMsg}`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text response received from Gemini model.");
    }

    return text;
  }

  try {
    let text;
    let finalModel = activeModel;

    try {
      text = await callGemini(activeModel);
    } catch (primaryErr) {
      // If primary model hit 404 or 503, try alternative supported model
      if ((primaryErr.status === 404 || primaryErr.status === 503) && activeModel !== "gemini-3.6-flash") {
        console.warn(`Model ${activeModel} error (${primaryErr.status}). Retrying with gemini-3.6-flash...`);
        finalModel = "gemini-3.6-flash";
        text = await callGemini("gemini-3.6-flash");
      } else if (primaryErr.status === 503 && activeModel === "gemini-3.6-flash") {
        console.warn("gemini-3.6-flash busy, retrying with gemini-3.5-flash...");
        finalModel = "gemini-3.5-flash";
        text = await callGemini("gemini-3.5-flash");
      } else {
        throw primaryErr;
      }
    }

    const hasRedFlag = checkTextForRedFlags(text) || checkTextForRedFlags(messages[messages.length - 1]?.content);

    return {
      text,
      hasRedFlag,
      model: finalModel,
      source: "gemini-api"
    };
  } catch (err) {
    console.error("Gemini API call error:", err);
    return {
      text: `⚠️ **Connection Note**: Unable to complete request with Gemini API key (${err.message}).\n\nPlease check your key in **Settings (⚙️)** or ensure an active internet connection.\n\nHere is clinical guidance based on our intake protocols:\n\n${generateFallbackClinicalResponse(messages).text}`,
      hasRedFlag: checkTextForRedFlags(messages[messages.length - 1]?.content),
      model: activeModel,
      source: "fallback-error"
    };
  }
}

/**
 * High-quality clinical fallback generator when running without an API key
 */
function generateFallbackClinicalResponse(messages) {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const lower = lastUserMsg.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(lastUserMsg);

  const hasRedFlag = checkTextForRedFlags(lastUserMsg);

  if (hasRedFlag) {
    if (isHindi) {
      return {
        text: `🚨 **महत्वपूर्ण चेतावनी: तत्काल ध्यान देने योग्य लक्षण (Red Flag)**\n\nआपके द्वारा बताए गए लक्षण (जैसे सीने में असहजता, सांस लेने में तकलीफ या गंभीर कमजोरी) तत्काल चिकित्सा सहायता की मांग करते हैं।\n\n### तुरंत क्या करें:\n1. **आपातकालीन नंबर पर कॉल करें**: तुरंत **112** या **108** डायल करें।\n2. **नजदीकी अस्पताल/इमरजेंसी जाएं**: बिना देरी किए किसी पारिवारिक सदस्य या नजदीकी व्यक्ति की सहायता लें।\n3. **आराम से बैठें**: घबराएं नहीं और सीढ़ियां चढ़ने या भारी गतिविधि से बचें।\n\n*सूचना: यह प्लेटफॉर्म केवल प्राथमिक जानकारी संग्रह करता है, आपातकालीन स्थिति में तुरंत डॉक्टर से संपर्क करें।*`,
        hasRedFlag: true,
        model: "Dr. Mitra Clinical Safety Engine",
        source: "safety-rule"
      };
    }
    return {
      text: `🚨 **PRIORITY ATTENTION: Red Flag Warning Detected**\n\nThe symptoms you described (such as acute chest discomfort, respiratory distress, or severe acute onset) require **immediate emergency medical evaluation**.\n\n### Immediate Actions Required:\n1. **Call Emergency Services**: Dial **112 / 108** (India) or your local emergency hospital line immediately.\n2. **Go to the Nearest Emergency Department (ED)**: Do not drive yourself; have an ambulance or family member transport you.\n3. **Rest in an upright position**: Avoid physical exertion and loosen tight clothing around your chest or neck.\n\n*Clinical Disclaimer: MediMitra is an intake decision-support system and does not replace emergency medical care.*`,
      hasRedFlag: true,
      model: "Dr. Mitra Clinical Safety Engine",
      source: "safety-rule"
    };
  }

  // Common clinical queries
  if (lower.includes("fever") || lower.includes("बुखार") || lower.includes("temperature")) {
    if (isHindi) {
      return {
        text: `नमस्ते। बुखार के संबंध में कुछ जरूरी बिंदु:\n\n### नैदानिक मूल्यांकन (Clinical Intake):\n- **अवधि**: बुखार कितने दिनों से है?\n- **तापमान**: क्या आपने थर्मामीटर से नापा है (जैसे 100°F या 102°F)?\n- **अन्य लक्षण**: क्या ठंड लग रही है, खांसी, सिरदर्द या बदन दर्द है?\n\n### प्राथमिक सावधानियां:\n- भरपूर पानी और ORS/तरल पदार्थ पिएं।\n- पर्याप्त आराम करें।\n- यदि डॉक्टर से पूर्व-परामर्श हो तो पैरासिटामोल (Paracetamol) ले सकते हैं।\n\n💡 *आप ऊपर '⚙️ Gemini Settings' में अपनी Gemini API Key डालकर रियल-टाइम AI चैट का पूरा अनुभव ले सकते हैं।*`,
        hasRedFlag: false,
        model: "MediMitra Clinical AI",
        source: "clinical-engine"
      };
    }
    return {
      text: `Hello! Here is structured clinical guidance regarding your fever inquiry:\n\n### Key Intake Inquiries:\n- **Duration**: How many days has the fever been present?\n- **Recorded Temperature**: Have you measured with a digital thermometer (e.g., above 101°F)?\n- **Associated Symptoms**: Are you experiencing shivering/chills, productive cough, headache, or nausea?\n\n### General Supportive Measures:\n- Maintain hydration with oral rehydration salts (ORS), clear soups, or water.\n- Rest in a well-ventilated, comfortable environment.\n- You can document these details in MediMitra's **Patient Portal** to share with your attending physician.\n\n💡 *Tip: Add your Google Gemini API key in **⚙️ Settings** to unlock full real-time neural responses!*`,
      hasRedFlag: false,
      model: "MediMitra Clinical AI",
      source: "clinical-engine"
    };
  }

  if (lower.includes("cough") || lower.includes("खांसी") || lower.includes("throat") || lower.includes("गला")) {
    return {
      text: `### Clinical Intake Guidance for Cough / Sore Throat:\n\n1. **Type of Cough**: Is it a dry, tickling cough, or productive with yellow/green phlegm?\n2. **Duration**: Has this persisted for more than 10-14 days?\n3. **Breathing Check**: Are you noticing any wheezing, whistling sounds, or chest tightness?\n\n**Helpful Home Care**:\n- Warm saline gargles 2-3 times daily for throat irritation.\n- Steam inhalation and warm fluids (ginger-tulsi tea, warm water).\n- Avoid cold drinks and direct exposure to smoke or dust.\n\n*Consult your doctor if fever exceeds 102°F or cough persists beyond 2 weeks.*`,
      hasRedFlag: false,
      model: "MediMitra Clinical AI",
      source: "clinical-engine"
    };
  }

  // General helpful medical greeting
  return {
    text: `Hello! I am **Dr. Mitra AI**, your clinical intake and health education assistant.\n\nI can assist you with:\n- **Symptom Clarification**: Helping you structure your concerns (duration, severity, triggers) before seeing your doctor.\n- **Preparation for Consultation**: Suggesting relevant questions to ask your healthcare provider.\n- **Medication & Lifestyle Guidance**: General information on healthy recovery and hygiene.\n- **Multilingual Assistance**: Communicate comfortably in English or Hindi.\n\n*How can I help you today? Please describe what you are experiencing.*`,
    hasRedFlag: false,
    model: "MediMitra Clinical AI",
    source: "clinical-engine"
  };
}
