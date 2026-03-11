import React, { useState, useCallback, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Smartphone } from "lucide-react";
import { TabBar } from "./components/tab-bar";
import { FormOverlay, OverlayMode } from "./components/form-overlay";
import { ProgramConditionsPage } from "./components/program-conditions-page";
import { FaqPage } from "./components/faq-page";
import { ReviewsPage } from "./components/reviews-page";
import { usePatientState, totalPct } from "./components/use-patient-state";

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

const routeToTab: Record<string, string> = {
  "/": "home",
  "/services": "services",
  "/appointment": "appt",
  "/contact": "contact",
  "/profile": "profile",
};

const tabToRoute: Record<string, string> = {
  home: "/",
  services: "/services",
  appt: "/appointment",
  contact: "/contact",
  profile: "/profile",
};

export default function Layout() {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 1024);
  const [overlaySection, setOverlaySection] = useState<string | null>(null);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("single");
  const [overlayRequestType, setOverlayRequestType] = useState<string | undefined>();
  const [showConditions, setShowConditions] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [slotPickerRequested, setSlotPickerRequested] = useState(false);
  const [slotPickerType, setSlotPickerType] = useState<"free" | "paid">("free");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const { state, mergeState } = usePatientState();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const showDot = totalPct(state) < 100;
  const activeTab = routeToTab[location.pathname] || "home";

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth > 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleTabChange = useCallback(
    (tab: string) => {
      navigate(tabToRoute[tab] || "/");
    },
    [navigate]
  );

  const handleOpenSection = useCallback((id: string) => {
    setOverlayMode("single");
    setOverlayRequestType(undefined);
    setOverlaySection(id);
  }, []);

  const startWizard = useCallback((reqType: string, firstStepId: string) => {
    setOverlayMode("wizard");
    setOverlayRequestType(reqType);
    setOverlaySection(firstStepId);
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
        justifyContent: "center",
        height: "100dvh",
        background: isDesktop ? "#E8EEF4" : "#F5F9FC",
      }}
    >
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        width: "100%",
        maxWidth: 480,
        fontFamily: "'DM Sans', sans-serif",
        background: "#F5F9FC",
        color: "#0E2A4A",
        overflow: "hidden",
        boxShadow: isDesktop ? "0 0 40px rgba(14,42,74,0.1)" : "none",
        transform: "translateZ(0)",
      }}
    >
      {/* View */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ minHeight: "100%", animation: "fadeIn 0.28s ease" }}>
          <Outlet
            context={{
              state,
              mergeState,
              onOpenSection: handleOpenSection,
              startWizard,
              onShowToast: showToast,
              onNavigate: handleTabChange,
              onShowConditions: () => setShowConditions(true),
              onShowFaq: () => setShowFaq(true),
              onShowReviews: () => setShowReviews(true),
              onStartAppointment: (type: "free" | "paid") => {
                setSlotPickerType(type);
                setSlotPickerRequested(true);
                navigate("/appointment");
              },
              slotPickerRequested,
              slotPickerType,
              clearSlotPickerRequest: () => setSlotPickerRequested(false),
            }}
          />
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
          mode={overlayMode}
          requestType={overlayRequestType}
        />
      )}

      {/* Program Conditions Page */}
      {showConditions && (
        <ProgramConditionsPage
          onBack={() => setShowConditions(false)}
          onNavigateToAppointments={() => {
            setShowConditions(false);
            navigate("/appointment");
          }}
        />
      )}

      {/* FAQ Page */}
      {showFaq && (
        <FaqPage onBack={() => setShowFaq(false)} />
      )}

      {/* Reviews Page */}
      {showReviews && (
        <ReviewsPage onBack={() => setShowReviews(false)} />
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
    </div>
  );
}
