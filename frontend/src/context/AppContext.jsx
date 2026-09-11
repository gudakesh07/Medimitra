import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../locales/translations";
import { api } from "../services/api";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("medimitra_lang") || "en");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("medimitra_lang", newLang);
  };

  useEffect(() => {
    const token = localStorage.getItem("medimitra_token");
    if (token) {
      api.getProfile()
        .then((userData) => {
          setUser(userData);
          if (userData.preferred_language) {
            changeLanguage(userData.preferred_language);
          }
        })
        .catch(() => {
          localStorage.removeItem("medimitra_token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (userData, token) => {
    localStorage.setItem("medimitra_token", token);
    setUser(userData);
    if (userData.preferred_language) {
      changeLanguage(userData.preferred_language);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("medimitra_token");
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        changeLanguage,
        t,
        user,
        setUser,
        loginUser,
        logoutUser,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
