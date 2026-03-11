import React from "react";
import { Headphones } from "@phosphor-icons/react/dist/csr/Headphones";
import { Stethoscope } from "@phosphor-icons/react/dist/csr/Stethoscope";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { TelegramLogo } from "@phosphor-icons/react/dist/csr/TelegramLogo";
import { InstagramLogo } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { FacebookLogo } from "@phosphor-icons/react/dist/csr/FacebookLogo";
import { XLogo } from "@phosphor-icons/react/dist/csr/XLogo";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { BuildingOffice } from "@phosphor-icons/react/dist/csr/BuildingOffice";

export function ContactPage() {
  const contacts = [
    {
      icon: Headphones,
      label: "Telefon raqam",
      value: "+998 95 227 77 22",
      href: "tel:+998952277722",
    },
    {
      icon: Stethoscope,
      label: "Telegram (Shifokor)",
      value: "@shokh_dentist",
      href: "https://t.me/shokh_dentist",
    },
    {
      icon: BuildingOffice,
      label: "Manzil",
      value: "Furqat ko'chasi 11a, Tashkent",
      href: "https://maps.app.goo.gl/hE3doVgDdWxRNkqKA",
    },
  ];

  const socials = [
    {
      icon: TelegramLogo,
      label: "Telegram",
      href: "https://t.me/shokhdentist",
      bg: "#E8F4FD",
      color: "#0088cc",
    },
    {
      icon: InstagramLogo,
      label: "Instagram",
      href: "https://instagram.com/shokhdentist",
      bg: "#FDE8F0",
      color: "#E1306C",
    },
    {
      icon: FacebookLogo,
      label: "Facebook",
      href: "https://facebook.com/shokhdentist",
      bg: "#E8EDF8",
      color: "#1877F2",
    },
    {
      icon: XLogo,
      label: "Twitter",
      href: "https://twitter.com/shokhdentist",
      bg: "#E8F0F8",
      color: "#14171A",
    },
  ];

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
          const Icon = c.icon;
          return (
            <a
              key={c.value}
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
              Dush–Shan, 9:00–19:00
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
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
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