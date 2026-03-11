import React from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { Warning } from "@phosphor-icons/react/dist/csr/Warning";
import { Smiley } from "@phosphor-icons/react/dist/csr/Smiley";
import { Key } from "@phosphor-icons/react/dist/csr/Key";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { FirstAidKit } from "@phosphor-icons/react/dist/csr/FirstAidKit";
import { DownloadSimple } from "@phosphor-icons/react/dist/csr/DownloadSimple";

interface ProgramConditionsPageProps {
  onBack: () => void;
  onNavigateToAppointments?: () => void;
}

const programConditions = [
  "Bemor har 6 oyda bir marta profilaktik ko'rikdan o'tishi kerak.",
  "Ko'rik vaqtida aniqlangan kariyes yoki boshqa stomatologik muammolarni davolash tavsiya etiladi.",
  "Agar bemor tavsiya etilgan davolashni bajarsa, keyingi profilaktik professional klining bepul amalga oshiriladi.",
  "Agar aniqlangan kariyes davolanmasa, og'iz bo'shlig'ida bakterial muhit saqlanib qoladi va profilaktik klining samarasi kamayadi.",
  "Shu sababli ketma-ket ikki tashrif davomida kariyes va ayrim milkka zarar yetkazuvchi xizmatlar ketma-ketlikda davolanish reja qilinmagan bo'lsa, dastur imtiyozlari vaqtincha bekor qilinishi mumkin.",
  "Bunday holatda keyingi 6 oydan keyin 3-qatnov professional klining bepul amalga oshirilmaydi va bemor standart xizmat narxlari bo'yicha qabul qilinadi.",
];

export function ProgramConditionsPage({
  onBack,
  onNavigateToAppointments,
}: ProgramConditionsPageProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#F5F9FC",
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        color: "#0E2A4A",
        animation: "slideInRight 0.28s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          border: "none",
          borderBottom: "1px solid #C8D8E8",
          background: "#F5F9FC",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
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
        <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>
          Dastur shartlari
        </div>
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "20px 20px 40px",
        }}
      >
        {/* Conditions list */}
        <div
          style={{
            background: "white",
            border: "1.5px solid #C8D8E8",
            borderRadius: 16,
            padding: "20px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: "#6B8099",
              marginBottom: 16,
            }}
          >
            Shartlar
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {programConditions.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "14px 0",
                  borderBottom:
                    i < programConditions.length - 1
                      ? "1px solid #EEF3F7"
                      : "none",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: i < 3 ? "#E0F5F3" : "#FEF3E5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 700,
                    color: i < 3 ? "#1FA89A" : "#B8860B",
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: "#3A4F66",
                    lineHeight: 1.7,
                  }}
                >
                  {c}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinic purpose */}

        {/* Warning card */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #FFF8ED, #FEF3E5)",
            border: "1.5px solid #F0DDB8",
            borderRadius: 16,
            padding: "20px 18px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Key size={20} weight="duotone" color="#B8860B" />
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#7A5B00",
              }}
            >
              Erta aniqlash — kalit!
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#7A5B00",
              lineHeight: 1.7,
              marginBottom: 14,
            }}
          >
            Kariyes, gingivit (milk qonashi) va parodontit
            og'riqsiz kechadi. Ko'p bemorlar og'riganida keladi.
            Bu paytda esa:
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.7)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#C0392B",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#7A5B00" }}>
                Tish nervigacha zararlangan
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: "rgba(255,255,255,0.7)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#C0392B",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 13, color: "#7A5B00" }}>
                Davolash qimmat bo'ladi
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.85)",
              borderRadius: 12,
              border: "1px solid #E8D5A8",
            }}
          >
            <CheckCircle
              size={20}
              weight="fill"
              color="#1FA89A"
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#3A4F66",
                lineHeight: 1.5,
              }}
            >
              Har 6 oyda tekshiruv kasallikni erta aniqlashga
              yordam beradi.
            </span>
          </div>
        </div>

        {/* Dasturga yozilish button */}
        <button
          style={{
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, #1FA89A, #17997E)",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 8,
            boxShadow: "0 4px 14px rgba(31,168,154,0.3)",
          }}
        >
          <DownloadSimple size={20} weight="bold" />
          Shartlarni yuklab olish
        </button>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}