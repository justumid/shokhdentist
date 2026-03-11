import React, { useState } from "react";
import { Tooth } from "@phosphor-icons/react/dist/csr/Tooth";
import { Syringe } from "@phosphor-icons/react/dist/csr/Syringe";
import { Crown } from "@phosphor-icons/react/dist/csr/Crown";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { CaretUp } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";

interface Service {
  name: string;
  price: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  services: Service[];
}

const categories: Category[] = [
  {
    id: "terapevtik",
    icon: Tooth,
    iconColor: "#1FA89A",
    title: "Terapevtik stomatologiya",
    subtitle:
      "Karies davolash, plombalar va tish nervini davolash",
    services: [
      { name: "Konsultatsiya", price: "100 000" },
      { name: "Karies davolash", price: "200 000 dan" },
      { name: "Svet plomba (Germaniya)", price: "400 000" },
      {
        name: "Svet plomba (Yaponiya)",
        price: "500 000 – 600 000",
      },
      { name: "Svet plomba (AQSh)", price: "800 000" },
      { name: "Nerv davolash (1 kanal)", price: "400 000" },
      { name: "Nerv davolash (3 kanal)", price: "600 000" },
      { name: "Restavratsiya", price: "600 000 – 900 000" },
      { name: "Oqartirish", price: "3 000 000" },
    ],
  },
  {
    id: "jarrohlik",
    icon: Syringe,
    iconColor: "#1FA89A",
    title: "Jarrohlik stomatologiyasi",
    subtitle:
      "Tish sug'urish, implantatsiya va jarrohlik amaliyotlar",
    services: [
      { name: "Tish sug'urish", price: "300 000" },
      {
        name: "Murakkab sug'urish",
        price: "300 000 – 500 000",
      },
      {
        name: "Aql tishini olib tashlash",
        price: "400 000 – 600 000",
      },
      { name: "Retinatsiyalangan tish", price: "700 000" },
      { name: "Rezektsiya", price: "1 500 000" },
      { name: "Implant (Osstem) to'liq", price: "4 800 000" },
    ],
  },
  {
    id: "ortopedik",
    icon: Crown,
    iconColor: "#1FA89A",
    title: "Ortopedik stomatologiya",
    subtitle: "Koronkalar, protezlar va tish tiklash",
    services: [
      {
        name: "Metallokeramika koronka",
        price: "800 000 – 1 000 000",
      },
      {
        name: "Implantga koronka",
        price: "1 200 000 – 3 000 000",
      },
      {
        name: "Zirkon koronka (ZrO2)",
        price: "2 000 000 – 3 200 000",
      },
      { name: "Vaqtinchalik koronka", price: "300 000" },
      {
        name: "Qisman olinadigan protez",
        price: "2 000 000 – 3 500 000",
      },
      { name: "Byugel protez", price: "5 500 000" },
    ],
  },
  {
    id: "gigiyena",
    icon: Sparkle,
    iconColor: "#1FA89A",
    title: "Gigiyena va parvarish",
    subtitle:
      "Professional tozalash, polirovka va profilaktika",
    services: [
      { name: "Professional tozalash (UZ)", price: "400 000" },
      {
        name: "Professional tozalash (Airflow)",
        price: "600 000",
      },
      { name: "Polirovka", price: "100 000" },
      { name: "Ftorlak qoplash", price: "150 000" },
      { name: "Shinlash (6 tish)", price: "400 000" },
    ],
  },
];

export function ServicesPage() {
  const [openId, setOpenId] = useState<string | null>(
    "terapevtik",
  );

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
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
          Xizmatlar
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          4 kategoriya · 26 xil xizmat turi
        </p>
      </div>

      {/* Categories */}
      <div
        style={{
          padding: "16px 16px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isOpen = openId === cat.id;
          return (
            <div
              key={cat.id}
              style={{
                background: "white",
                borderRadius: 16,
                border: "1px solid #E8EFF5",
                overflow: "hidden",
              }}
            >
              {/* Category header */}
              <button
                onClick={() => toggle(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  width: "100%",
                  padding: "18px 18px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#F5F9FC",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    size={22}
                    weight="duotone"
                    color={cat.iconColor}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#0E2A4A",
                      marginBottom: 3,
                    }}
                  >
                    {cat.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B8099",
                      lineHeight: 1.4,
                    }}
                  >
                    {cat.subtitle}
                  </div>
                </div>
                <div
                  style={{ flexShrink: 0, color: "#6B8099" }}
                >
                  {isOpen ? (
                    <CaretUp size={18} weight="bold" />
                  ) : (
                    <CaretDown size={18} weight="bold" />
                  )}
                </div>
              </button>

              {/* Services list */}
              {isOpen && (
                <div
                  style={{
                    borderTop: "1px solid #E8EFF5",
                  }}
                >
                  {cat.services.map((svc, idx) => (
                    <div
                      key={svc.name}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 20px",
                        borderBottom:
                          idx < cat.services.length - 1
                            ? "1px dotted #D0DBE6"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13.5,
                          color: "#0E2A4A",
                        }}
                      >
                        {svc.name}
                      </span>
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          color: "#0E2A4A",
                          whiteSpace: "nowrap",
                          marginLeft: 12,
                        }}
                      >
                        {svc.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}