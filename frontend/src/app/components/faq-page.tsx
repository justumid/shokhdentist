import React, { useState, useEffect } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUp } from "@phosphor-icons/react/dist/csr/CaretUp";
import { Question } from "@phosphor-icons/react/dist/csr/Question";
import { FaqItem } from "./faq-data";

interface FaqPageProps {
  onBack: () => void;
}

export function FaqPage({ onBack }: FaqPageProps) {
  const [faqData, setFaqData] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faq`);
        const data = await response.json();
        setFaqData(data.faq || []);
        if (data.faq && data.faq.length > 0) {
          setOpenId(data.faq[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch FAQ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQ();
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (loading) {
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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ fontSize: 14, color: "#6B8099" }}>Yuklanmoqda...</div>
      </div>
    );
  }

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
      <style>{`@keyframes slideInRight{from{transform:translateX(30px);opacity:0;}to{transform:translateX(0);opacity:1;}}`}</style>

      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "#C8D8E8",
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
            border: "none",
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>
          Ko'p beriladigan savollar
        </div>
      </div>

      {/* Scrollable body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Page title */}
        <div
          style={{
            padding: "24px 20px",
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              marginBottom: 6,
            }}
          >
            FAQ
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#6B8099",
              lineHeight: 1.6,
            }}
          >
            {faqData.length} ta eng ko'p so'raladigan savollar
          </p>
        </div>

        {/* FAQ list */}
        <div
          style={{
            padding: "0px 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {faqData.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                style={{
                  background: "white",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: isOpen ? "#1FA89A" : "#C8D8E8",
                  borderRadius: 14,
                  overflow: "hidden",
                  transition: "border-color 0.2s ease",
                }}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "15px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: "left",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: isOpen
                        ? "#E0F5F3"
                        : "#EEF7F9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.2s ease",
                    }}
                  >
                    <Question
                      size={15}
                      weight="duotone"
                      color={isOpen ? "#1FA89A" : "#6B8099"}
                    />
                  </div>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0E2A4A",
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <CaretUp
                      size={16}
                      weight="bold"
                      color="#1FA89A"
                    />
                  ) : (
                    <CaretDown
                      size={16}
                      weight="bold"
                      color="#9BB0C4"
                    />
                  )}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: "0 16px 16px 56px",
                      fontSize: 13.5,
                      color: "#5A7A96",
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}