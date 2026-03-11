import React, { useState } from "react";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { Tooth } from "@phosphor-icons/react/dist/csr/Tooth";
import { Crown } from "@phosphor-icons/react/dist/csr/Crown";
import { Stethoscope } from "@phosphor-icons/react/dist/csr/Stethoscope";
import { ShieldCheck } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { Desktop } from "@phosphor-icons/react/dist/csr/Desktop";
import { CalendarCheck } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { Timer } from "@phosphor-icons/react/dist/csr/Timer";
import { ArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { Syringe } from "@phosphor-icons/react/dist/csr/Syringe";
import { Star } from "@phosphor-icons/react/dist/csr/Star";
import { FirstAidKit } from "@phosphor-icons/react/dist/csr/FirstAidKit";
import { BookOpenText } from "@phosphor-icons/react/dist/csr/BookOpenText";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { Question } from "@phosphor-icons/react/dist/csr/Question";
import { CaretDown } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUp } from "@phosphor-icons/react/dist/csr/CaretUp";
import { PencilSimpleLine } from "@phosphor-icons/react/dist/csr/PencilSimpleLine";
import { Quotes } from "@phosphor-icons/react/dist/csr/Quotes";
import { Leaf } from "@phosphor-icons/react/dist/csr/Leaf";
import { X } from "@phosphor-icons/react/dist/csr/X";
import dentistImg from "../../assets/EBIBsg8XUAEi3qd.jpg";

import { FAQ_DATA } from "./faq-data";

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onShowConditions: () => void;
  onShowFaq: () => void;
  onShowReviews: () => void;
  onStartAppointment: (type: "free" | "paid") => void;
}

const PREVIEW_FAQ = FAQ_DATA.slice(0, 5);

const serviceCategories = [
  {
    icon: Tooth,
    title: "Terapevtik",
    subtitle: "9 ta xizmat",
    color: "#1FA89A",
  },
  {
    icon: Syringe,
    title: "Jarrohlik",
    subtitle: "6 ta xizmat",
    color: "#1FA89A",
  },
  {
    icon: Crown,
    title: "Ortopedik",
    subtitle: "6 ta xizmat",
    color: "#1FA89A",
  },
  {
    icon: Leaf,
    title: "Gigiyena",
    subtitle: "5 ta xizmat",
    color: "#1FA89A",
  },
];

const team = [
  {
    gender: "male",
    name: "Dr. Shakhbozbek",
    role: "Bosh shifokor",
    desc: "Stomatolog-terapevt \u00B7 8 yil tajriba",
    bg: "linear-gradient(135deg,#0E2A4A,#163859)",
  },
  {
    gender: "female",
    name: "Dr. Nilufar",
    role: "Ortodont",
    desc: "Breket va Invisalign \u00B7 5 yil tajriba",
    bg: "linear-gradient(135deg,#4A1B6B,#6B2490)",
  },
  {
    gender: "male",
    name: "Dr. Bobur",
    role: "Implantolog",
    desc: "Dental implant \u00B7 6 yil tajriba",
    bg: "linear-gradient(135deg,#1B4A6B,#1C6B9A)",
  },
  {
    gender: "female",
    name: "Dr. Zulfiya",
    role: "Parodontolog",
    desc: "Milk kasalliklari \u00B7 4 yil tajriba",
    bg: "linear-gradient(135deg,#1B6B3A,#25964F)",
  },
];

const programServices = [
  { icon: Stethoscope, text: "Bepul konsultatsiya" },
  { icon: Desktop, text: "Diagnostik rentgen (kerak bo'lsa)" },
  { icon: Tooth, text: "Professional tish tozalash" },
];

/* ===== REVIEWS ===== */
interface Review {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  text: string;
  date: string;
}

const REVIEW_TAGS = [
  "Mehribon shifokorlar",
  "Og'riqsiz davolash",
  "Toza va qulay muhit",
  "Sifatli xizmat",
  "Qulay narxlar",
  "Tez qabul",
];

