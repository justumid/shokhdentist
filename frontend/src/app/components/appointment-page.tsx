import React, { useState, useEffect } from "react";
import { Checks } from "@phosphor-icons/react/dist/csr/Checks";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { Warning } from "@phosphor-icons/react/dist/csr/Warning";
import { XCircle } from "@phosphor-icons/react/dist/csr/XCircle";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { DownloadSimple } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { CalendarCheck } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { Gift } from "@phosphor-icons/react/dist/csr/Gift";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { HourglassSimple } from "@phosphor-icons/react/dist/csr/HourglassSimple";
import { ChatCircleDots } from "@phosphor-icons/react/dist/csr/ChatCircleDots";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { CloudSun } from "@phosphor-icons/react/dist/csr/CloudSun";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import {
  PatientState,
  sectionPct,
  totalPct,
} from "./use-patient-state";
import {
  ensureSlotConfig,
  generateAvailableDates,
  getBookedSlotsForDate,
  isDayFull,
  isDayFrozen,
  SLOT_TIME_PERIODS,
  formatDateUz,
} from "./slot-config";

// Wizard steps — skip already-filled profile steps, always show consent + consult
const WIZARD_STEPS = ["personal", "medical", "dental", "consult", "consent"];

/* ===== SLOT PICKER DATA ===== */
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  sun: Sun,
  cloudSun: CloudSun,
  moon: Moon,
};

const TIME_PERIODS = SLOT_TIME_PERIODS.map((p) => ({
  ...p,
  icon: ICON_MAP[p.iconKey] || Sun,
}));

function getFirstWizardStep(state: PatientState): string {
  for (const stepId of WIZARD_STEPS) {
    if (stepId === "consent" || stepId === "consult") return stepId;
    if (sectionPct(state, stepId) < 100) return stepId;
  }
  return "consent";
}

interface AppointmentPageProps {
  state: PatientState;
  startWizard: (requestType: string, firstStepId: string) => void;
  onUpdateState: (updates: Partial<PatientState>) => void;
  onShowToast: (msg: string) => void;
  slotPickerRequested?: boolean;
  slotPickerType?: "free" | "paid";
  clearSlotPickerRequest?: () => void;
}

