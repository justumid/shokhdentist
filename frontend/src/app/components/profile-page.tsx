import React from "react";
import { User } from "@phosphor-icons/react/dist/csr/User";
import { FirstAid } from "@phosphor-icons/react/dist/csr/FirstAid";
import { Tooth } from "@phosphor-icons/react/dist/csr/Tooth";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { NotePencil } from "@phosphor-icons/react/dist/csr/NotePencil";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { GearSix } from "@phosphor-icons/react/dist/csr/GearSix";
import {
  PatientState,
  PROFILE_SECTIONS,
  sectionPct,
  profilePct,
  sectionStatus,
} from "./use-patient-state";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  user: User,
  firstAid: FirstAid,
  tooth: Tooth,
  clipboard: ClipboardText,
  notePencil: NotePencil,
};

interface ProfilePageProps {
  state: PatientState;
  onOpenSection: (id: string) => void;
  onNavigateToAdmin?: () => void;
}

export function ProfilePage({
  state,
  onOpenSection,
  onNavigateToAdmin,
}: ProfilePageProps) {
  const p = profilePct(state);
  const name = state.fullName || "Azizbek Sobirov";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: "#0E2A4A",
          padding: "28px 20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: p === 100
                ? "linear-gradient(135deg, rgba(37,196,180,0.2), rgba(31,168,154,0.3))"
                : "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              border: p === 100 ? "2px solid rgba(37,196,180,0.3)" : "none",
            }}
          >
            <Tooth size={28} weight="duotone" color={p === 100 ? "#25C4B4" : "white"} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "white",
                lineHeight: 1.2,
              }}
            >
              {name}
            </div>
            {p === 100 ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 6,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: "rgba(37,196,180,0.15)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#25C4B4",
                }}
              >
                <CheckCircle size={14} weight="fill" color="#25C4B4" />
                Tasdiqlangan profil
              </div>
            ) : (
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.55)",
                  marginTop: 4,
                }}
              >
                Profilingizni to'ldiring
              </div>
            )}
          </div>
        </div>
        {p < 100 && (
          <>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                borderRadius: 4,
                height: 5,
                overflow: "hidden",
                marginBottom: 6,
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg,#25C4B4,#A8D8D2)",
                  borderRadius: 4,
                  width: `${p}%`,
                  transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {p}% to'ldirilgan
            </div>
          </>
        )}
      </div>

      {/* Sections */}
      <div style={{ padding: "16px 20px 80px" }}>
        {PROFILE_SECTIONS.map((s) => {
          const st = sectionStatus(state, s.id);
          const pc = sectionPct(state, s.id);
          const txt =
            st === "done"
              ? "To'ldirilgan"
              : st === "partial"
                ? "Davom etish"
                : "To'ldirilmagan";
          const statusColor =
            st === "done"
              ? "#2D8A4B"
              : st === "partial"
                ? "#A07A1A"
                : "#6B8099";
          const iconBg =
            st === "done"
              ? "#EAF7EE"
              : st === "partial"
                ? "#FEF9EC"
                : "#E0F5F3";
          const iconColor =
            st === "done"
              ? "#2D8A4B"
              : st === "partial"
                ? "#A07A1A"
                : "#1FA89A";

          const Icon = ICON_MAP[s.iconId] || User;

          return (
            <div
              key={s.id}
              onClick={() => onOpenSection(s.id)}
              style={{
                background: "white",
                border: "1.5px solid #C8D8E8",
                borderRadius: 14,
                marginBottom: 12,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: iconBg,
                  }}
                >
                  <Icon
                    size={20}
                    weight="duotone"
                    color={iconColor}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 2,
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: statusColor,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {st === "done" && (
                      <CheckCircle
                        size={14}
                        weight="fill"
                        color="#2D8A4B"
                      />
                    )}
                    {txt}
                  </div>
                </div>
                <CaretRight size={16} color="#6B8099" />
              </div>
              {pc > 0 && (
                <div
                  style={{
                    height: 3,
                    background: "#C8D8E8",
                    margin: "0 16px 14px",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      background:
                        pc === 100 ? "#25C4B4" : "#C9A84C",
                      width: `${pc}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {onNavigateToAdmin && (
          <div
            onClick={onNavigateToAdmin}
            style={{
              background: "#0E2A4A",
              borderRadius: 14,
              marginTop: 8,
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: "rgba(255,255,255,0.12)",
              }}
            >
              <GearSix size={20} weight="duotone" color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                Admin panelga o'tish
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Boshqaruv paneli
              </div>
            </div>
            <CaretRight size={16} color="rgba(255,255,255,0.5)" />
          </div>
        )}
      </div>
    </div>
  );
}