const MOCK_REVIEWS: Review[] = [
  {
    id: "mock-1",
    name: "Aziza M.",
    rating: 5,
    tags: ["Mehribon shifokorlar", "Og'riqsiz davolash"],
    text: "Juda yaxshi klinika! Dr. Shakhbozbek juda e'tiborli va mehribon shifokor. Og'riqsiz davolashdi, hech qo'rqmadim.",
    date: "2026-02-15",
  },
  {
    id: "mock-2",
    name: "Sardor K.",
    rating: 5,
    tags: ["Sifatli xizmat", "Toza va qulay muhit"],
    text: "Professional tish tozalash qildirdim. Natija ajoyib, klinika juda toza va zamonaviy.",
    date: "2026-01-28",
  },
  {
    id: "mock-3",
    name: "Dilnoza R.",
    rating: 4,
    tags: ["Bolalar uchun yaxshi", "Mehribon shifokorlar"],
    text: "Bolalarimni olib bordim, shifokorlar juda yaxshi munosabatda bo'lishdi. Bolalar qo'rqishmadi.",
    date: "2026-03-02",
  },
];

const REVIEWS_STORAGE_KEY = "shokh_reviews";

function loadReviews(): Review[] {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Review[];
      return [...MOCK_REVIEWS, ...parsed];
    }
  } catch {}
  return [...MOCK_REVIEWS];
}

function saveReview(review: Review) {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    const existing: Review[] = stored ? JSON.parse(stored) : [];
    existing.push(review);
    localStorage.setItem(
      REVIEWS_STORAGE_KEY,
      JSON.stringify(existing),
    );
  } catch {}
}

