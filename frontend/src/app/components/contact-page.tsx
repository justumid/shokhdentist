import React, { useState, useEffect } from "react";
import { Headphones } from "@phosphor-icons/react/dist/csr/Headphones";
import { Stethoscope } from "@phosphor-icons/react/dist/csr/Stethoscope";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { TelegramLogo } from "@phosphor-icons/react/dist/csr/TelegramLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { FacebookLogo } from "@phosphor-icons/react/dist/csr/FacebookLogo";
import { XLogo } from "@phosphor-icons/react/dist/csr/XLogo";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { BuildingOffice } from "@phosphor-icons/react/dist/csr/BuildingOffice";

// Icon mapping
const iconMap: Record<string, React.ElementType> = {
  headphones: Headphones,
  stethoscope: Stethoscope,
  "building-office": BuildingOffice,
  "map-pin": MapPin,
  "telegram-logo": TelegramLogo,
  "instagram-logo": InstagramLogo,
  "facebook-logo": FacebookLogo,
  "x-logo": XLogo,
};

interface ContactItem {
  id: string;
  icon: string;
  label: string;
  value: string;
  href: string;
}

interface SocialItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  bg: string;
  color: string;
}

interface Settings {
  working_hours?: string;
  working_days?: string;
}

export function ContactPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/contact`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/social`).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/settings`).then(res => res.json())
    ])
      .then(([contactData, socialData, settingsData]) => {
        setContacts(contactData.contacts || []);
        setSocials(socialData.social || []);
        setSettings(settingsData || {});
      })
      .catch(error => console.error("Failed to fetch contact data:", error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 20, textAlign: "center" }}>Yuklanmoqda...</div>;
  }

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        paddingBottom: "8px",
      }}
    >
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
          Aloqa
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Biz bilan bog'laning — savollaringizga javob beramiz
        </p>
      </div>

      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {contacts.map((c) => {
          const Icon = iconMap[c.icon] || Headphones;
          return (
            <a
              key={c.id}
              href={c.href}
              target={
                c.href.startsWith("http") ? "_blank" : undefined
              }
              rel="noopener noreferrer"
              style={{
                background: "white",
                border: "1.5px solid #C8D8E8",
                borderRadius: 14,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                textDecoration: "none",
                color: "#0E2A4A",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "#E0F5F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={22}
                  weight="duotone"
                  color="#1FA89A"
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "#6B8099",
                    fontWeight: 500,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {c.label}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    marginTop: 2,
                  }}
                >
                  {c.value}
                </div>
              </div>
            </a>
          );
        })}

        {/* Work hours */}
        <div
          style={{
            background: "white",
            border: "1.5px solid #C8D8E8",
            borderRadius: 14,
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "#E0F5F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Clock size={22} weight="duotone" color="#1FA89A" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                fontWeight: 500,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Ish vaqti
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {settings.working_days || "Dush–Shan"}, {settings.working_hours || "9:00–19:00"}
            </div>
          </div>
        </div>

        {/* Social links */}
        <div
          style={{
            background: "white",
            border: "1.5px solid #C8D8E8",
            borderRadius: 14,
            padding: "18px",
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
            Ijtimoiy tarmoqlar
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
            }}
          >
            {socials.map((s) => {
              const Icon = iconMap[s.icon] || TelegramLogo;
              return (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: s.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <Icon
                    size={24}
                    weight="fill"
                    color={s.color}
                  />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map placeholder */}
      <div
        style={{
          margin: "0 20px 20px",
          borderRadius: 14,
          overflow: "hidden",
          border: "1.5px solid #C8D8E8",
          height: 200,
        }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d620.2077699168013!2d69.24404140550956!3d41.30743493748931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b4b7d73180b%3A0x712eab1fdc5cb2fd!2sShokh%20dentist%20clinic!5e0!3m2!1sen!2s!4v1773006921345!5m2!1sen!2s"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Shokh Dentist Clinic xaritasi"
        />
      </div>
    </div>
  );
}