import React, { useState, useCallback, useEffect } from "react";
import { Smartphone } from "lucide-react";
import { TabBar } from "./components/tab-bar";
import { HomePage } from "./components/home-page";
import { AppointmentPage } from "./components/appointment-page";
import { ContactPage } from "./components/contact-page";
import { ProfilePage } from "./components/profile-page";
import { ServicesPage } from "./components/services-page";
import { FormOverlay } from "./components/form-overlay";
import { ProgramConditionsPage } from "./components/program-conditions-page";
import { FaqPage } from "./components/faq-page";
import { AdminPanel } from "./components/admin-panel";
import { usePatientState, totalPct } from "./components/use-patient-state";
import { api } from "./api/client";

function DesktopBlocker() {
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
        Iltimos, telefon yoki planshetdan kiring
      </h1>
      <p style={{ fontSize: 15, color: "#5A7A9A", maxWidth: 360, lineHeight: 1.5 }}>
        Bu ilova faqat mobil qurilmalar uchun mo'ljallangan. Telefon yoki planshetingizdan foydalaning.
      </p>
    </div>
  );
}

export default function App() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 1024);
  const [activeTab, setActiveTab] = useState("home");
  const [overlaySection, setOverlaySection] = useState<string | null>(null);
  const [showConditions, setShowConditions] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const { state, mergeState } = usePatientState();

  const showDot = totalPct(state) < 100;

  // Initialize app and check admin status
  useEffect(() => {
    const initApp = async () => {
      try {
        const response = await api.init();
        if (response.success && response.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isDesktop) return <DesktopBlocker />;

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleOpenSection = useCallback((id: string) => {
    setOverlaySection(id);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setOverlaySection(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const handleFormSave = useCallback(
    (updates: Record<string, any>, isLast: boolean, nextId?: string) => {
      mergeState(updates);
      showToast("Saqlandi");
      if (isLast) {
        setOverlaySection(null);
      } else if (nextId) {
        setOverlaySection(nextId);
      }
    },
    [mergeState, showToast]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F9FC",
        color: "#0E2A4A",
        overflow: "hidden",
      }}
    >
      {/* View */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "smooth",
        }}
      >
        <div style={{ display: activeTab === "home" ? "block" : "none", minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <HomePage onNavigate={handleTabChange} onShowConditions={() => setShowConditions(true)} onShowFaq={() => setShowFaq(true)} startWizard={(requestType, firstStepId) => { setActiveTab("appt"); setOverlaySection(firstStepId); }} state={state} />
        </div>
        <div style={{ display: activeTab === "appt" ? "block" : "none", minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <AppointmentPage
            state={state}
            onOpenSection={handleOpenSection}
            onUpdateState={mergeState}
            onShowToast={showToast}
          />
        </div>
        <div style={{ display: activeTab === "contact" ? "block" : "none", minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <ContactPage />
        </div>
        <div style={{ display: activeTab === "profile" ? "block" : "none", minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <ProfilePage 
            state={state} 
            onOpenSection={handleOpenSection}
            onNavigateToAdmin={isAdmin ? () => setShowAdmin(true) : undefined}
          />
        </div>
        <div style={{ display: activeTab === "services" ? "block" : "none", minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <ServicesPage />
        </div>
      </div>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} showDot={showDot} />

      {/* Form Overlay */}
      {overlaySection && (
        <FormOverlay
          sectionId={overlaySection}
          state={state}
          onClose={handleCloseOverlay}
          onSave={handleFormSave}
        />
      )}

      {/* Program Conditions Page */}
      {showConditions && (
        <ProgramConditionsPage
          onBack={() => setShowConditions(false)}
          onNavigateToAppointments={() => {
            setShowConditions(false);
            setActiveTab("appt");
          }}
        />
      )}

      {/* FAQ Page */}
      {showFaq && (
        <FaqPage onBack={() => setShowFaq(false)} />
      )}

      {/* Admin Panel */}
      {showAdmin && isAdmin && (
        <AdminPanel onBack={() => setShowAdmin(false)} />
      )}

      {/* Toast */}
      <div
        style={{
          position: "fixed",
          bottom: 80,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#0E2A4A",
          color: "white",
          padding: "10px 20px",
          borderRadius: 20,
          fontSize: 13,
          zIndex: 999,
          opacity: toastVisible ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {toastMsg}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}