export function HomePage({
  onNavigate,
  onShowConditions,
  onShowFaq,
  onShowReviews,
  onStartAppointment,
}: HomePageProps) {
  const [openFaqId, setOpenFaqId] = useState<number | null>(
    PREVIEW_FAQ[0]?.id ?? null,
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadReviews(),
  );
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTags, setReviewTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [hoverStar, setHoverStar] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const toggleReviewTag = (tag: string) => {
    setReviewTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  };

  const submitReview = () => {
    if (!reviewText.trim()) return;
    const newReview: Review = {
      id: `user-${Date.now()}`,
      name: isAnonymous ? "Anonim" : "Bemor",
      rating: reviewRating,
      tags: reviewTags,
      text: reviewText.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    saveReview(newReview);
    setReviews(loadReviews());
    setReviewName("");
    setReviewRating(5);
    setReviewTags([]);
    setReviewText("");
    setShowReviewForm(false);
    setIsAnonymous(false);
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hero */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0E2A4A 0%, #0a1a30 40%, #0d2847 100%)",
          padding: "36px 24px 48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Plus dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath fill='%23fff' fill-rule='evenodd' d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2zm0-30V0h-2v4h-4v2h4v4h2V6h4V4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2zM6 4V0H4v4H0v2h4v4h2V6h4V4z'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
            opacity: 0.03,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,0.12)",
            padding: "5px 12px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.5px",
            marginBottom: 20,
          }}
        >
          <span style={{ color: "#25C4B4", fontWeight: 700 }}>
            SHOKH
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            {"\u2022"}
          </span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>
            DENTIST
          </span>
        </div>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 32,
            color: "white",
            lineHeight: 1.2,
            marginBottom: 12,
            letterSpacing: "-0.3px",
            fontWeight: "600",
          }}
        >
          Sogʻlom tabassumingiz{" "}
          <span style={{ color: "#25C4B4" }}>
            bizning
          </span>{" "}
          gʻamxoʻrligimizda
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.65)",
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Zamonaviy uskunalar, ilg'or texnologiyalar va
          individual yondashuv.
        </p>
        <button
          onClick={() => onStartAppointment("free")}
          // style={{
          //   display: "inline-flex",
          //   alignItems: "center",
          //   gap: 8,
          //   background: "white",
          //   color: "#25C4B4",
          //   padding: "12px 22px",
          //   borderRadius: 50,
          //   fontSize: 14,
          //   fontWeight: 600,
          //   cursor: "pointer",
          //   border: "none",
          //   fontFamily: "'DM Sans', sans-serif",
          // }}
          style={{
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255, 255, 255)", // Semi-transparent
    backdropFilter: "blur(10px)",
    color: "#0B1E37", // Darker text for professional contrast
    padding: "10px 28px",
    borderRadius: 50,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    border: "2px solid #25C4B4", // Brand color used as an accent ring
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.3s ease",
  }}
        >
          Qabulga yozilish{" "}
          <ArrowRight size={16} weight="bold" />
        </button>
      </div>

      {/* ===== PROFILAKTIK DASTUR ===== */}
      <div style={{ padding: "24px 20px 0" }}>
        {/* Main program card */}
        <div
          style={{
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          {/* Dark navy top */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #0E2A4A 0%, #0a1a30 40%, #0d2847 100%)",
              padding: "28px 22px 24px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            {/* <div
              style={{
                position: "absolute",
                top: -40,
                right: -30,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "rgba(31,168,154,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(37,196,180,0.06)",
              }}
            /> */}

            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(31,168,154,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <FirstAidKit
                size={26}
                weight="duotone"
                color="#25C4B4"
              />
            </div>

            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: "white",
                lineHeight: 1.3,
                marginBottom: 8,
              }}
            >
              Profilaktik {" "}
              <span
                style={{
                  color: "#25C4B4",
                  
                }}
              >
                stomatologiya 
              </span>
              {" "}dasturi
            </div>

            <p
              style={{
                fontSize: 13.5,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.7,
                marginBottom: 0,
              }}
            >
              Har 6 oylik bepul profilaktik ko'rik dasturi —
              sog'lom tabassumingiz uchun!
            </p>
          </div>

          {/* White bottom — Included services */}
          <div
            style={{
              background: "white",
              border: "1.5px solid #C8D8E8",
              borderTop: "none",
              borderRadius: "0 0 18px 18px",
              padding: "20px 18px",
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
              Dastur tarkibi
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {programServices.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "#E0F5F3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={20}
                        weight="duotone"
                        color="#1FA89A"
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0E2A4A",
                      }}
                    >
                      {s.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dastur shartlari — subtle inline link */}
            <div
              onClick={onShowConditions}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 18,
                padding: "12px 14px",
                background: "#F5F9FC",
                borderRadius: 12,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "#E8EFF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BookOpenText
                  size={17}
                  weight="duotone"
                  color="#5A7A96"
                />
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: "#5A7A96",
                  fontWeight: 500,
                }}
              >
                Dastur shartlari bilan tanishish
              </span>
              <CaretRight
                size={14}
                weight="bold"
                color="#9BB0C4"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onStartAppointment("paid")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "14px",
            background: "#1FA89A",
            color: "white",
            border: "none",
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginBottom: 8,
          }}
        >
          <CalendarCheck size={20} weight="bold" />
          Dasturga qo'shilish
        </button>
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#6B8099",
            marginBottom: 8,
          }}
        >
          Shartlar bilan tanishgan holda bepul konsultatsiya
          oling
        </div>
      </div>

      {/* Service Categories */}
      <div style={{ padding: "24px 20px 0" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#6B8099",
            marginBottom: 14,
          }}
        >
          Xizmatlar
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: "0 20px 24px",
        }}
      >
        {serviceCategories.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.title}
              onClick={() => onNavigate("services")}
              style={{
                background: "white",
                border: "1.5px solid #C8D8E8",
                borderRadius: 14,
                padding: "16px 14px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <Icon
                  size={28}
                  weight="duotone"
                  color={sc.color}
                />
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {sc.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6B8099",
                  fontWeight: 500,
                }}
              >
                {sc.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Team */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "#6B8099",
            marginBottom: 14,
          }}
        >
          Jamoamiz
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          padding: "0 20px 24px",
        }}
      >
        {team.map((t) => (
          <div
            key={t.name}
            style={{
              background: "white",
              border: "1.5px solid #C8D8E8",
              borderRadius: 16,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: t.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
            >
              <Stethoscope
                size={28}
                weight="duotone"
                color="white"
              />
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 3,
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#1FA89A",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {t.role}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                lineHeight: 1.5,
              }}
            >
              {t.desc}
            </div>
          </div>
        ))}
      </div>
      {/* ===== REVIEWS ===== */}
      {/* ===== REVIEWS — WALL OF TRUST ===== */}
      <style>{`
        .review-card-hover { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .review-card-hover:hover { transform: translateY(-3px) scale(1.015); box-shadow: 0 12px 32px rgba(14,42,74,0.12) !important; }
        @keyframes trustFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div style={{ padding: "0 0 24px", overflow: "hidden" }}>
        {/* Hero header with background image */}
        <div
          style={{
            position: "relative",
            background:
              "linear-gradient(135deg, #0E2A4A 0%, #0a1a30 50%, #0d2847 100%)",
            padding: "36px 24px 28px",
            overflow: "hidden",
          }}
        >
          {/* Faded background image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${dentistImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.75,
              pointerEvents: "none",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0)  0%, rgba(10,26,48,0.1) 15%, rgba(10,26,48,0.3) 30%, rgba(10,26,48,0.60) 60%, rgba(10,26,48,0.80) 90%, rgba(10,26,48,0.95) 100%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              paddingTop: "100px",
            }}
          >
            {/* Headline */}
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 28,
                color: "white",
                lineHeight: 1.25,
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: "-0.3px",
              }}
            >
              Bemorlarimiz{" "}
              <span
                style={{
                  color: "#25C4B4",
                }}
              >
                fikri
              </span>{" "}
            </h2>

            {/* Stats strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 6,
              }}
            >
              {/* Rating */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 36,
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {avgRating}
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        weight="fill"
                        color={
                          s <= Math.round(Number(avgRating))
                            ? "#F5A623"
                            : "rgba(255,255,255,0.25)"
                        }
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: 500,
                    }}
                  >
                    {reviews.length}+ fikrlar asosida
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div
                style={{
                  width: 1,
                  height: 32,
                  background: "rgba(255,255,255,0.12)",
                }}
              />

              {/* Stacked avatars */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {reviews.slice(0, 4).map((r, i) => {
                  const gradients = [
                    "linear-gradient(135deg, #1FA89A, #25C4B4)",
                    "linear-gradient(135deg, #1976D2, #42A5F5)",
                    "linear-gradient(135deg, #7B61FF, #A78BFA)",
                    "linear-gradient(135deg, #F5A623, #FFC857)",
                  ];
                  return (
                    <div
                      key={r.id}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background:
                          gradients[i % gradients.length],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 12,
                        fontWeight: 700,
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderColor: "#0E2A4A",
                        marginLeft: i > 0 ? -8 : 0,
                        position: "relative",
                        zIndex: 4 - i,
                      }}
                    >
                      {r.name.charAt(0)}
                    </div>
                  );
                })}
                {reviews.length > 4 && (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 10,
                      fontWeight: 700,
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: "#0E2A4A",
                      marginLeft: -8,
                    }}
                  >
                    +{reviews.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews content area */}
        <div style={{ padding: "0 20px" }}>
          {/* Featured review — large prominent card */}
          {reviews.length > 0 &&
            (() => {
              const featured = reviews[0];
              return (
                <div
                  className="review-card-hover"
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: "24px 22px",
                    marginTop: -22,
                    position: "relative",
                    zIndex: 2,
                    boxShadow: "0 8px 32px rgba(14,42,74,0.1)",
                    animation: "trustFadeIn 0.5s ease",
                  }}
                >
                  <Quotes
                    size={32}
                    weight="fill"
                    color="#E0F5F3"
                    style={{
                      position: "absolute",
                      top: 18,
                      right: 20,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #1FA89A, #25C4B4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 17,
                        fontWeight: 700,
                        boxShadow:
                          "0 4px 12px rgba(31,168,154,0.3)",
                      }}
                    >
                      {featured.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0E2A4A",
                        }}
                      >
                        {featured.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          marginTop: 3,
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            weight="fill"
                            color={
                              s <= featured.rating
                                ? "#F5A623"
                                : "#D5DFE9"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 16,
                      color: "#0E2A4A",
                      lineHeight: 1.65,
                      fontWeight: 500,
                      marginBottom: 14,
                    }}
                  >
                    &ldquo;{featured.text}&rdquo;
                  </div>

                  {/* Tags as underlined keywords */}
                  {featured.tags.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      {featured.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#1FA89A",
                            borderBottomWidth: 2,
                            borderBottomStyle: "solid",
                            borderBottomColor: "#B2E8E2",
                            paddingBottom: 2,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

          {/* Staggered grid of other reviews */}
          {reviews.length > 1 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 12,
              }}
            >
              {reviews.slice(1, 5).map((review, idx) => {
                const gradients = [
                  "linear-gradient(135deg, #1976D2, #42A5F5)",
                  "linear-gradient(135deg, #7B61FF, #A78BFA)",
                  "linear-gradient(135deg, #F5A623, #FFC857)",
                  "linear-gradient(135deg, #E57373, #EF9A9A)",
                ];
                return (
                  <div
                    key={review.id}
                    className="review-card-hover"
                    style={{
                      background: "white",
                      borderRadius: 16,
                      padding: "16px 14px",
                      boxShadow:
                        "0 2px 12px rgba(14,42,74,0.06)",
                      animation: `trustFadeIn 0.5s ease ${0.1 * (idx + 1)}s both`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background:
                            gradients[idx % gradients.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {review.name.charAt(0)}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0E2A4A",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {review.name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: 1,
                            marginTop: 2,
                          }}
                        >
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={10}
                              weight="fill"
                              color={
                                s <= review.rating
                                  ? "#F5A623"
                                  : "#D5DFE9"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#5A7A96",
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical" as const,
                        overflow: "hidden",
                      }}
                    >
                      {review.text}
                    </div>

                    {/* Tag underline */}
                    {review.tags.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#1FA89A",
                            borderBottomWidth: 1.5,
                            borderBottomStyle: "solid",
                            borderBottomColor: "#B2E8E2",
                            paddingBottom: 1,
                          }}
                        >
                          {review.tags[0]}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom action bar */}
          <div
            style={{ marginTop: 16, display: "flex", gap: 10 }}
          >
            <button
              onClick={onShowReviews}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px",
                background: "white",
                color: "#5A7A96",
                boxShadow: "0 2px 8px rgba(14,42,74,0.06)",
                border: "none",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Barcha fikrlar
              <ArrowRight
                size={15}
                weight="bold"
                color="#9BB0C4"
              />
            </button>
            <button
              onClick={() => setShowReviewForm(true)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px",
                background:
                  "linear-gradient(135deg, #1FA89A, #17917E)",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 16px rgba(31,168,154,0.3)",
              }}
            >
              <PencilSimpleLine size={16} weight="bold" />
              Fikr yozish
            </button>
          </div>
        </div>
      </div>

      {/* ===== REVIEW FORM OVERLAY ===== */}
      {showReviewForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setShowReviewForm(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "20px 20px 0 0",
              width: "100%",
              maxWidth: 480,
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "24px 20px 32px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#0E2A4A",
                }}
              >
                Fikr qoldirish
              </div>
              <button
                onClick={() => setShowReviewForm(false)}
                style={{
                  background: "#F5F9FC",
                  border: "none",
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} weight="bold" color="#6B8099" />
              </button>
            </div>

            {/* Star rating */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Baholash
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onMouseEnter={() => setHoverStar(s)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setReviewRating(s)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 2,
                    }}
                  >
                    <Star
                      size={28}
                      weight="fill"
                      color={
                        s <= (hoverStar || reviewRating)
                          ? "#F5A623"
                          : "#D5DFE9"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Teglar (ixtiyoriy)
              </label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = reviewTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleReviewTag(tag)}
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: isSelected ? "white" : "#5A7A96",
                        background: isSelected
                          ? "#1FA89A"
                          : "#F5F9FC",
                        borderWidth: 1.5,
                        borderStyle: "solid",
                        borderColor: isSelected
                          ? "#1FA89A"
                          : "#C8D8E8",
                        borderRadius: 20,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Text */}
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Fikringiz
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tajribangiz haqida yozing..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Anonymous toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                padding: "12px 14px",
                background: isAnonymous ? "#E0F5F3" : "#F5F9FC",
                borderRadius: 12,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: isAnonymous
                  ? "#1FA89A"
                  : "#C8D8E8",
                transition: "all 0.2s ease",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isAnonymous ? "#1FA89A" : "#5A7A96",
                  transition: "color 0.2s ease",
                }}
              >
                Anonim fikr qoldirish
              </span>
              <button
                onClick={() => {
                  setIsAnonymous(!isAnonymous);
                  if (!isAnonymous) setReviewName("");
                }}
                style={{
                  position: "relative",
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  background: isAnonymous
                    ? "#1FA89A"
                    : "#C8D8E8",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: isAnonymous ? 22 : 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={submitReview}
              disabled={!reviewText.trim()}
              style={{
                width: "100%",
                padding: "14px",
                background: !reviewText.trim()
                  ? "#C8D8E8"
                  : "#1FA89A",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 600,
                cursor: !reviewText.trim()
                  ? "not-allowed"
                  : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "background 0.2s ease",
              }}
            >
              Yuborish
            </button>
          </div>
        </div>
      )}
      {/* FAQ */}
      <div style={{ padding: "0 20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: "#6B8099",
            }}
          >
            Ko'p beriladigan savollar
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {PREVIEW_FAQ.map((faq) => {
            const isOpen = openFaqId === faq.id;
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
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    padding: "14px 16px",
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
                      fontSize: 13.5,
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
                      padding: "0 16px 14px 56px",
                      fontSize: 13,
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

        {/* See all button */}
        <button
          onClick={onShowFaq}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "13px",
            background: "#EEF7F9",
            color: "#5A7A96",
            border: "1.5px solid #C8D8E8",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            marginTop: 10,
            marginBottom: 24,
          }}
        >
          Barcha savollarni ko'rish
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    </div>
  );
}