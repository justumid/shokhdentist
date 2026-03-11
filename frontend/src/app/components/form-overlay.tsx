import React, { useEffect, useRef, useCallback } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { Check } from "@phosphor-icons/react/dist/csr/Check";
import { PatientState, SECTIONS, sectionPct } from "./use-patient-state";
import { CalendarBlank } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";

export type OverlayMode = "single" | "wizard";

interface FormOverlayProps {
  sectionId: string;
  state: PatientState;
  onClose: () => void;
  onSave: (updates: Record<string, any>, isLast: boolean, nextId?: string) => void;
  mode?: OverlayMode;
  requestType?: string; // "free" | "paid"
}

function ToggleGroup({
  label,
  dataKey,
  value,
  onChange,
}: {
  label: string;
  dataKey: string;
  value?: boolean;
  onChange: (key: string, val: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>{label}</label>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onChange(dataKey, true)}
          style={{
            flex: 1,
            padding: "10px 8px",
            border: `1.5px solid ${value === true ? "#1FA89A" : "#C8D8E8"}`,
            borderRadius: 9,
            background: value === true ? "#E0F5F3" : "white",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5,
            color: value === true ? "#1FA89A" : "#6B8099",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Ha
        </button>
        <button
          type="button"
          onClick={() => onChange(dataKey, false)}
          style={{
            flex: 1,
            padding: "10px 8px",
            border: `1.5px solid ${value === false ? "#E8A09A" : "#C8D8E8"}`,
            borderRadius: 9,
            background: value === false ? "#FFF0EF" : "white",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13.5,
            color: value === false ? "#C0392B" : "#6B8099",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Yo'q
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  required,
  type = "text",
  dataKey,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  dataKey: string;
  placeholder?: string;
  value?: string;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>
        {label} {required && <span style={{ color: "#1FA89A" }}>*</span>}
      </label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(dataKey, e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1.5px solid #C8D8E8",
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#0E2A4A",
          background: "white",
          outline: "none",
          WebkitAppearance: "none",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#1FA89A")}
        onBlur={(e) => (e.target.style.borderColor = "#C8D8E8")}
      />
    </div>
  );
}

function TextArea({
  label,
  dataKey,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  dataKey: string;
  placeholder?: string;
  value?: string;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(dataKey, e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1.5px solid #C8D8E8",
          borderRadius: 10,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: "#0E2A4A",
          background: "white",
          outline: "none",
          resize: "vertical",
          minHeight: 80,
        }}
        onFocus={(e) => (e.target.style.borderColor = "#1FA89A")}
        onBlur={(e) => (e.target.style.borderColor = "#C8D8E8")}
      />
    </div>
  );
}

function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange: (key: string, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => (
          <label
            key={opt.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "10px 13px",
              border: `1.5px solid ${value === opt.value ? "#1FA89A" : "#C8D8E8"}`,
              borderRadius: 9,
              cursor: "pointer",
              fontSize: 13.5,
              background: value === opt.value ? "#E0F5F3" : "white",
            }}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(name, opt.value)}
              style={{ accentColor: "#1FA89A" }}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  groupKey,
  options,
  values,
  onChange,
}: {
  label: string;
  groupKey: string;
  options: { value: string; label: string }[];
  values?: string[];
  onChange: (key: string, val: string[]) => void;
}) {
  const currentValues = values || [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>{label}</label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => {
          const checked = currentValues.includes(opt.value);
          return (
            <label
              key={opt.value}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 13px",
                background: checked ? "#E0F5F3" : "#EEF7F9",
                border: `1.5px solid ${checked ? "#1FA89A" : "#C8D8E8"}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? currentValues.filter((v) => v !== opt.value)
                    : [...currentValues, opt.value];
                  onChange(groupKey, next);
                }}
                style={{ accentColor: "#1FA89A", marginTop: 3, flexShrink: 0 }}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// All possible wizard steps
const WIZARD_STEPS = ["personal", "medical", "dental", "consult", "consent"];

// Consult fields that reset each new request
const CONSULT_FIELDS = ["bleedDur", "bleedWhen", "brushFreq", "floss", "badBreath", "smoking", "complaint"];

function getWizardSteps(state: PatientState): string[] {
  const steps: string[] = [];
  for (const stepId of WIZARD_STEPS) {
    // consent and consult always show
    if (stepId === "consent" || stepId === "consult") {
      steps.push(stepId);
    } else if (sectionPct(state, stepId) < 100) {
      // profile steps: skip if already filled
      steps.push(stepId);
    }
  }
  return steps;
}

export function FormOverlay({
  sectionId,
  state,
  onClose,
  onSave,
  mode = "single",
  requestType,
}: FormOverlayProps) {
  const isWizard = mode === "wizard";
  const isProgramRequest = requestType === "paid";

  const wizardSteps = isWizard ? getWizardSteps(state) : [];
  const wizardIdx = isWizard ? wizardSteps.indexOf(sectionId) : -1;

  const section = SECTIONS.find((s) => s.id === sectionId);

  const isLast = isWizard
    ? wizardIdx === wizardSteps.length - 1
    : true;
  const nextId = isWizard ? wizardSteps[wizardIdx + 1] : undefined;
  const prevId = isWizard && wizardIdx > 0 ? wizardSteps[wizardIdx - 1] : undefined;

  const stepLabel = isWizard
    ? `${wizardIdx + 1} / ${wizardSteps.length}`
    : undefined;

  const progressPct = isWizard
    ? (wizardIdx / wizardSteps.length) * 100
    : 0;

  const localRef = useRef<Record<string, any>>({ ...state });

  useEffect(() => {
    if (isWizard && sectionId === "consult") {
      // Always start consult fresh
      const resetted = { ...state };
      for (const key of CONSULT_FIELDS) {
        delete resetted[key];
      }
      localRef.current = resetted;
    } else {
      localRef.current = { ...state };
    }
  }, [sectionId]);

  const [, forceUpdate] = React.useState(0);

  const handleChange = useCallback((key: string, val: any) => {
    localRef.current[key] = val;
    forceUpdate((n) => n + 1);
  }, []);

  const handleSave = () => {
    onSave(localRef.current, isLast, nextId);
  };

  const goBack = () => {
    if (prevId) {
      onSave(localRef.current, false, prevId);
    }
  };

  const d = localRef.current;

  const canSubmit =
    sectionId === "consent" && isProgramRequest
      ? !!d.programConsent
      : true;

  const renderForm = () => {
    switch (sectionId) {
      case "personal":
        return (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Shaxsiy ma'lumotlar
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 24 }}>
              Bir marta saqlanadi — keyingi safar avtomatik ishlatiladi.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <TextField label="Ism / Familiya" required dataKey="fullName" placeholder="Aliyev Jasur" value={d.fullName} onChange={handleChange} />
              <TextField label="Tug'ilgan sana" required type="date" dataKey="birthDate" value={d.birthDate} onChange={handleChange} />
              <TextField label="Telefon" required type="tel" dataKey="phone" placeholder="+998 90 000 00 00" value={d.phone} onChange={handleChange} />
              <TextField label="Email" type="email" dataKey="email" placeholder="email@example.com" value={d.email} onChange={handleChange} />
              <TextField label="Manzil" dataKey="address" placeholder="Shahar, ko'cha" value={d.address} onChange={handleChange} />
              <TextField label="Kasbi" dataKey="job" value={d.job} onChange={handleChange} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "#6B8099",
                  paddingBottom: 8,
                  borderBottom: "1px solid #C8D8E8",
                  marginTop: 6,
                }}
              >
                Favqulodda aloqa
              </div>
              <TextField label="Yaqin inson (ism)" dataKey="emergencyName" value={d.emergencyName} onChange={handleChange} />
              <TextField label="Telefon" type="tel" dataKey="emergencyPhone" value={d.emergencyPhone} onChange={handleChange} />
            </div>
          </>
        );

      case "medical":
        return (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Tibbiy tarix
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 24 }}>
              Quyidagi kasalliklardan biri bormi?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ToggleGroup label="Qandli diabet" dataKey="diabet" value={d.diabet} onChange={handleChange} />
              <ToggleGroup label="Yurak kasalligi" dataKey="heart" value={d.heart} onChange={handleChange} />
              <ToggleGroup label="Qon bosimi" dataKey="bp" value={d.bp} onChange={handleChange} />
              <TextField label="Allergiya" dataKey="allergy" placeholder="Masalan: penitsillinga" value={d.allergy} onChange={handleChange} />
              <TextField label="Doimiy dorilar" dataKey="meds" placeholder="Yo'q bo'lsa bo'sh qoldiring" value={d.meds} onChange={handleChange} />
              <TextField label="Homiladorlik" dataKey="pregnancy" placeholder="Ha / Yo'q / Muddat" value={d.pregnancy} onChange={handleChange} />
            </div>
          </>
        );

      case "dental":
        return (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Tish tarixi
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 24 }}>
              Tishlaringiz haqida qisqacha.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <RadioGroup
                label="Oxirgi stomatolog tashrifi"
                name="lastVisit"
                options={[
                  { value: "6oy", label: "6 oydan kam oldin" },
                  { value: "1yil", label: "1 yil oldin" },
                  { value: "2yil", label: "2+ yil oldin" },
                  { value: "hech", label: "Hech bormagan" },
                ]}
                value={d.lastVisit}
                onChange={handleChange}
              />
              <ToggleGroup label="Tish og'rig'i" dataKey="toothpain" value={d.toothpain} onChange={handleChange} />
              <ToggleGroup label="Milk qonashi" dataKey="gumbleed" value={d.gumbleed} onChange={handleChange} />
              <ToggleGroup label="Sezgirlik (issiq/sovuq)" dataKey="sensitivity" value={d.sensitivity} onChange={handleChange} />
              <ToggleGroup label="Bruksizm" dataKey="bruxism" value={d.bruxism} onChange={handleChange} />
              <TextArea label="Boshqa shikoyat" dataKey="otherComplaint" placeholder="Sizni bezovta qilayotgan narsa..." value={d.otherComplaint} onChange={handleChange} />
            </div>
          </>
        );

      case "consent":
        return isProgramRequest ? (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Roziliklar
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 24 }}>
              Iltimos, quyidagi shartlarni o'qib tasdiqlang.
            </p>

            {/* Rasmga olishga rozilik */}
            <div
              style={{
                background: "#EEF7F9",
                border: "1.5px solid #C8D8E8",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              <strong>Rasmga olishga rozilik:</strong>
              <ul style={{ margin: "8px 0 0 18px" }}>
                <li style={{ marginBottom: 3 }}>Tashxis va davolashni rejalashtirish</li>
                <li style={{ marginBottom: 3 }}>Davolash natijalarini hujjatlashtirish</li>
                <li>Faqat tibbiy maqsadda, maxfiy saqlanadi</li>
              </ul>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 13px",
                background: d.photoConsent ? "#E0F5F3" : "#EEF7F9",
                border: `1.5px solid ${d.photoConsent ? "#1FA89A" : "#C8D8E8"}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13.5,
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              <input
                type="checkbox"
                checked={d.photoConsent || false}
                onChange={(e) => handleChange("photoConsent", e.target.checked)}
                style={{ accentColor: "#1FA89A", marginTop: 3, flexShrink: 0 }}
              />
              <span>Rasmga olishga roziman</span>
            </label>

            {/* Dastur shartlariga rozilik */}
            <div
              style={{
                background: "#EEF7F9",
                border: "1.5px solid #C8D8E8",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              <strong>6 oylik profilaktik dastur:</strong>
              <ul style={{ margin: "8px 0 0 18px" }}>
                <li style={{ marginBottom: 3 }}>Har 6 oyda bir marta ko'rik</li>
                <li style={{ marginBottom: 3 }}>Kariyes davolansa — keyingi cleaning bepul</li>
                <li>Qabulni bekor qilish — 24 soat oldin</li>
              </ul>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 13px",
                background: d.programConsent ? "#E0F5F3" : "#EEF7F9",
                border: `1.5px solid ${d.programConsent ? "#1FA89A" : "#C8D8E8"}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={d.programConsent || false}
                onChange={(e) => handleChange("programConsent", e.target.checked)}
                style={{ accentColor: "#1FA89A", marginTop: 3, flexShrink: 0 }}
              />
              <span>Dastur shartlariga roziman <span style={{ color: "#1FA89A" }}>*</span></span>
            </label>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Sana va vaqt
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 24 }}>
              O'zingizga qulay sana va vaqtni tanlang.
            </p>

            {/* Date & Time pickers */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>
                  Sana <span style={{ color: "#1FA89A" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <CalendarBlank
                    size={18}
                    weight="regular"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6B8099",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="date"
                    value={d.preferredDate || ""}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => handleChange("preferredDate", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 38px",
                      border: "1.5px solid #C8D8E8",
                      borderRadius: 10,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: d.preferredDate ? "#0E2A4A" : "#6B8099",
                      background: "white",
                      outline: "none",
                      WebkitAppearance: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1FA89A")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8D8E8")}
                  />
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#0E2A4A" }}>
                  Vaqt <span style={{ color: "#1FA89A" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Clock
                    size={18}
                    weight="regular"
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#6B8099",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="time"
                    value={d.preferredTime || ""}
                    min="09:00"
                    max="18:00"
                    step={900}
                    onChange={(e) => handleChange("preferredTime", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 38px",
                      border: "1.5px solid #C8D8E8",
                      borderRadius: 10,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: d.preferredTime ? "#0E2A4A" : "#6B8099",
                      background: "white",
                      outline: "none",
                      WebkitAppearance: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#1FA89A")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8D8E8")}
                  />
                </div>
              </div>
            </div>

            {/* Rasmga olish ruxsat */}
            <div
              style={{
                background: "#EEF7F9",
                border: "1.5px solid #C8D8E8",
                borderRadius: 12,
                padding: 16,
                fontSize: 13,
                lineHeight: 1.7,
                marginBottom: 14,
              }}
            >
              <strong>Rasmga olish ruxsati:</strong>
              <ul style={{ margin: "8px 0 0 18px" }}>
                <li style={{ marginBottom: 3 }}>Tashxis va davolashni rejalashtirish</li>
                <li style={{ marginBottom: 3 }}>Davolash natijalarini hujjatlashtirish</li>
                <li>Faqat tibbiy maqsadda, maxfiy saqlanadi</li>
              </ul>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "11px 13px",
                background: d.photoConsent ? "#E0F5F3" : "#EEF7F9",
                border: `1.5px solid ${d.photoConsent ? "#1FA89A" : "#C8D8E8"}`,
                borderRadius: 10,
                cursor: "pointer",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={d.photoConsent || false}
                onChange={(e) => handleChange("photoConsent", e.target.checked)}
                style={{ accentColor: "#1FA89A", marginTop: 3, flexShrink: 0 }}
              />
              <span>Rasmga olishga roziman</span>
            </label>
          </>
        );

      case "consult":
        return (
          <>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 6 }}>
              Konsultatsiya
            </div>
            <p style={{ fontSize: 13, color: "#6B8099", lineHeight: 1.6, marginBottom: 16 }}>
              Shifokorga tez va to'g'ri tashxis qo'yishga yordam beradi.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <RadioGroup
                label="Kuniga necha marta tish yuvasiz?"
                name="brushFreq"
                options={[
                  { value: "1", label: "1 marta" },
                  { value: "2", label: "2 marta" },
                  { value: "0", label: "Yuvmayman" },
                ]}
                value={d.brushFreq}
                onChange={handleChange}
              />
              <RadioGroup
                label="Floss ishlatasizmi?"
                name="floss"
                options={[
                  { value: "harKuni", label: "Ha, Har kuni" },
                  { value: "bazida", label: "Ha, ba'zan" },
                  { value: "hech", label: "Ishlatmayman" },
                ]}
                value={d.floss}
                onChange={handleChange}
              />
              <ToggleGroup label="Og'izda yoqimsiz hid bormi?" dataKey="badBreath" value={d.badBreath} onChange={handleChange} />
              <ToggleGroup label="Chekasizmi?" dataKey="smoking" value={d.smoking} onChange={handleChange} />
              <ToggleGroup label="Milk qonaydimi?" dataKey="gumBleed" value={d.gumBleed} onChange={handleChange} />
              {d.gumBleed === true && (
                <>
                  <RadioGroup
                    label="Qachondan beri qonayapti?"
                    name="bleedDur"
                    options={[
                      { value: "1-2hafta", label: "1\u20132 hafta" },
                      { value: "1-3oy", label: "1\u20133 oy" },
                      { value: "nechaYil", label: "Bir necha yil" },
                    ]}
                    value={d.bleedDur}
                    onChange={handleChange}
                  />
                  <CheckboxGroup
                    label="Qonash qachon bo'ladi?"
                    groupKey="bleedWhen"
                    options={[
                      { value: "tishYuvganda", label: "Tish yuvganda" },
                      { value: "ovqatda", label: "Ovqat chaynaganda" },
                      { value: "oziOzidan", label: "O'zi-o'zidan" },
                      { value: "doimiy", label: "Doimiy" },
                    ]}
                    values={d.bleedWhen}
                    onChange={handleChange}
                  />
                </>
              )}
              <TextArea label="Asosiy shikoyat" dataKey="complaint" placeholder="Sizni bezovta qilayotgan narsa..." value={d.complaint} onChange={handleChange} />
            </div>
          </>
        );
    }
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
          border: "none",
          borderBottom: "1px solid #C8D8E8",
          background: "#F5F9FC",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
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
          {sectionId === "consent"
            ? isProgramRequest ? "Roziliklar" : "Sana va vaqt"
            : section?.title}
        </div>
        {stepLabel && (
          <div style={{ fontSize: 12, color: "#6B8099" }}>
            {stepLabel}
          </div>
        )}
      </div>

      {/* Progress (wizard mode only) */}
      {isWizard && (
        <div style={{ height: 2, background: "#C8D8E8", flexShrink: 0 }}>
          <div
            style={{
              height: "100%",
              background: "#1FA89A",
              width: `${progressPct}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px 20px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {renderForm()}
      </div>

      {/* Footer */}
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
          onClick={handleSave}
          disabled={!canSubmit}
          style={{
            width: "100%",
            padding: 14,
            background: canSubmit ? "#1FA89A" : "#B0C4C0",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.7,
            transition: "background 0.2s, opacity 0.2s",
          }}
        >
          {isLast ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Check size={18} weight="bold" /> {isWizard ? "Yuborish" : "Saqlash"}
            </span>
          ) : (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              Davom etish <ArrowLeft size={16} weight="bold" style={{ transform: "rotate(180deg)" }} />
            </span>
          )}
        </button>
        {prevId && (
          <button
            onClick={goBack}
            style={{
              width: "100%",
              padding: 12,
              background: "transparent",
              color: "#6B8099",
              border: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              cursor: "pointer",
              marginTop: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <ArrowLeft size={16} /> Orqaga
          </button>
        )}
      </div>
    </div>
  );
}
