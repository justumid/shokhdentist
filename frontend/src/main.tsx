import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";
import Layout from "./app/Layout";
import HomeRoute from "./app/routes/home";
import ServicesRoute from "./app/routes/services";
import AppointmentRoute from "./app/routes/appointment";
import ContactRoute from "./app/routes/contact";
import ProfileRoute from "./app/routes/profile";
import AdminRoute from "./app/routes/admin";
import { api } from "./app/api/client";
import "./styles/index.css";

// Telegram Web App Blocker - show when not opened from Telegram
function TelegramBlocker() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        fontFamily: "'DM Sans', sans-serif",
        background: "linear-gradient(145deg, #E8F5E9 0%, #F1F8F2 30%, #F5F9FC 60%, #E0F2F1 100%)",
        color: "#0E2A4A",
        textAlign: "center",
        padding: 32,
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "linear-gradient(135deg, #43A047, #66BB6A)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 24px rgba(67, 160, 71, 0.25)",
        }}
      >
        <Smartphone size={36} color="#fff" strokeWidth={1.8} />
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
        Telegramdan oching
      </h1>
      <p style={{ fontSize: 15, color: "#5A7A9A", maxWidth: 360, lineHeight: 1.5 }}>
        Bu ilova faqat Telegram bot orqali ishlaydi. Iltimos, @YourDentalBot botini oching va "Veb ilova" tugmasini bosing.
      </p>
    </div>
  );
}

function AppWrapper() {
  const [isTelegram, setIsTelegram] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if running in Telegram Web App
    const checkTelegram = () => {
      const isInTelegram = api.isTelegramWebApp();
      setIsTelegram(isInTelegram);
      
      if (isInTelegram && (window as any).Telegram?.WebApp) {
        // Initialize Telegram Web App
        const tg = (window as any).Telegram.WebApp;
        tg.ready();
        tg.expand();
      }
    };
    
    checkTelegram();
  }, []);

  // Loading state
  if (isTelegram === null) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        background: "#F5F9FC"
      }}>
        <div style={{ fontSize: 14, color: "#5A7A9A" }}>Yuklanmoqda...</div>
      </div>
    );
  }

  // Not in Telegram - show blocker
  if (!isTelegram) {
    return <TelegramBlocker />;
  }

  // In Telegram - show app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin" element={<AdminRoute />} />
        <Route element={<Layout />}>
          <Route index element={<HomeRoute />} />
          <Route path="services" element={<ServicesRoute />} />
          <Route path="appointment" element={<AppointmentRoute />} />
          <Route path="contact" element={<ContactRoute />} />
          <Route path="profile" element={<ProfileRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")!).render(<AppWrapper />);