export function AppointmentPage({
  state,
  startWizard,
  slotPickerRequested,
  slotPickerType = "free",
  clearSlotPickerRequest,
}: AppointmentPageProps) {
  const p = totalPct(state);
  const [appointments, setAppointments] = useState<
    { id: number; type: string; complaint: string; date: string; time: string; status: "active" | "cancelled" }[]
  >([
    {
      id: 1,
      type: "Qabulga yozilish",
      complaint: "Tish og'riyapti, pastki chap tomonda",
      date: "2026-03-14",
      time: "10:00",
      status: "active",
    },
    {
      id: 2,
      type: "Dasturga qo'shilish",
      complaint: "Profilaktik tekshiruv",
      date: "2026-03-20",
      time: "14:00",
      status: "active",
    },
  ]);
  const [selectedAppt, setSelectedAppt] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [step, setStep] = useState<"idle" | "slot-picker">(
    slotPickerRequested && slotPickerType === "paid" ? "slot-picker" : "idle"
  );
  const [requestType, setRequestType] = useState<"free" | "paid">(slotPickerType);

  useEffect(() => {
    if (slotPickerRequested) {
      clearSlotPickerRequest?.();
      if (slotPickerType === "free") {
        const firstStep = getFirstWizardStep(state);
        startWizard("free", firstStep);
      } else {
        setRequestType(slotPickerType);
        setStep("slot-picker");
      }
    }
  }, [slotPickerRequested, slotPickerType, clearSlotPickerRequest, state, startWizard]);

  ensureSlotConfig();
  const AVAILABLE_DATES = generateAvailableDates().filter(
    (d) => !isDayFrozen(d.value) && !isDayFull(d.value)
  );

  const [selectedDate, setSelectedDate] = useState(AVAILABLE_DATES[0]?.value || "");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const bookedSlots = getBookedSlotsForDate(selectedDate);

  const startRequest = (type: "free" | "paid") => {
    setRequestType(type);
    if (type === "free") {
      const firstStep = getFirstWizardStep(state);
      startWizard(type, firstStep);
    } else {
      setStep("slot-picker");
    }
  };

  const confirmSlot = () => {
    if (!selectedTime) return;
    const firstStep = getFirstWizardStep(state);
    setStep("idle");
    startWizard(requestType, firstStep);
  };

  /* ===== APPOINTMENT DETAIL VIEW ===== */
  if (selectedAppt !== null) {
    const appt = appointments.find((a) => a.id === selectedAppt);
    if (!appt) {
      setSelectedAppt(null);
      return null;
    }

    // Check if cancellation is allowed (more than 24h before appointment)
    const apptDateTime = new Date(`${appt.date}T${appt.time}:00`);
    const now = new Date();
    const hoursUntil = (apptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    const canCancel = appt.status === "active" && hoursUntil > 24;

    const confirmCancel = () => {
      if (!cancelReason.trim()) return;
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appt.id ? { ...a, status: "cancelled" as const } : a,
        ),
      );
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedAppt(null);
    };

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#F5F9FC",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}`}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid #C8D8E8",
            background: "#F5F9FC",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setSelectedAppt(null)}
            style={{
              width: 34,
              height: 34,
              background: "#E0F5F3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              border: "none",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Qabul tafsilotlari</div>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px 100px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Status badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 20,
              background: appt.status === "active" ? "#E0F5F3" : "#FFEBEE",
              marginBottom: 16,
            }}
          >
            {appt.status === "active" ? (
              <Checks size={14} weight="duotone" color="#1FA89A" />
            ) : (
              <XCircle size={14} weight="duotone" color="#D32F2F" />
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: appt.status === "active" ? "#1FA89A" : "#D32F2F",
              }}
            >
              {appt.status === "active" ? "Faol" : "Bekor qilingan"}
            </span>
          </div>

          {/* Type */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "16px 18px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B8099",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Xizmat turi
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 600,
                color: "#0E2A4A",
              }}
            >
              {appt.type === "Dasturga qo'shilish" ? (
                <CalendarCheck size={18} weight="duotone" color="#1FA89A" />
              ) : (
                <ClipboardText size={18} weight="duotone" color="#1FA89A" />
              )}
              {appt.type}
            </div>
          </div>

          {/* Complaint */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "16px 18px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B8099",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Shikoyat
            </div>
            <div style={{ fontSize: 14, color: "#0E2A4A", lineHeight: 1.5 }}>
              {appt.complaint}
            </div>
          </div>

          {/* Date & Time */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "16px 18px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B8099",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Sana va vaqt
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 600,
                color: "#0E2A4A",
              }}
            >
              <CalendarCheck size={18} weight="duotone" color="#1FA89A" />
              {formatDateUz(appt.date)}, {appt.time}
            </div>
          </div>

          {/* Time remaining info */}
          {appt.status === "active" && (
            <div
              style={{
                background: hoursUntil <= 24 ? "#FFF8E1" : "#E0F5F3",
                borderRadius: 14,
                padding: "14px 18px",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: hoursUntil <= 24 ? "#FFE082" : "#B2E8E2",
              }}
            >
              <Clock size={18} weight="duotone" color={hoursUntil <= 24 ? "#B8860B" : "#1FA89A"} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0E2A4A" }}>
                  {hoursUntil > 0
                    ? `${Math.floor(hoursUntil)} soat qoldi`
                    : "Vaqt o'tgan"}
                </div>
                {hoursUntil <= 24 && hoursUntil > 0 && (
                  <div style={{ fontSize: 11, color: "#B8860B", marginTop: 2 }}>
                    24 soatdan kam qolgani uchun bekor qilib bo'lmaydi
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download anketa */}
          <button
            onClick={() => {
              const s = state;
              const content = `
SHOKH DENTIST — QABUL ANKETASI
================================
Bemor: ${s.fullName || "—"}
Telefon: ${s.phone || "—"}
Turi: ${appt.type}
Shikoyat: ${appt.complaint}
Sana: ${formatDateUz(appt.date)}
Vaqt: ${appt.time}
Holat: ${appt.status === "active" ? "Faol" : "Bekor qilingan"}
================================

SHAXSIY MA'LUMOTLAR
Tug'ilgan sana: ${s.birthDate || "—"}
Email: ${s.email || "—"}
Manzil: ${s.address || "—"}
Kasb: ${s.job || "—"}
Favqulodda aloqa: ${s.emergencyName || "—"} (${s.emergencyPhone || "—"})

TIBBIY TARIX
Diabet: ${s.diabet ? "Ha" : "Yo'q"}
Yurak: ${s.heart ? "Ha" : "Yo'q"}
Qon bosimi: ${s.bp ? "Ha" : "Yo'q"}
Allergiya: ${s.allergy || "Yo'q"}
Dorilar: ${s.meds || "Yo'q"}

TISH TARIXI
Tish og'rig'i: ${s.toothpain ? "Ha" : "Yo'q"}
Milk qonashi: ${s.gumbleed ? "Ha" : "Yo'q"}
Sezuvchanlik: ${s.sensitivity ? "Ha" : "Yo'q"}
Bruksizm: ${s.bruxism ? "Ha" : "Yo'q"}
Boshqa: ${s.otherComplaint || "Yo'q"}
              `.trim();
              const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `anketa_${(s.fullName || "bemor").replace(/\s/g, "_")}_${appt.id}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              width: "100%",
              padding: 14,
              background: "white",
              color: "#0E2A4A",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <DownloadSimple size={18} weight="bold" />
            Anketani yuklab olish
          </button>
        </div>

        {/* Bottom action */}
        {appt.status === "active" && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px 20px",
              paddingBottom: "max(16px, env(safe-area-inset-bottom))",
              background: "white",
              borderTop: "1px solid #C8D8E8",
            }}
          >
            <button
              disabled={!canCancel}
              onClick={() => { setCancelReason(""); setShowCancelModal(true); }}
              style={{
                width: "100%",
                padding: 14,
                background: canCancel ? "white" : "#F0F3F6",
                color: canCancel ? "#D32F2F" : "#9BB0C4",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: canCancel ? "#FFCDD2" : "#E4ECF2",
                borderRadius: 12,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 600,
                cursor: canCancel ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <XCircle size={18} weight="bold" />
              {canCancel ? "Qabulni bekor qilish" : "Bekor qilib bo'lmaydi"}
            </button>
          </div>
        )}

        {/* Cancel reason modal */}
        {showCancelModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(14,42,74,0.5)",
              zIndex: 300,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setShowCancelModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 480,
                background: "white",
                borderRadius: "20px 20px 0 0",
                padding: "24px 20px",
                paddingBottom: "max(24px, env(safe-area-inset-bottom))",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0E2A4A",
                  marginBottom: 6,
                }}
              >
                Bekor qilish sababi
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6B8099",
                  marginBottom: 16,
                }}
              >
                Iltimos, bekor qilish sababini yozing
              </div>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Masalan: Vaqtim to'g'ri kelmay qoldi..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "#0E2A4A",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 16,
                }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: "#F5F9FC",
                    color: "#6B8099",
                    border: "none",
                    borderRadius: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Orqaga
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={!cancelReason.trim()}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: !cancelReason.trim() ? "#E4ECF2" : "#D32F2F",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: !cancelReason.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === "slot-picker") {
    const dateObj = AVAILABLE_DATES.find((d) => d.value === selectedDate);
    const dateLabel = dateObj?.label || "";

    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#F5F9FC",
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          animation: "slideUp 0.3s ease",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`@keyframes slideUp{from{transform:translateY(30px);opacity:0;}to{transform:translateY(0);opacity:1;}}`}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid #C8D8E8",
            background: "#F5F9FC",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setStep("idle")}
            style={{
              width: 34,
              height: 34,
              background: "#E0F5F3",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              border: "none",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Vaqt tanlash</div>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 20px 20px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Date tabs */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#6B8099",
              marginBottom: 10,
            }}
          >
            Kunni tanlang
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 24,
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              paddingBottom: 2,
            }}
          >
            {AVAILABLE_DATES.map((d) => {
              const isActive = selectedDate === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => { setSelectedDate(d.value); setSelectedTime(null); }}
                  style={{
                    minWidth: 58,
                    padding: "10px 8px",
                    background: isActive ? "#1FA89A" : "white",
                    color: isActive ? "white" : "#0E2A4A",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: isActive ? "#1FA89A" : "#C8D8E8",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                    {d.label.split(" ")[0]}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      opacity: isActive ? 0.85 : 0.6,
                    }}
                  >
                    {d.weekday}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Time periods */}
          {TIME_PERIODS.map((period) => {
            const PeriodIcon = period.icon;
            return (
              <div key={period.label} style={{ marginBottom: 20 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <PeriodIcon size={16} weight="duotone" color="#6B8099" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#6B8099",
                    }}
                  >
                    {period.label}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#9BB0C4",
                      fontWeight: 500,
                    }}
                  >
                    {period.range}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {period.slots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: "12px 8px",
                          background: isBooked
                            ? "#F0F3F6"
                            : isSelected
                            ? "#1FA89A"
                            : "white",
                          color: isBooked
                            ? "#9BB0C4"
                            : isSelected
                            ? "white"
                            : "#0E2A4A",
                          borderWidth: 1.5,
                          borderStyle: "solid",
                          borderColor: isBooked
                            ? "#E4ECF2"
                            : isSelected
                            ? "#1FA89A"
                            : "#C8D8E8",
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "'DM Sans', sans-serif",
                          cursor: isBooked ? "not-allowed" : "pointer",
                          textDecoration: isBooked ? "line-through" : "none",
                          transition: "all 0.2s ease",
                          opacity: isBooked ? 0.6 : 1,
                        }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Selected summary */}
          {selectedTime && (
            <div
              style={{
                background: "#E0F5F3",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#B2E8E2",
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <CalendarCheck size={22} weight="duotone" color="#1FA89A" />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6B8099",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  Tanlangan vaqt
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0E2A4A",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {dateLabel}, {selectedTime}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed footer */}
        <div
          style={{
            padding: "14px 20px",
            paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
            borderTop: "1px solid #C8D8E8",
            background: "#F5F9FC",
            flexShrink: 0,
          }}
        >
          <button
            onClick={confirmSlot}
            disabled={!selectedTime}
            style={{
              width: "100%",
              padding: 14,
              background: !selectedTime ? "#C8D8E8" : "#1FA89A",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: !selectedTime ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s ease",
              boxShadow: selectedTime
                ? "0 4px 14px rgba(31,168,154,0.25)"
                : "none",
            }}
          >
            Tasdiqlash
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  if (appointments.length > 0) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div
          style={{
            background: "#0E2A4A",
            padding: "28px 20px 24px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 24,
              color: "white",
              marginBottom: 6,
            }}
          >
            Qabul bo'limi
          </h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
            Tez va qulay usul bilan qabulga yoziling.
          </p>
        </div>
        <div style={{ padding: "16px 20px 24px" }}>
          {appointments.map((req) => {
            const isCancelled = req.status === "cancelled";
            return (
              <div
                key={req.id}
                onClick={() => setSelectedAppt(req.id)}
                style={{
                  background: "white",
                  border: "1.5px solid #C8D8E8",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 12,
                  cursor: "pointer",
                  opacity: isCancelled ? 0.6 : 1,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: isCancelled ? "#FFEBEE" : "#E0F5F3",
                    marginBottom: 12,
                  }}
                >
                  {isCancelled ? (
                    <XCircle size={14} weight="duotone" color="#D32F2F" />
                  ) : (
                    <Checks size={14} weight="duotone" color="#1FA89A" />
                  )}
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isCancelled ? "#D32F2F" : "#1FA89A",
                    }}
                  >
                    {isCancelled ? "Bekor qilingan" : "Faol"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#0E2A4A",
                    marginBottom: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {req.type === "Dasturga qo'shilish" ? (
                    <CalendarCheck size={18} weight="duotone" color="#1FA89A" />
                  ) : (
                    <ClipboardText size={18} weight="duotone" color="#1FA89A" />
                  )}
                  {req.type}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "#6B8099",
                    lineHeight: 1.5,
                    marginBottom: 10,
                  }}
                >
                  {req.complaint}
                </div>
                <div style={{ fontSize: 12, color: "#9BB0C4" }}>
                  {formatDateUz(req.date)}, {req.time}
                </div>
              </div>
            );
          })}
          <button
            onClick={() => startRequest("free")}
            style={{
              width: "100%",
              padding: 14,
              background: "#1FA89A",
              color: "white",
              border: "none",
              borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            Yangi so'rov <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        style={{
          background: "#0E2A4A",
          padding: "28px 20px 24px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            color: "white",
            marginBottom: 6,
          }}
        >
          Qabul bo'limi
        </h2>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)" }}>
          Tez va qulay usul bilan qabulga yoziling.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "40px 24px",
          textAlign: "center",
          height: "78vh",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #E0F5F3 0%, #C2EBE7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 4px 16px rgba(31,168,154,0.15)",
            }}
          >
            <CalendarCheck
              size={42}
              weight="duotone"
              color="#1FA89A"
            />
          </div>
          <div
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 18,
              fontWeight: 600,
              color: "#0E2A4A",
              marginBottom: 10,
              lineHeight: 1.4,
            }}
          >
            Hali qabul so'rovi yo'q
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: "#6B8099",
              lineHeight: 1.6,
              marginBottom: 32,
              maxWidth: 280,
            }}
          >
            Birinchi qabulingizga 3 daqiqa ichida yoziling
          </div>

          {/* Secondary CTA — Regular appointment */}
          <button
            onClick={() => startRequest("free")}
            style={{
              width: "100%",
              padding: "15px 18px",
              background:
                "linear-gradient(135deg, #1FA89A 0%, #17917E 100%)",
              color: "white",
              border: "none",
              borderRadius: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 14px rgba(31,168,154,0.25)",
            }}
          >
            <ClipboardText size={20} weight="duotone" />
            Qabulga yozilish
          </button>

          {/* Primary CTA  Free program */}
          <button
            onClick={() => startRequest("paid")}
            style={{
              width: "100%",
              padding: "14px 18px",
              background: "white",
              color: "#0E2A4A",
              border: "1.5px solid #C8D8E8",
              borderRadius: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <CalendarCheck
              size={18}
              weight="duotone"
              color="#6B8099"
            />
            Dasturga qo'shilish
          </button>
        </div>
      </div>
    </div>
  );
}