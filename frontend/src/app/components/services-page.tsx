import React, { useState, useEffect } from "react";
import { Tooth } from "@phosphor-icons/react/dist/csr/Tooth";
import { Syringe } from "@phosphor-icons/react/dist/csr/Syringe";
import { Crown } from "@phosphor-icons/react/dist/csr/Crown";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { CaretUp } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";

interface Service {
  id?: string;
  name: string;
  price: string;
  description?: string;
}

interface Category {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  title: string;
  subtitle: string;
  services: Service[];
}

// Icon mapping for dynamic categories
const iconMap: Record<string, React.ElementType> = {
  tooth: Tooth,
  syringe: Syringe,
  crown: Crown,
  sparkle: Sparkle,
};

export function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        const apiCategories = (data.categories || []).map((cat: any) => ({
          id: cat.id,
          icon: iconMap[cat.icon] || Tooth,
          iconColor: "#1FA89A",
          title: cat.name,
          subtitle: cat.description || "",
          services: cat.services || []
        }));
        setCategories(apiCategories);
        if (apiCategories.length > 0) {
          setOpenId(apiCategories[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load services:", err);
        setLoading(false);
      });
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div style={{ 
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 20px",
        textAlign: "center",
        color: "#6B8099"
      }}>
        Yuklanmoqda...
      </div>
    );
  }

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