import React, { useState, useEffect } from "react";

/* Phosphor Icons — alphabetical */
import { ArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CalendarBlank } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { CalendarCheck } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight";
import { ChartBar } from "@phosphor-icons/react/dist/csr/ChartBar";
import { CheckCircle } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { Clock } from "@phosphor-icons/react/dist/csr/Clock";
import { CloudSun } from "@phosphor-icons/react/dist/csr/CloudSun";
import { Crown } from "@phosphor-icons/react/dist/csr/Crown";
import { DotsThree } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DownloadSimple } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { FirstAid } from "@phosphor-icons/react/dist/csr/FirstAid";
import { Funnel } from "@phosphor-icons/react/dist/csr/Funnel";
import { HourglassSimple } from "@phosphor-icons/react/dist/csr/HourglassSimple";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { Moon } from "@phosphor-icons/react/dist/csr/Moon";
import { Pencil } from "@phosphor-icons/react/dist/csr/Pencil";
import { Phone } from "@phosphor-icons/react/dist/csr/Phone";
import { Plus } from "@phosphor-icons/react/dist/csr/Plus";
import { Prohibit } from "@phosphor-icons/react/dist/csr/Prohibit";
import { Question } from "@phosphor-icons/react/dist/csr/Question";
import { Snowflake } from "@phosphor-icons/react/dist/csr/Snowflake";
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle";
import { SquaresFour } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { Star } from "@phosphor-icons/react/dist/csr/Star";
import { Stethoscope } from "@phosphor-icons/react/dist/csr/Stethoscope";
import { Sun } from "@phosphor-icons/react/dist/csr/Sun";
import { Syringe } from "@phosphor-icons/react/dist/csr/Syringe";
import { Tooth } from "@phosphor-icons/react/dist/csr/Tooth";
import { Trash } from "@phosphor-icons/react/dist/csr/Trash";
import { TrendUp } from "@phosphor-icons/react/dist/csr/TrendUp";
import { User } from "@phosphor-icons/react/dist/csr/User";
import { UserSwitch } from "@phosphor-icons/react/dist/csr/UserSwitch";
import { Users } from "@phosphor-icons/react/dist/csr/Users";
import { Warning } from "@phosphor-icons/react/dist/csr/Warning";
import { X } from "@phosphor-icons/react/dist/csr/X";
import { XCircle } from "@phosphor-icons/react/dist/csr/XCircle";

/* Local modules */
import { FaqItem } from "./faq-data";
import { loadReviews, Review } from "./review-data";
import {
  loadSlotConfig,
  saveSlotConfig,
  generateAvailableDates,
  formatDateUz,
  getDayCount,
  SLOT_TIME_PERIODS as SHARED_SLOT_TIME_PERIODS,
  DAILY_SLOT_LIMIT,
  saveBookedSlots,
  isDayFull,
  loadFrozenDays,
  toggleFrozenDay,
} from "./slot-config";

/* ===== TYPES ===== */
interface Appointment {
  id: number;
  patientName: string;
  phone: string;
  type: string;
  complaint: string;
  date: string;
  time: string;
  status: "active" | "cancelled";
  cancelReason?: string;
  patientId: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  desc: string;
  gender: string;
  bg: string;
}

interface ServiceItem {
  name: string;
  price: string;
}

interface ServiceCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  services: ServiceItem[];
}

interface UserRecord {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  address: string;
  job: string;
  emergencyName: string;
  emergencyPhone: string;
  diabet: boolean;
  heart: boolean;
  bp: boolean;
  allergy: string;
  meds: string;
  pregnancy: string;
  lastVisit: string;
  toothpain: boolean;
  gumbleed: boolean;
  sensitivity: boolean;
  bruxism: boolean;
  otherComplaint: string;
  photoConsent: boolean;
  programConsent: boolean;
  appointments: Appointment[];
}

/* ===== MOCK DATA ===== */
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientName: "Azizbek Sobirov",
    phone: "+998 90 123 45 67",
    type: "Qabulga yozilish",
    complaint: "Tish og'riyapti, pastki chap tomonda",
    date: "23 Aprel, 2026",
    time: "10:00",
    status: "active",
    patientId: 1,
  },
  {
    id: 2,
    patientName: "Malika Toshpulatova",
    phone: "+998 91 234 56 78",
    type: "Dasturga qo'shilish",
    complaint: "Profilaktik tekshiruv",
    date: "23 Aprel, 2026",
    time: "11:00",
    status: "active",
    patientId: 2,
  },
  {
    id: 3,
    patientName: "Sardor Karimov",
    phone: "+998 93 345 67 89",
    type: "Qabulga yozilish",
    complaint: "Tish tozalash, rangi o'zgargan",
    date: "24 Aprel, 2026",
    time: "14:00",
    status: "active",
    patientId: 3,
  },
  {
    id: 4,
    patientName: "Dilnoza Raxmatullayeva",
    phone: "+998 94 456 78 90",
    type: "Qabulga yozilish",
    complaint: "Bolalar uchun tish ko'rik",
    date: "24 Aprel, 2026",
    time: "15:00",
    status: "cancelled",
    cancelReason:
      "Shifokor shu kuni bandligi sababli, 28-aprelga qayta yoziling.",
    patientId: 4,
  },
  {
    id: 5,
    patientName: "Bobur Aliyev",
    phone: "+998 97 567 89 01",
    type: "Dasturga qo'shilish",
    complaint: "Implant konsultatsiya",
    date: "25 Aprel, 2026",
    time: "09:00",
    status: "active",
    patientId: 5,
  },
];

const MOCK_TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Dr. Shakhbozbek",
    role: "Bosh shifokor",
    desc: "Stomatolog-terapevt · 8 yil tajriba",
    gender: "male",
    bg: "linear-gradient(135deg,#0E2A4A,#163859)",
  },
  {
    id: 2,
    name: "Dr. Nilufar",
    role: "Ortodont",
    desc: "Breket va Invisalign · 5 yil tajriba",
    gender: "female",
    bg: "linear-gradient(135deg,#4A1B6B,#6B2490)",
  },
  {
    id: 3,
    name: "Dr. Bobur",
    role: "Implantolog",
    desc: "Dental implant · 6 yil tajriba",
    gender: "male",
    bg: "linear-gradient(135deg,#1B4A6B,#1C6B9A)",
  },
  {
    id: 4,
    name: "Dr. Zulfiya",
    role: "Parodontolog",
    desc: "Milk kasalliklari · 4 yil tajriba",
    gender: "female",
    bg: "linear-gradient(135deg,#1B6B3A,#25964F)",
  },
];

const MOCK_SERVICES: ServiceCategory[] = [
  {
    id: "terapevtik",
    title: "Terapevtik stomatologiya",
    subtitle: "Karies davolash, plombalar",
    icon: "tooth",
    services: [
      { name: "Konsultatsiya", price: "100 000" },
      { name: "Karies davolash", price: "200 000 dan" },
      { name: "Svet plomba (Germaniya)", price: "400 000" },
      {
        name: "Svet plomba (Yaponiya)",
        price: "500 000 – 600 000",
      },
      { name: "Nerv davolash (1 kanal)", price: "400 000" },
    ],
  },
  {
    id: "jarrohlik",
    title: "Jarrohlik stomatologiyasi",
    subtitle: "Tish sug'urish, implantatsiya",
    icon: "syringe",
    services: [
      { name: "Tish sug'urish", price: "300 000" },
      {
        name: "Murakkab sug'urish",
        price: "300 000 – 500 000",
      },
      { name: "Implant (Koreya)", price: "4 500 000" },
    ],
  },
  {
    id: "ortopedik",
    title: "Ortopedik stomatologiya",
    subtitle: "Protezlar va vinirlar",
    icon: "crown",
    services: [
      {
        name: "Metall-keramika toj",
        price: "800 000 – 1 200 000",
      },
      { name: "Tsirkoniy toj", price: "2 000 000 – 2 500 000" },
      { name: "Vinir (1 ta)", price: "2 500 000 – 3 500 000" },
    ],
  },
  {
    id: "gigiyena",
    title: "Gigiyena",
    subtitle: "Professional tozalash",
    icon: "sparkle",
    services: [
      { name: "Professional tozalash", price: "300 000" },
      { name: "Air Flow", price: "400 000" },
      { name: "Oqartirish", price: "3 000 000" },
    ],
  },
];

const MOCK_USERS: UserRecord[] = [
  {
    id: 1,
    fullName: "Azizbek Sobirov",
    phone: "+998 90 123 45 67",
    email: "azizbek@mail.uz",
    birthDate: "1995-03-15",
    address: "Toshkent, Chilonzor tumani",
    job: "Dasturchi",
    emergencyName: "Sardor Sobirov",
    emergencyPhone: "+998 90 111 22 33",
    diabet: false,
    heart: false,
    bp: false,
    allergy: "Penisilin",
    meds: "Yo'q",
    pregnancy: "Yo'q",
    lastVisit: "2025-12-10",
    toothpain: true,
    gumbleed: false,
    sensitivity: true,
    bruxism: false,
    otherComplaint: "Pastki chap tish og'riyapti",
    photoConsent: true,
    programConsent: true,
    appointments: [],
  },
  {
    id: 2,
    fullName: "Malika Toshpulatova",
    phone: "+998 91 234 56 78",
    email: "malika@mail.uz",
    birthDate: "1998-07-22",
    address: "Toshkent, Yunusobod tumani",
    job: "O'qituvchi",
    emergencyName: "Gulnora Toshpulatova",
    emergencyPhone: "+998 91 222 33 44",
    diabet: false,
    heart: false,
    bp: false,
    allergy: "Yo'q",
    meds: "Yo'q",
    pregnancy: "Yo'q",
    lastVisit: "2026-01-15",
    toothpain: false,
    gumbleed: true,
    sensitivity: false,
    bruxism: false,
    otherComplaint: "",
    photoConsent: true,
    programConsent: true,
    appointments: [],
  },
  {
    id: 3,
    fullName: "Sardor Karimov",
    phone: "+998 93 345 67 89",
    email: "sardor@mail.uz",
    birthDate: "1992-11-08",
    address: "Toshkent, Mirzo Ulug'bek tumani",
    job: "Biznesmen",
    emergencyName: "Anvar Karimov",
    emergencyPhone: "+998 93 333 44 55",
    diabet: true,
    heart: false,
    bp: true,
    allergy: "Yo'q",
    meds: "Metformin",
    pregnancy: "Yo'q",
    lastVisit: "2026-02-20",
    toothpain: false,
    gumbleed: false,
    sensitivity: false,
    bruxism: true,
    otherComplaint: "Tish tozalash kerak",
    photoConsent: true,
    programConsent: false,
    appointments: [],
  },
  {
    id: 4,
    fullName: "Dilnoza Raxmatullayeva",
    phone: "+998 94 456 78 90",
    email: "dilnoza@mail.uz",
    birthDate: "2000-05-30",
    address: "Toshkent, Shayxontohur tumani",
    job: "Talaba",
    emergencyName: "Nargiza Raxmatullayeva",
    emergencyPhone: "+998 94 444 55 66",
    diabet: false,
    heart: false,
    bp: false,
    allergy: "Lateks",
    meds: "Yo'q",
    pregnancy: "Yo'q",
    lastVisit: "",
    toothpain: false,
    gumbleed: false,
    sensitivity: true,
    bruxism: false,
    otherComplaint: "",
    photoConsent: false,
    programConsent: true,
    appointments: [],
  },
  {
    id: 5,
    fullName: "Bobur Aliyev",
    phone: "+998 97 567 89 01",
    email: "bobur@mail.uz",
    birthDate: "1988-09-14",
    address: "Toshkent, Yakkasaroy tumani",
    job: "Arxitektor",
    emergencyName: "Komil Aliyev",
    emergencyPhone: "+998 97 555 66 77",
    diabet: false,
    heart: true,
    bp: false,
    allergy: "Yo'q",
    meds: "Aspirin",
    pregnancy: "Yo'q",
    lastVisit: "2026-03-01",
    toothpain: true,
    gumbleed: true,
    sensitivity: true,
    bruxism: true,
    otherComplaint: "Implant haqida konsultatsiya olmoqchiman",
    photoConsent: true,
    programConsent: true,
    appointments: [],
  },
];

const ICON_MAP_CAT: Record<string, React.ComponentType<any>> = {
  tooth: Tooth,
  syringe: Syringe,
  crown: Crown,
  sparkle: Sparkle,
};

/* ===== ADMIN PANEL ===== */
interface AdminPanelProps {
  onBack: () => void;
}

type AdminTab =
  | "appointments"
  | "slots"
  | "services"
  | "team"
  | "reviews"
  | "faq"
  | "users"
  | "statistics";

const bottomTabs: {
  id: AdminTab | "more";
  icon: React.ComponentType<any>;
  label: string;
}[] = [
  {
    id: "appointments",
    icon: CalendarBlank,
    label: "Qabullar",
  },
  { id: "slots", icon: Clock, label: "Slotlar" },
  { id: "users", icon: Users, label: "Bemorlar" },
  { id: "more", icon: DotsThree, label: "Boshqalar" },
];

const drawerTabs: {
  id: AdminTab;
  icon: React.ComponentType<any>;
  label: string;
}[] = [
  { id: "services", icon: SquaresFour, label: "Xizmatlar" },
  { id: "team", icon: Users, label: "Jamoa" },
  { id: "reviews", icon: Star, label: "Sharhlar" },
  { id: "faq", icon: Question, label: "FAQ" },
  { id: "statistics", icon: ChartBar, label: "Statistika" },
];

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] =
    useState<AdminTab>("appointments");
  const [appointments, setAppointments] = useState<
    Appointment[]
  >(MOCK_APPOINTMENTS);
  const [teamMembers, setTeamMembers] =
    useState<TeamMember[]>(MOCK_TEAM);
  const [services, setServices] =
    useState<ServiceCategory[]>(MOCK_SERVICES);
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadReviews(),
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [users] = useState<UserRecord[]>(MOCK_USERS);

  /* Sub-views */
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState<number | null>(
    null,
  );
  const [selectedUser, setSelectedUser] =
    useState<UserRecord | null>(null);
  const [apptFilter, setApptFilter] = useState<string>("all");
  const [apptSearch, setApptSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "program">("all");
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => {
    setShowMoreDrawer(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerVisible(true));
    });
  };
  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => {
      setShowMoreDrawer(false);
    }, 280);
  };

  /* ===== SLOT SCHEDULE STATE ===== */
  const SLOT_ICON_MAP: Record<
    string,
    React.ComponentType<any>
  > = {
    sun: Sun,
    cloudSun: CloudSun,
    moon: Moon,
  };

  const SLOT_TIME_PERIODS = SHARED_SLOT_TIME_PERIODS.map(
    (p) => ({
      ...p,
      Icon: SLOT_ICON_MAP[p.iconKey] || Sun,
    }),
  );

  const [slotConfig, setSlotConfig] = useState(() =>
    loadSlotConfig(),
  );
  const [slotOpenDateInput, setSlotOpenDateInput] = useState(
    slotConfig?.openDate || "",
  );
  const [slotEndDateInput, setSlotEndDateInput] = useState(
    slotConfig?.endDate || "",
  );
  const [showSlotConfirm, setShowSlotConfirm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDateInput, setExtendDateInput] = useState("");
  const [frozenDays, setFrozenDays] = useState<string[]>(() => loadFrozenDays());

  const SCHEDULE_DATES = generateAvailableDates();

  const [activeSlotDate, setActiveSlotDate] = useState(
    SCHEDULE_DATES.length > 0 ? SCHEDULE_DATES[0].value : "",
  );

  /* Sync booked slots from appointments into localStorage */
  useEffect(() => {
    if (!slotConfig) return;
    const booked: Record<string, string[]> = {};
    for (const d of SCHEDULE_DATES) {
      const dayAppts = appointments.filter(
        (a) =>
          a.status !== "cancelled" &&
          (a.date.includes(d.full) || a.date.includes(d.value)),
      );
      if (dayAppts.length > 0) {
        booked[d.value] = dayAppts.map((a) => a.time);
      }
    }
    saveBookedSlots(booked);
  }, [appointments, slotConfig]);

  // Fetch FAQs from backend
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/faq`);
        const data = await response.json();
        if (data.faq) {
          setFaqItems(data.faq);
        }
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      }
    };
    fetchFAQs();
  }, []);

  const handleSaveSlotConfig = () => {
    if (!slotOpenDateInput || !slotEndDateInput) return;
    if (slotEndDateInput < slotOpenDateInput) return;
    const newConfig = {
      openDate: slotOpenDateInput,
      endDate: slotEndDateInput,
    };
    saveSlotConfig(newConfig);
    setSlotConfig(newConfig);
    setShowSlotConfirm(false);
    const newDates = generateAvailableDates();
    if (newDates.length > 0) {
      setActiveSlotDate(newDates[0].value);
    }
  };

  const handleExtendSlots = () => {
    if (!extendDateInput || !slotConfig) return;
    if (extendDateInput <= slotConfig.endDate) return;
    const newConfig = {
      ...slotConfig,
      endDate: extendDateInput,
    };
    saveSlotConfig(newConfig);
    setSlotConfig(newConfig);
    setShowExtendModal(false);
    setExtendDateInput("");
  };

  /* ===== CRUD modal states ===== */
  /* Services */
  const [svcModal, setSvcModal] = useState<{
    mode: "addCat" | "editCat" | "addItem" | "editItem";
    catId?: string;
    itemIdx?: number;
  } | null>(null);
  const [svcCatTitle, setSvcCatTitle] = useState("");
  const [svcCatSubtitle, setSvcCatSubtitle] = useState("");
  const [svcCatIcon, setSvcCatIcon] = useState("tooth");
  const [svcItemName, setSvcItemName] = useState("");
  const [svcItemPrice, setSvcItemPrice] = useState("");
  /* Team */
  const [teamModal, setTeamModal] = useState<{
    mode: "add" | "edit";
    id?: number;
  } | null>(null);
  const [tmName, setTmName] = useState("");
  const [tmRole, setTmRole] = useState("");
  const [tmDesc, setTmDesc] = useState("");
  /* FAQ */
  const [faqModal, setFaqModal] = useState<{
    mode: "add" | "edit";
    id?: string;
  } | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  /* Review delete */
  const [deletingReviewId, setDeletingReviewId] = useState<
    string | null
  >(null);

  // Link user appointments
  const usersWithAppts = users.map((u) => ({
    ...u,
    appointments: appointments.filter(
      (a) => a.patientId === u.id,
    ),
  }));

  /* ===== APPOINTMENT ACTIONS ===== */
  const openCancelModal = (id: number) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmCancel = () => {
    if (!rejectReason.trim() || rejectingId === null) return;
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === rejectingId
          ? {
              ...a,
              status: "cancelled" as const,
              cancelReason: rejectReason.trim(),
            }
          : a,
      ),
    );
    setShowRejectModal(false);
    setRejectingId(null);
    setRejectReason("");
    setSelectedAppointment(null);
  };

  const downloadPdf = (appt: Appointment) => {
    const user = usersWithAppts.find(
      (u) => u.id === appt.patientId,
    );
    const content = `
SHOKH DENTIST — QABUL ANKETASI
================================
Bemor: ${appt.patientName}
Telefon: ${appt.phone}
Turi: ${appt.type}
Shikoyat: ${appt.complaint}
Sana: ${appt.date}
Vaqt: ${appt.time}
Holat: ${appt.status === "active" ? "Faol" : "Bekor qilingan"}
${appt.cancelReason ? `Bekor qilish sababi: ${appt.cancelReason}` : ""}
================================
${
  user
    ? `
BEMOR MA'LUMOTLARI
Tug'ilgan sana: ${user.birthDate}
Email: ${user.email}
Manzil: ${user.address}
Kasb: ${user.job}
Favqulodda aloqa: ${user.emergencyName} (${user.emergencyPhone})

TIBBIY TARIX
Diabet: ${user.diabet ? "Ha" : "Yo'q"}
Yurak: ${user.heart ? "Ha" : "Yo'q"}
Qon bosimi: ${user.bp ? "Ha" : "Yo'q"}
Allergiya: ${user.allergy}
Dorilar: ${user.meds}

TISH TARIXI
Tish og'rig'i: ${user.toothpain ? "Ha" : "Yo'q"}
Milk qonashi: ${user.gumbleed ? "Ha" : "Yo'q"}
Sezuvchanlik: ${user.sensitivity ? "Ha" : "Yo'q"}
Bruksizm: ${user.bruxism ? "Ha" : "Yo'q"}
Boshqa: ${user.otherComplaint || "Yo'q"}
`
    : ""
}
    `.trim();

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anketa_${appt.patientName.replace(/\s/g, "_")}_${appt.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ===== STATUS HELPERS ===== */
  const statusBadge = (status: string, reason?: string) => {
    const configs: Record<
      string,
      {
        bg: string;
        color: string;
        text: string;
        Icon: React.ComponentType<any>;
      }
    > = {
      active: {
        bg: "#E0F5F3",
        color: "#1FA89A",
        text: "Faol",
        Icon: CheckCircle,
      },
      cancelled: {
        bg: "#FFEBEE",
        color: "#D32F2F",
        text: "Bekor qilingan",
        Icon: XCircle,
      },
    };
    const c = configs[status] || configs.pending;
    const Icon = c.Icon;
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 10px",
          borderRadius: 20,
          background: c.bg,
        }}
      >
        <Icon size={13} weight="duotone" color={c.color} />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: c.color,
          }}
        >
          {c.text}
        </span>
      </div>
    );
  };

  const filteredAppointments = appointments
    .filter((a) => {
      if (apptFilter === "qabul")
        return a.type === "Qabulga yozilish";
      if (apptFilter === "dastur")
        return a.type === "Dasturga qo'shilish";
      return true;
    })
    .filter((a) =>
      apptSearch.trim()
        ? a.patientName
            .toLowerCase()
            .includes(apptSearch.trim().toLowerCase())
        : true,
    );

  /* ===== RENDER TAB CONTENT ===== */
  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return renderAppointments();
      case "slots":
        return renderSlots();
      case "services":
        return renderServices();
      case "team":
        return renderTeam();
      case "reviews":
        return renderReviews();
      case "faq":
        return renderFaq();
      case "users":
        return renderUsers();
      case "statistics":
        return renderStatistics();
      default:
        return null;
    }
  };

  /* ===== APPOINTMENTS TAB ===== */
  const renderAppointments = () => {
    if (selectedAppointment) {
      const appt = selectedAppointment;
      const user = usersWithAppts.find(
        (u) => u.id === appt.patientId,
      );
      return (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid #C8D8E8",
              background: "#F5F9FC",
            }}
          >
            <button
              onClick={() => setSelectedAppointment(null)}
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
            <div
              style={{ fontSize: 15, fontWeight: 600, flex: 1 }}
            >
              Qabul tafsilotlari
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            <div style={{ marginBottom: 16 }}>
              {statusBadge(appt.status, appt.cancelReason)}
            </div>

            {appt.status === "cancelled" &&
              appt.cancelReason && (
                <div
                  style={{
                    background: "#FFF3F3",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: "#FFCDD2",
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginBottom: 16,
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <Warning
                    size={18}
                    weight="duotone"
                    color="#D32F2F"
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#D32F2F",
                        marginBottom: 4,
                      }}
                    >
                      Bekor qilish sababi
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#5A3A3A",
                        lineHeight: 1.5,
                      }}
                    >
                      {appt.cancelReason}
                    </div>
                  </div>
                </div>
              )}

            {/* Info cards */}
            {[
              {
                label: "Bemor",
                value: appt.patientName,
                icon: User,
              },
              {
                label: "Telefon",
                value: appt.phone,
                icon: Phone,
              },
              {
                label: "Turi",
                value: appt.type,
                icon: ClipboardText,
              },
              {
                label: "Shikoyat",
                value: appt.complaint,
                icon: FirstAid,
              },
              {
                label: "Sana",
                value: appt.date,
                icon: CalendarBlank,
              },
              {
                label: "Vaqt",
                value: appt.time,
                icon: CalendarCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: "white",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: "#C8D8E8",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#E0F5F3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      size={18}
                      weight="duotone"
                      color="#1FA89A"
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B8099",
                        fontWeight: 500,
                        marginBottom: 2,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0E2A4A",
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 16,
              }}
            >
              {appt.status === "active" && (
                <button
                  onClick={() => openCancelModal(appt.id)}
                  style={{
                    width: "100%",
                    padding: 14,
                    background: "white",
                    color: "#D32F2F",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: "#FFCDD2",
                    borderRadius: 12,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <XCircle size={18} weight="bold" />
                  Bekor qilish
                </button>
              )}
              <button
                onClick={() => downloadPdf(appt)}
                style={{
                  width: "100%",
                  padding: 14,
                  background: "#F5F9FC",
                  color: "#0E2A4A",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 15,
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
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Search */}
        <div style={{ padding: "16px 20px 8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 12,
              padding: "9px 14px",
            }}
          >
            <MagnifyingGlass size={18} color="#9BB0C4" />
            <input
              type="text"
              placeholder="Bemor ismi bilan qidirish..."
              value={apptSearch}
              onChange={(e) => setApptSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                color: "#0E2A4A",
                background: "transparent",
              }}
            />
            {apptSearch && (
              <button
                onClick={() => setApptSearch("")}
                style={{
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={16} color="#9BB0C4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter pills */}
        <div
          style={{
            padding: "6px 20px 12px 20px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
          }}
        >
          {[
            { id: "all", label: "Barchasi" },
            { id: "qabul", label: "Qabul" },
            { id: "dastur", label: "Dastur" },
          ].map((f) => {
            const count =
              f.id === "all"
                ? appointments.length
                : f.id === "qabul"
                  ? appointments.filter(
                      (a) => a.type === "Qabulga yozilish",
                    ).length
                  : appointments.filter(
                      (a) => a.type === "Dasturga qo'shilish",
                    ).length;
            const isActive = apptFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setApptFilter(f.id)}
                style={{
                  padding: "7px 14px",
                  background: isActive ? "#0E2A4A" : "white",
                  color: isActive ? "white" : "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: isActive ? "#0E2A4A" : "#C8D8E8",
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {f.label}
                <span
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "#F0F3F6",
                    padding: "1px 7px",
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ padding: "0 20px" }}>
          {filteredAppointments.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#9BB0C4",
                fontSize: 14,
              }}
            >
              Hech qanday qabul topilmadi
            </div>
          )}
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              onClick={() => setSelectedAppointment(appt)}
              style={{
                background: "white",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#C8D8E8",
                borderRadius: 14,
                padding: "14px 16px",
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                {statusBadge(appt.status)}
                <CaretRight size={16} color="#9BB0C4" />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #0E2A4A, #163859)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {appt.patientName.charAt(0)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0E2A4A",
                    }}
                  >
                    {appt.patientName}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#6B8099" }}
                  >
                    {appt.type}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#5A7A96",
                  lineHeight: 1.5,
                  marginBottom: 6,
                }}
              >
                {appt.complaint}
              </div>
              <div style={{ fontSize: 11, color: "#9BB0C4" }}>
                {appt.date} · {appt.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /* ===== SERVICE CRUD ===== */
  const openAddCategory = () => {
    setSvcCatTitle("");
    setSvcCatSubtitle("");
    setSvcCatIcon("tooth");
    setSvcModal({ mode: "addCat" });
  };
  const openEditCategory = (cat: ServiceCategory) => {
    setSvcCatTitle(cat.title);
    setSvcCatSubtitle(cat.subtitle);
    setSvcCatIcon(cat.icon);
    setSvcModal({ mode: "editCat", catId: cat.id });
  };
  const saveCategory = () => {
    if (!svcCatTitle.trim()) return;
    if (svcModal?.mode === "addCat") {
      const newId = "cat_" + Date.now();
      setServices((prev) => [
        ...prev,
        {
          id: newId,
          title: svcCatTitle.trim(),
          subtitle: svcCatSubtitle.trim(),
          icon: svcCatIcon,
          services: [],
        },
      ]);
    } else if (svcModal?.mode === "editCat" && svcModal.catId) {
      setServices((prev) =>
        prev.map((c) =>
          c.id === svcModal.catId
            ? {
                ...c,
                title: svcCatTitle.trim(),
                subtitle: svcCatSubtitle.trim(),
                icon: svcCatIcon,
              }
            : c,
        ),
      );
    }
    setSvcModal(null);
  };
  const deleteCategory = (catId: string) => {
    setServices((prev) => prev.filter((c) => c.id !== catId));
  };
  const openAddServiceItem = (catId: string) => {
    setSvcItemName("");
    setSvcItemPrice("");
    setSvcModal({ mode: "addItem", catId });
  };
  const openEditServiceItem = (
    catId: string,
    idx: number,
    item: ServiceItem,
  ) => {
    setSvcItemName(item.name);
    setSvcItemPrice(item.price);
    setSvcModal({ mode: "editItem", catId, itemIdx: idx });
  };
  const saveServiceItem = () => {
    if (
      !svcItemName.trim() ||
      !svcItemPrice.trim() ||
      !svcModal?.catId
    )
      return;
    setServices((prev) =>
      prev.map((c) => {
        if (c.id !== svcModal.catId) return c;
        const items = [...c.services];
        if (svcModal.mode === "addItem") {
          items.push({
            name: svcItemName.trim(),
            price: svcItemPrice.trim(),
          });
        } else if (
          svcModal.mode === "editItem" &&
          svcModal.itemIdx !== undefined
        ) {
          items[svcModal.itemIdx] = {
            name: svcItemName.trim(),
            price: svcItemPrice.trim(),
          };
        }
        return { ...c, services: items };
      }),
    );
    setSvcModal(null);
  };
  const deleteServiceItem = (catId: string, idx: number) => {
    setServices((prev) =>
      prev.map((c) =>
        c.id !== catId
          ? c
          : {
              ...c,
              services: c.services.filter((_, i) => i !== idx),
            },
      ),
    );
  };

  /* ===== TEAM CRUD ===== */
  const teamGradients = [
    "linear-gradient(135deg,#0E2A4A,#163859)",
    "linear-gradient(135deg,#4A1B6B,#6B2490)",
    "linear-gradient(135deg,#1B4A6B,#1C6B9A)",
    "linear-gradient(135deg,#1B6B3A,#25964F)",
    "linear-gradient(135deg,#6B4A1B,#9A6B1C)",
  ];
  const openAddTeam = () => {
    setTmName("");
    setTmRole("");
    setTmDesc("");
    setTeamModal({ mode: "add" });
  };
  const openEditTeam = (t: TeamMember) => {
    setTmName(t.name);
    setTmRole(t.role);
    setTmDesc(t.desc);
    setTeamModal({ mode: "edit", id: t.id });
  };
  const saveTeam = () => {
    if (!tmName.trim() || !tmRole.trim()) return;
    if (teamModal?.mode === "add") {
      const newId = Date.now();
      setTeamMembers((prev) => [
        ...prev,
        {
          id: newId,
          name: tmName.trim(),
          role: tmRole.trim(),
          desc: tmDesc.trim(),
          gender: "male",
          bg: teamGradients[prev.length % teamGradients.length],
        },
      ]);
    } else if (
      teamModal?.mode === "edit" &&
      teamModal.id !== undefined
    ) {
      setTeamMembers((prev) =>
        prev.map((t) =>
          t.id === teamModal.id
            ? {
                ...t,
                name: tmName.trim(),
                role: tmRole.trim(),
                desc: tmDesc.trim(),
              }
            : t,
        ),
      );
    }
    setTeamModal(null);
  };
  const deleteTeam = (id: number) => {
    setTeamMembers((prev) => prev.filter((t) => t.id !== id));
  };

  /* ===== FAQ CRUD ===== */
  const openAddFaq = () => {
    setFaqQ("");
    setFaqA("");
    setFaqModal({ mode: "add" });
  };
  const openEditFaq = (item: FaqItem) => {
    setFaqQ(item.q);
    setFaqA(item.a);
    setFaqModal({ mode: "edit", id: item.id });
  };
  const saveFaq = async () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    
    try {
      if (faqModal?.mode === "add") {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/faq`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Telegram-Init-Data": (window as any).Telegram?.WebApp?.initData || "",
          },
          body: JSON.stringify({
            q: faqQ.trim(),
            a: faqA.trim(),
            category: "umumiy"
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setFaqItems((prev) => [...prev, data.item]);
        }
      } else if (
        faqModal?.mode === "edit" &&
        faqModal.id !== undefined
      ) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/admin/faq/${faqModal.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Telegram-Init-Data": (window as any).Telegram?.WebApp?.initData || "",
            },
            body: JSON.stringify({
              q: faqQ.trim(),
              a: faqA.trim(),
            }),
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setFaqItems((prev) =>
            prev.map((f) =>
              f.id === faqModal.id ? data.item : f
            )
          );
        }
      }
      setFaqModal(null);
    } catch (error) {
      console.error("Failed to save FAQ:", error);
      alert("FAQ saqlashda xatolik yuz berdi");
    }
  };
  
  const deleteFaq = async (id: string) => {
    if (!confirm("Ushbu savolni o'chirishni xohlaysizmi?")) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/faq/${id}`,
        {
          method: "DELETE",
          headers: {
            "X-Telegram-Init-Data": (window as any).Telegram?.WebApp?.initData || "",
          },
        }
      );
      
      if (response.ok) {
        setFaqItems((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
      alert("FAQ o'chirishda xatolik yuz berdi");
    }
  };

  /* ===== REVIEW DELETE ===== */
  const confirmDeleteReview = () => {
    if (!deletingReviewId) return;
    setReviews((prev) =>
      prev.filter((r) => r.id !== deletingReviewId),
    );
    setDeletingReviewId(null);
  };

  /* ===== SERVICES TAB ===== */
  const renderServices = () => (
    <div style={{ padding: "16px 20px" }}>
      {/* Add category button */}
      <button
        onClick={openAddCategory}
        style={{
          width: "100%",
          padding: "12px",
          background: "white",
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#1FA89A",
          borderRadius: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1FA89A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Plus size={18} weight="bold" /> Kategoriya qo'shish
      </button>
      {services.map((cat) => {
        const Icon = ICON_MAP_CAT[cat.icon] || Tooth;
        return (
          <div
            key={cat.id}
            style={{
              background: "white",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 14,
              marginBottom: 12,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
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
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0E2A4A",
                  }}
                >
                  {cat.title}
                </div>
                <div style={{ fontSize: 12, color: "#6B8099" }}>
                  {cat.subtitle}
                </div>
              </div>
              <button
                onClick={() => openEditCategory(cat)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <Pencil size={16} color="#6B8099" />
              </button>
              <button
                onClick={() => deleteCategory(cat.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 6,
                }}
              >
                <Trash size={16} color="#D32F2F" />
              </button>
            </div>
            <div style={{ borderTop: "1px solid #E4ECF2" }}>
              {cat.services.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "11px 16px",
                    borderBottom:
                      i < cat.services.length - 1
                        ? "1px solid #F0F3F6"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#0E2A4A",
                      fontWeight: 500,
                      flex: 1,
                    }}
                  >
                    {s.name}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: "#1FA89A",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      marginRight: 8,
                    }}
                  >
                    {s.price} so'm
                  </span>
                  <button
                    onClick={() =>
                      openEditServiceItem(cat.id, i, s)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Pencil size={14} color="#6B8099" />
                  </button>
                  <button
                    onClick={() => deleteServiceItem(cat.id, i)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    <Trash size={14} color="#D32F2F" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => openAddServiceItem(cat.id)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "#F5F9FC",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1FA89A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <Plus size={14} weight="bold" /> Xizmat qo'shish
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  /* ===== TEAM TAB ===== */
  const renderTeam = () => (
    <div style={{ padding: "16px 20px" }}>
      <button
        onClick={openAddTeam}
        style={{
          width: "100%",
          padding: "12px",
          background: "white",
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#1FA89A",
          borderRadius: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1FA89A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Plus size={18} weight="bold" /> A'zo qo'shish
      </button>
      {teamMembers.map((t) => (
        <div
          key={t.id}
          style={{
            background: "white",
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
            borderRadius: 14,
            padding: "16px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: t.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Stethoscope
              size={24}
              weight="duotone"
              color="white"
            />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 2,
              }}
            >
              {t.name}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1FA89A",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
              }}
            >
              {t.role}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#6B8099",
                lineHeight: 1.4,
              }}
            >
              {t.desc}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <button
              onClick={() => openEditTeam(t)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Pencil size={16} color="#6B8099" />
            </button>
            <button
              onClick={() => deleteTeam(t.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Trash size={16} color="#D32F2F" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  /* ===== REVIEWS TAB ===== */
  const renderReviews = () => {
    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((s, r) => s + r.rating, 0) /
            reviews.length
          ).toFixed(1)
        : "0";
    return (
      <div style={{ padding: "16px 20px" }}>
        {/* Stats */}
        <div
          style={{
            background: "white",
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 32,
                fontWeight: 700,
                color: "#0E2A4A",
              }}
            >
              {avgRating}
            </div>
            <div
              style={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
              }}
            >
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={12}
                  weight="fill"
                  color={
                    s <= Math.round(Number(avgRating))
                      ? "#F5A623"
                      : "#D5DFE9"
                  }
                />
              ))}
            </div>
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              background: "#E4ECF2",
            }}
          />
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0E2A4A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {reviews.length}
            </div>
            <div style={{ fontSize: 12, color: "#6B8099" }}>
              Jami sharhlar
            </div>
          </div>
        </div>

        {reviews.map((r) => (
          <div
            key={r.id}
            style={{
              background: "white",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #1FA89A, #25C4B4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0E2A4A",
                    }}
                  >
                    {r.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      marginTop: 2,
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        weight="fill"
                        color={
                          s <= r.rating ? "#F5A623" : "#D5DFE9"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 11, color: "#9BB0C4" }}>
                  {r.date}
                </div>
                <button
                  onClick={() => setDeletingReviewId(r.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Trash size={16} color="#D32F2F" />
                </button>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#5A7A96",
                lineHeight: 1.6,
              }}
            >
              {r.text}
            </div>
            {r.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "3px 10px",
                      background: "#E0F5F3",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#1FA89A",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  /* ===== FAQ TAB ===== */
  const renderFaq = () => (
    <div style={{ padding: "16px 20px" }}>
      <button
        onClick={openAddFaq}
        style={{
          width: "100%",
          padding: "12px",
          background: "white",
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#1FA89A",
          borderRadius: 14,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: "#1FA89A",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Plus size={18} weight="bold" /> Savol qo'shish
      </button>
      {faqItems.map((item, idx) => (
        <div
          key={item.id}
          style={{
            background: "white",
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "#E0F5F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#1FA89A",
              }}
            >
              {idx + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0E2A4A",
                  marginBottom: 6,
                }}
              >
                {item.q}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "#5A7A96",
                  lineHeight: 1.6,
                }}
              >
                {item.a}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              <button
                onClick={() => openEditFaq(item)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Pencil size={15} color="#6B8099" />
              </button>
              <button
                onClick={() => deleteFaq(item.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                }}
              >
                <Trash size={15} color="#D32F2F" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ===== USERS TAB ===== */
  const renderUsers = () => {
    if (selectedUser) {
      const u =
        usersWithAppts.find(
          (usr) => usr.id === selectedUser.id,
        ) || selectedUser;
      return (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid #C8D8E8",
              background: "#F5F9FC",
            }}
          >
            <button
              onClick={() => setSelectedUser(null)}
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
            <div
              style={{ fontSize: 15, fontWeight: 600, flex: 1 }}
            >
              Bemor ma'lumotlari
            </div>
          </div>
          <div style={{ padding: "20px" }}>
            {/* Profile header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
                padding: "16px",
                background:
                  "linear-gradient(135deg, #0E2A4A, #163859)",
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <User
                  size={26}
                  weight="duotone"
                  color="white"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "white",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {u.fullName}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {u.phone}
                </div>
              </div>
            </div>

            {/* Info sections */}
            {[
              {
                title: "Shaxsiy ma'lumotlar",
                icon: User,
                rows: [
                  {
                    label: "Tug'ilgan sana",
                    value: u.birthDate,
                  },
                  { label: "Email", value: u.email },
                  { label: "Manzil", value: u.address },
                  { label: "Kasb", value: u.job },
                  {
                    label: "Favqulodda aloqa",
                    value: `${u.emergencyName} (${u.emergencyPhone})`,
                  },
                ],
              },
              {
                title: "Tibbiy tarix",
                icon: FirstAid,
                rows: [
                  {
                    label: "Diabet",
                    value: u.diabet ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Yurak kasalligi",
                    value: u.heart ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Qon bosimi",
                    value: u.bp ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Allergiya",
                    value: u.allergy || "Yo'q",
                  },
                  { label: "Dorilar", value: u.meds || "Yo'q" },
                  {
                    label: "Homiladorlik",
                    value: u.pregnancy || "Yo'q",
                  },
                ],
              },
              {
                title: "Tish tarixi",
                icon: Tooth,
                rows: [
                  {
                    label: "Tish og'rig'i",
                    value: u.toothpain ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Milk qonashi",
                    value: u.gumbleed ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Sezuvchanlik",
                    value: u.sensitivity ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Bruksizm",
                    value: u.bruxism ? "Ha" : "Yo'q",
                  },
                  {
                    label: "Oxirgi tashrif",
                    value: u.lastVisit || "Yo'q",
                  },
                  {
                    label: "Boshqa shikoyat",
                    value: u.otherComplaint || "Yo'q",
                  },
                ],
              },
            ].map((section) => {
              const SIcon = section.icon;
              return (
                <div
                  key={section.title}
                  style={{
                    background: "white",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: "#C8D8E8",
                    borderRadius: 14,
                    marginBottom: 12,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      borderBottom: "1px solid #E4ECF2",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "#E0F5F3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <SIcon
                        size={16}
                        weight="duotone"
                        color="#1FA89A"
                      />
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#0E2A4A",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {section.title}
                    </div>
                  </div>
                  {section.rows.map((row, ri) => (
                    <div
                      key={ri}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        borderBottom:
                          ri < section.rows.length - 1
                            ? "1px solid #F0F3F6"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: "#6B8099",
                        }}
                      >
                        {row.label}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0E2A4A",
                          textAlign: "right",
                          maxWidth: "55%",
                          wordBreak: "break-word",
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Past appointments */}
            <div
              style={{
                marginTop: 8,
                marginBottom: 12,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#6B8099",
              }}
            >
              Qabullar tarixi
            </div>
            {u.appointments.length === 0 ? (
              <div
                style={{
                  background: "white",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 14,
                  padding: "20px",
                  textAlign: "center",
                  color: "#9BB0C4",
                  fontSize: 13,
                }}
              >
                Hali qabul tarixi yo'q
              </div>
            ) : (
              u.appointments.map((appt) => (
                <div
                  key={appt.id}
                  style={{
                    background: "white",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: "#C8D8E8",
                    borderRadius: 12,
                    padding: "12px 14px",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    {statusBadge(appt.status)}
                    <span
                      style={{ fontSize: 11, color: "#9BB0C4" }}
                    >
                      {appt.date}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0E2A4A",
                      marginBottom: 4,
                    }}
                  >
                    {appt.type}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#5A7A96" }}
                  >
                    {appt.complaint}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    const searchLower = userSearch.toLowerCase().trim();
    const programUserIds = new Set(
      appointments
        .filter((a) => a.type === "Dasturga qo'shilish" && a.status !== "cancelled")
        .map((a) => a.patientId),
    );
    const baseUsers =
      userFilter === "program"
        ? usersWithAppts.filter((u) => programUserIds.has(u.id))
        : usersWithAppts;
    const filteredUsers = searchLower
      ? baseUsers.filter(
          (u) =>
            u.fullName.toLowerCase().includes(searchLower) ||
            u.phone
              .replace(/\s/g, "")
              .includes(searchLower.replace(/\s/g, "")) ||
            u.email.toLowerCase().includes(searchLower),
        )
      : baseUsers;

    return (
      <div style={{ padding: "16px 20px" }}>
        {/* Search bar */}
        <div
          style={{
            position: "relative",
            marginBottom: 14,
          }}
        >
          <MagnifyingGlass
            size={18}
            weight="bold"
            color="#9BB0C4"
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Ism, telefon yoki email bo'yicha qidirish..."
            style={{
              width: "100%",
              padding: "12px 14px 12px 42px",
              background: "white",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 12,
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: "#0E2A4A",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#1FA89A";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#C8D8E8";
            }}
          />
          {userSearch && (
            <button
              onClick={() => setUserSearch("")}
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "#F0F3F6",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={14} color="#6B8099" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {([
            { id: "all" as const, label: "Barchasi", count: usersWithAppts.length },
            { id: "program" as const, label: "Dastur ishtirokchilari", count: programUserIds.size },
          ]).map((tab) => {
            const isActive = userFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setUserFilter(tab.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  background: isActive ? "#0E2A4A" : "white",
                  color: isActive ? "white" : "#6B8099",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: isActive ? "#0E2A4A" : "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {tab.label}
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 6,
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F0F3F6",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#9BB0C4",
              fontSize: 14,
            }}
          >
            Hech qanday bemor topilmadi
          </div>
        )}
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={{
              background: "white",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #0E2A4A, #163859)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 16,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {u.fullName.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0E2A4A",
                  marginBottom: 2,
                }}
              >
                {u.fullName}
              </div>
              <div style={{ fontSize: 12, color: "#6B8099" }}>
                {u.phone}
              </div>
              {u.appointments.length > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: "#1FA89A",
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  {u.appointments.length} ta qabul
                </div>
              )}
            </div>
            <CaretRight size={16} color="#9BB0C4" />
          </div>
        ))}
      </div>
    );
  };

  /* ===== SLOT HELPERS ===== */

  /* ===== SLOTS TAB ===== */
  const renderSlots = () => {
    /* If no config set yet, show setup UI */
    if (!slotConfig) {
      return (
        <div style={{ padding: "16px 20px" }}>
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "28px 20px",
              textAlign: "center",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#E0F5F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <CalendarBlank
                size={28}
                weight="duotone"
                color="#1FA89A"
              />
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: "#0E2A4A",
                marginBottom: 8,
              }}
            >
              Slotlar hali ochilmagan
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6B8099",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Boshlanish va tugash sanalarini kiriting — shu
              oraliqda kuniga {DAILY_SLOT_LIMIT} tagacha slot
              ochiladi.
            </div>
            <div style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                Boshlanish sanasi
              </label>
              <input
                type="date"
                value={slotOpenDateInput}
                onChange={(e) =>
                  setSlotOpenDateInput(e.target.value)
                }
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
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                Tugash sanasi
              </label>
              <input
                type="date"
                value={slotEndDateInput}
                onChange={(e) =>
                  setSlotEndDateInput(e.target.value)
                }
                min={slotOpenDateInput || undefined}
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
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            {slotOpenDateInput &&
              slotEndDateInput &&
              slotEndDateInput >= slotOpenDateInput && (
                <div
                  style={{
                    background: "#E0F5F3",
                    borderRadius: 12,
                    padding: "10px 14px",
                    marginBottom: 16,
                    fontSize: 12,
                    color: "#1FA89A",
                    fontWeight: 500,
                  }}
                >
                  {formatDateUz(slotOpenDateInput)} —{" "}
                  {formatDateUz(slotEndDateInput)} (
                  {getDayCount(
                    slotOpenDateInput,
                    slotEndDateInput,
                  )}{" "}
                  kun)
                </div>
              )}
            <button
              onClick={handleSaveSlotConfig}
              disabled={
                !slotOpenDateInput ||
                !slotEndDateInput ||
                slotEndDateInput < slotOpenDateInput
              }
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background:
                  slotOpenDateInput &&
                  slotEndDateInput &&
                  slotEndDateInput >= slotOpenDateInput
                    ? "#1FA89A"
                    : "#C8D8E8",
                color: "white",
                border: "none",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  slotOpenDateInput &&
                  slotEndDateInput &&
                  slotEndDateInput >= slotOpenDateInput
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              Slotlarni ochish
            </button>
          </div>
        </div>
      );
    }

    const currentDate =
      SCHEDULE_DATES.find((d) => d.value === activeSlotDate) ||
      SCHEDULE_DATES[0];

    if (!currentDate) return null;

    const bookedAppts = appointments.filter(
      (a) =>
        a.status !== "cancelled" &&
        (a.date.includes(currentDate.full) ||
          a.date.includes(currentDate.value)),
    );
    const bookedTimes = bookedAppts.map((a) => a.time);
    const allSlots = SLOT_TIME_PERIODS.flatMap((p) => p.slots);
    const freeCount = allSlots.filter(
      (s) => !bookedTimes.includes(s),
    ).length;
    const bookedCount = allSlots.length - freeCount;
    const dayFull = bookedCount >= DAILY_SLOT_LIMIT;
    const isCurrentDayFrozen = frozenDays.includes(activeSlotDate);

    return (
      <div style={{ padding: "16px 20px" }}>
        {/* Slot period info bar */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 12,
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#6B8099",
                  fontWeight: 500,
                  marginBottom: 2,
                }}
              >
                Ochiq davr ·{" "}
                {getDayCount(
                  slotConfig.openDate,
                  slotConfig.endDate,
                )}{" "}
                kun
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#0E2A4A",
                }}
              >
                {formatDateUz(slotConfig.openDate)} —{" "}
                {formatDateUz(slotConfig.endDate)}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setExtendDateInput("");
              setShowExtendModal(true);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              background: "#E0F5F3",
              border: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: "#1FA89A",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <Plus size={14} weight="bold" />
            Cho'zish
          </button>
        </div>

        {/* Extend modal */}
        {showExtendModal && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(14,42,74,0.5)",
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowExtendModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: 20,
                padding: "24px",
                width: "100%",
                maxWidth: 380,
                boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
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
                  }}
                >
                  <CalendarBlank
                    size={22}
                    weight="duotone"
                    color="#1FA89A"
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#0E2A4A",
                    }}
                  >
                    Slotlarni cho'zish
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#6B8099" }}
                  >
                    Qachongacha cho'zamiz?
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#F5F9FC",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#6B8099",
                }}
              >
                Hozirgi tugash:{" "}
                <span
                  style={{ fontWeight: 600, color: "#0E2A4A" }}
                >
                  {formatDateUz(slotConfig.endDate)}
                </span>
              </div>
              <label
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Yangi tugash sanasi
              </label>
              <input
                type="date"
                value={extendDateInput}
                onChange={(e) =>
                  setExtendDateInput(e.target.value)
                }
                min={(() => {
                  const d = new Date(
                    slotConfig.endDate + "T00:00:00",
                  );
                  d.setDate(d.getDate() + 1);
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(
                    2,
                    "0",
                  );
                  const dd = String(d.getDate()).padStart(
                    2,
                    "0",
                  );
                  return `${yyyy}-${mm}-${dd}`;
                })()}
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
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 12,
                }}
              />
              {extendDateInput &&
                extendDateInput > slotConfig.endDate && (
                  <div
                    style={{
                      background: "#E0F5F3",
                      borderRadius: 10,
                      padding: "10px 14px",
                      marginBottom: 14,
                      fontSize: 12,
                      color: "#1FA89A",
                      fontWeight: 500,
                    }}
                  >
                    {formatDateUz(slotConfig.openDate)} —{" "}
                    {formatDateUz(extendDateInput)} (
                    {getDayCount(
                      slotConfig.openDate,
                      extendDateInput,
                    )}{" "}
                    kun)
                  </div>
                )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setShowExtendModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    background: "#F5F9FC",
                    borderWidth: 1.5,
                    borderStyle: "solid",
                    borderColor: "#C8D8E8",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#6B8099",
                    cursor: "pointer",
                  }}
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleExtendSlots}
                  disabled={
                    !extendDateInput ||
                    extendDateInput <= slotConfig.endDate
                  }
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    background:
                      extendDateInput &&
                      extendDateInput > slotConfig.endDate
                        ? "#1FA89A"
                        : "#C8D8E8",
                    border: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                    cursor:
                      extendDateInput &&
                      extendDateInput > slotConfig.endDate
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Cho'zish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change date range modal */}
        {showSlotConfirm && (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "16px",
              marginBottom: 12,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0E2A4A",
                marginBottom: 10,
              }}
            >
              Sanalarni o'zgartirish
            </div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B8099",
                display: "block",
                marginBottom: 4,
              }}
            >
              Boshlanish
            </label>
            <input
              type="date"
              value={slotOpenDateInput}
              onChange={(e) =>
                setSlotOpenDateInput(e.target.value)
              }
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#C8D8E8",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#0E2A4A",
                background: "#F5F9FC",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 8,
              }}
            />
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#6B8099",
                display: "block",
                marginBottom: 4,
              }}
            >
              Tugash
            </label>
            <input
              type="date"
              value={slotEndDateInput}
              onChange={(e) =>
                setSlotEndDateInput(e.target.value)
              }
              min={slotOpenDateInput || undefined}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#C8D8E8",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "#0E2A4A",
                background: "#F5F9FC",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: 10,
              }}
            />
            {slotOpenDateInput &&
              slotEndDateInput &&
              slotEndDateInput >= slotOpenDateInput && (
                <div
                  style={{
                    background: "#E0F5F3",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 10,
                    fontSize: 11,
                    color: "#1FA89A",
                    fontWeight: 500,
                  }}
                >
                  {formatDateUz(slotOpenDateInput)} —{" "}
                  {formatDateUz(slotEndDateInput)} (
                  {getDayCount(
                    slotOpenDateInput,
                    slotEndDateInput,
                  )}{" "}
                  kun)
                </div>
              )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowSlotConfirm(false);
                  setSlotOpenDateInput(slotConfig.openDate);
                  setSlotEndDateInput(slotConfig.endDate);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  background: "#F5F9FC",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#6B8099",
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleSaveSlotConfig}
                disabled={
                  !slotOpenDateInput ||
                  !slotEndDateInput ||
                  slotEndDateInput < slotOpenDateInput
                }
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  background:
                    slotOpenDateInput &&
                    slotEndDateInput &&
                    slotEndDateInput >= slotOpenDateInput
                      ? "#1FA89A"
                      : "#C8D8E8",
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "white",
                  cursor:
                    slotOpenDateInput &&
                    slotEndDateInput &&
                    slotEndDateInput >= slotOpenDateInput
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Saqlash
              </button>
            </div>
          </div>
        )}

        {/* Daily limit info */}

        {/* Date pill tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            overflowX: "auto",
            paddingTop: "6px",
            paddingBottom: "4px",
          }}
        >
          {SCHEDULE_DATES.map((d) => {
            const isActive = activeSlotDate === d.value;
            const isFrozen = frozenDays.includes(d.value);
            const dayBooked = appointments.filter(
              (a) =>
                a.status !== "cancelled" &&
                (a.date.includes(d.full) ||
                  a.date.includes(d.value)),
            );
            const isFull = dayBooked.length >= DAILY_SLOT_LIMIT;
            return (
              <button
                key={d.value}
                onClick={() => setActiveSlotDate(d.value)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  minWidth: 56,
                  flexShrink: 0,
                  background: isActive
                    ? "#0E2A4A"
                    : isFrozen
                      ? "#E8F4FD"
                      : isFull
                        ? "#FFF4E6"
                        : "white",
                  color: isActive ? "white" : isFrozen ? "#5B9BD5" : "#0E2A4A",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: isActive
                    ? "#0E2A4A"
                    : isFrozen
                      ? "#A8D4F0"
                      : isFull
                        ? "#F5E0C3"
                        : "#C8D8E8",
                  position: "relative",
                  transition: "all 0.15s ease",
                  opacity: isFrozen && !isActive ? 0.75 : 1,
                }}
              >
                <div style={{ fontSize: 9, opacity: 0.6 }}>
                  {isFrozen ? "❄️" : d.weekday}
                </div>
                <div style={{ fontWeight: 700 }}>
                  {d.label.split(" ")[0]}
                </div>
                {isFrozen && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#5B9BD5",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    ❄
                  </div>
                )}
                {!isFrozen && dayBooked.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: isFull
                        ? "#E74C3C"
                        : "#E67E22",
                      color: "white",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {dayBooked.length}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Summary strip */}

        {/* Frozen day banner */}
        {isCurrentDayFrozen && (
          <div
            style={{
              background: "linear-gradient(135deg, #E8F4FD, #D4ECFB)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#A8D4F0",
            }}
          >
            <Snowflake size={22} weight="duotone" color="#5B9BD5" />
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#2E6B9E",
                }}
              >
                Bu kun muzlatilgan
              </div>
              <div style={{ fontSize: 11, color: "#5B9BD5" }}>
                Dam olish kuni — qabul yo'q
              </div>
            </div>
          </div>
        )}

        {/* Time period cards */}
        <div style={{ position: "relative" }}>
          {isCurrentDayFrozen && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(232,244,253,0.6)",
                zIndex: 10,
                borderRadius: 16,
                backdropFilter: "blur(1px)",
              }}
            />
          )}
        {SLOT_TIME_PERIODS.map((period) => {
          const PIcon = period.Icon;
          const periodBooked = period.slots.filter((s) =>
            bookedTimes.includes(s),
          );
          return (
            <div
              key={period.label}
              style={{
                background: "white",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: isCurrentDayFrozen ? "#A8D4F0" : "#C8D8E8",
                borderRadius: 16,
                marginBottom: 14,
                overflow: "hidden",
                opacity: isCurrentDayFrozen ? 0.5 : 1,
                transition: "opacity 0.2s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #E4ECF2",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: "#E0F5F3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PIcon
                      size={18}
                      weight="duotone"
                      color="#1FA89A"
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0E2A4A",
                      }}
                    >
                      {period.label}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#6B8099" }}
                    >
                      {period.range}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color:
                      periodBooked.length > 0
                        ? "#E67E22"
                        : "#1FA89A",
                  }}
                >
                  {periodBooked.length}/{period.slots.length}{" "}
                  band
                </div>
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {period.slots.map((slot) => {
                  const bookedAppt = bookedAppts.find(
                    (a) => a.time === slot,
                  );
                  const isBooked = !!bookedAppt;
                  return (
                    <div
                      key={slot}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: isBooked
                          ? "#FFFAF5"
                          : "#F5FBF9",
                        borderWidth: 1.5,
                        borderStyle: "solid",
                        borderColor: isBooked
                          ? "#F5E0C3"
                          : "#D5EDE9",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* Time badge */}
                      <div
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          background: isBooked
                            ? "#E67E22"
                            : "#1FA89A",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                          fontFamily: "'DM Sans', sans-serif",
                          minWidth: 52,
                          textAlign: "center",
                        }}
                      >
                        {slot}
                      </div>

                      {isBooked && bookedAppt ? (
                        /* Booked: show patient info */
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #E67E22, #F39C12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {bookedAppt.patientName.charAt(0)}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#0E2A4A",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {bookedAppt.patientName}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#9B7B5A",
                              }}
                            >
                              Faol
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Free slot */
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              color: "#1FA89A",
                              fontWeight: 500,
                            }}
                          >
                            Bo'sh
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>

        {/* Freeze/unfreeze button */}
        <button
          onClick={() => {
            const updated = toggleFrozenDay(activeSlotDate);
            setFrozenDays(updated);
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            background: isCurrentDayFrozen
              ? "#E0F5F3"
              : "#E8F4FD",
            border: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: isCurrentDayFrozen ? "#1FA89A" : "#5B9BD5",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 4,
            transition: "all 0.2s ease",
          }}
        >
          <Snowflake
            size={18}
            weight={isCurrentDayFrozen ? "regular" : "duotone"}
          />
          {isCurrentDayFrozen
            ? "Muzlatishni olib tashlash"
            : "Bu kunni muzlatish"}
        </button>
      </div>
    );
  };

  /* ===== STATISTICS TAB ===== */
  const [statsDateFrom, setStatsDateFrom] = useState("");
  const [statsDateTo, setStatsDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const renderStatistics = () => {
    const filtered = appointments.filter((a) => {
      // Extract YYYY-MM-DD from appointment date
      let dateStr = a.date;
      // a.date could be like "11 Mart" or "2026-03-11"
      // Try to find the SCHEDULE_DATES match
      const matchedDate = SCHEDULE_DATES.find(
        (d) =>
          a.date.includes(d.full) || a.date.includes(d.value),
      );
      if (matchedDate) dateStr = matchedDate.value;
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return true; // include if can't parse

      if (statsDateFrom && dateStr < statsDateFrom)
        return false;
      if (statsDateTo && dateStr > statsDateTo) return false;
      return true;
    });

    const totalAppts = filtered.length;

    // By type
    const typeMap: Record<string, number> = {};
    filtered.forEach((a) => {
      typeMap[a.type] = (typeMap[a.type] || 0) + 1;
    });
    const typeEntries = Object.entries(typeMap).sort(
      (a, b) => b[1] - a[1],
    );

    // Unique patients
    const uniquePatients = new Set(
      filtered.map((a) => a.patientId),
    ).size;

    // Total services count
    const totalServices = services.reduce(
      (sum, cat) => sum + cat.services.length,
      0,
    );

    // Total reviews
    const totalReviews = reviews.length;

    // Busiest day
    const dayMap: Record<string, number> = {};
    filtered.forEach((a) => {
      const matchedDate = SCHEDULE_DATES.find(
        (d) =>
          a.date.includes(d.full) || a.date.includes(d.value),
      );
      if (matchedDate) {
        dayMap[matchedDate.value] =
          (dayMap[matchedDate.value] || 0) + 1;
      }
    });
    const busiestDay = Object.entries(dayMap).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Program participants count
    const programParticipants = filtered.filter(
      (a) => a.type === "Dasturga qo'shilish",
    ).length;

    const isFiltered = statsDateFrom || statsDateTo;

    return (
      <div style={{ padding: "16px 20px 0px 20px" }}>
        {/* Date filter */}
        {/* <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
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
            <Funnel
              size={16}
              weight="duotone"
              color="#6B8099"
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0E2A4A",
              }}
            >
              Sana bo'yicha filtrlash
            </div>
            {isFiltered && (
              <button
                onClick={() => {
                  setStatsDateFrom("");
                  setStatsDateTo("");
                }}
                style={{
                  marginLeft: "auto",
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#FDECEC",
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#E74C3C",
                  cursor: "pointer",
                }}
              >
                Tozalash
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Dan
              </label>
              <input
                type="date"
                value={statsDateFrom}
                onChange={(e) =>
                  setStatsDateFrom(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Gacha
              </label>
              <input
                type="date"
                value={statsDateTo}
                onChange={(e) => setStatsDateTo(e.target.value)}
                min={statsDateFrom || undefined}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          {isFiltered && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: 8,
                background: "#E0F5F3",
                fontSize: 11,
                color: "#1FA89A",
                fontWeight: 500,
              }}
            >
              {statsDateFrom
                ? formatDateUz(statsDateFrom)
                : "Boshidan"}{" "}
              —{" "}
              {statsDateTo
                ? formatDateUz(statsDateTo)
                : "Oxirigacha"}
            </div>
          )}
        </div> */}

        {/* Overview cards */}
        {/* <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E0F5F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarBlank
                  size={16}
                  weight="duotone"
                  color="#1FA89A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0E2A4A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {totalAppts}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Jami qabullar
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E8F0F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users
                  size={16}
                  weight="duotone"
                  color="#0E2A4A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0E2A4A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {uniquePatients}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Bemorlar soni
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E0F5F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendUp
                  size={16}
                  weight="duotone"
                  color="#1FA89A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1FA89A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {programParticipants}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Dastur ishtirokchilari
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#FFF4E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star
                  size={16}
                  weight="duotone"
                  color="#E67E22"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#E67E22",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {totalReviews}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Sharhlar
            </div>
          </div>

        </div> */}
        {/* Date filter */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
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
            <Funnel
              size={16}
              weight="duotone"
              color="#6B8099"
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0E2A4A",
              }}
            >
              Sana bo'yicha filtrlash
            </div>
            {isFiltered && (
              <button
                onClick={() => {
                  setStatsDateFrom("");
                  setStatsDateTo("");
                }}
                style={{
                  marginLeft: "auto",
                  padding: "3px 10px",
                  borderRadius: 6,
                  background: "#FDECEC",
                  border: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#E74C3C",
                  cursor: "pointer",
                }}
              >
                Tozalash
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Dan
              </label>
              <input
                type="date"
                value={statsDateFrom}
                onChange={(e) =>
                  setStatsDateFrom(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "#6B8099",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Gacha
              </label>
              <input
                type="date"
                value={statsDateTo}
                onChange={(e) => setStatsDateTo(e.target.value)}
                min={statsDateFrom || undefined}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: 10,
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  color: "#0E2A4A",
                  background: "#F5F9FC",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          {isFiltered && (
            <div
              style={{
                marginTop: 8,
                padding: "6px 10px",
                borderRadius: 8,
                background: "#E0F5F3",
                fontSize: 11,
                color: "#1FA89A",
                fontWeight: 500,
              }}
            >
              {statsDateFrom
                ? formatDateUz(statsDateFrom)
                : "Boshidan"}{" "}
              —{" "}
              {statsDateTo
                ? formatDateUz(statsDateTo)
                : "Oxirigacha"}
            </div>
          )}
        </div>

        {/* Overview cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {/* Total appointments */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E0F5F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarBlank
                  size={16}
                  weight="duotone"
                  color="#1FA89A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0E2A4A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {totalAppts}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Jami qabullar
            </div>
          </div>

          {/* Unique patients */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E8F0F8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users
                  size={16}
                  weight="duotone"
                  color="#0E2A4A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0E2A4A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {uniquePatients}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Bemorlar soni
            </div>
          </div>

          {/* Approval rate */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#E0F5F3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrendUp
                  size={16}
                  weight="duotone"
                  color="#1FA89A"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#1FA89A",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {programParticipants}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Dastur ishtirokchilari
            </div>
          </div>

          {/* Reviews */}
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "14px 16px",
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "#FFF4E6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star
                  size={16}
                  weight="duotone"
                  color="#E67E22"
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#E67E22",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {totalReviews}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6B8099",
                marginTop: 2,
              }}
            >
              Sharhlar
            </div>
          </div>

        </div>

        {/* Busiest day */}
        {busiestDay && (
          <div
            style={{
              background:
                "linear-gradient(135deg, #0E2A4A, #1A3D5C)",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              color: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <CalendarBlank
                size={18}
                weight="duotone"
                color="rgba(255,255,255,0.6)"
              />
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: 500,
                }}
              >
                Eng band kun
              </div>
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {formatDateUz(busiestDay[0])}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                marginTop: 2,
              }}
            >
              {busiestDay[1]} ta qabul
            </div>
          </div>
        )}

        {/* Services & slots summary */}
        <div
          style={{
            background: "white",
            borderRadius: 14,
            padding: "16px 18px",
            marginBottom: 16,
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#C8D8E8",
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
            <Stethoscope
              size={18}
              weight="duotone"
              color="#1FA89A"
            />
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#0E2A4A",
              }}
            >
              Umumiy ma'lumot
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#F5F9FC",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "#6B8099" }}>
                Xizmat turlari
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0E2A4A",
                }}
              >
                {services.length} kategoriya, {totalServices}{" "}
                xizmat
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#F5F9FC",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "#6B8099" }}>
                Jamoa a'zolari
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0E2A4A",
                }}
              >
                {teamMembers.length} kishi
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                background: "#F5F9FC",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "#6B8099" }}>
                Kunlik slot limiti
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#0E2A4A",
                }}
              >
                {DAILY_SLOT_LIMIT} ta
              </span>
            </div>
            {slotConfig && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#F5F9FC",
                  borderRadius: 10,
                }}
              >
                <span
                  style={{ fontSize: 12, color: "#6B8099" }}
                >
                  Ochiq davr
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#0E2A4A",
                  }}
                >
                  {getDayCount(
                    slotConfig.openDate,
                    slotConfig.endDate,
                  )}{" "}
                  kun
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Appointments by type */}
        {typeEntries.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: "16px 18px",
              marginBottom: 16,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#C8D8E8",
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
              <ChartBar
                size={18}
                weight="duotone"
                color="#1FA89A"
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0E2A4A",
                }}
              >
                Xizmat turi bo'yicha
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {typeEntries.map(([type, count]) => {
                const pct =
                  totalAppts > 0
                    ? Math.round((count / totalAppts) * 100)
                    : 0;
                return (
                  <div key={type}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#0E2A4A",
                          fontWeight: 500,
                        }}
                      >
                        {type}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "#6B8099",
                        }}
                      >
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "#E8F0F8",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 3,
                          background:
                            "linear-gradient(90deg, #1FA89A, #2BC4B4)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ===== TAB TITLES ===== */
  const tabTitles: Record<AdminTab, string> = {
    appointments: "Qabullar",
    slots: "Dastur slotlari",
    services: "Xizmatlar",
    team: "Jamoamiz",
    reviews: "Sharhlar",
    faq: "FAQ savollar",
    users: "Bemorlar",
    statistics: "Statistika",
  };

  const tabSubtitles: Record<AdminTab, string> = {
    appointments: "Barcha qabul so'rovlarini boshqaring",
    slots: "Slotlarni ochish va boshqarish",
    services: "Xizmat va narxlarni boshqaring",
    team: "Jamoa a'zolarini boshqaring",
    reviews: "Bemor sharhlarini ko'ring",
    faq: "Ko'p beriladigan savollar",
    users: "Barcha bemorlar ma'lumotlari",
    statistics: "Umumiy statistik ma'lumotlar",
  };

  const showSubHeader = !selectedAppointment && !selectedUser;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        background: "#E8EEF4",
      }}
    >
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 480,
        background: "#F5F9FC",
        color: "#0E2A4A",
        boxShadow: "0 0 40px rgba(14,42,74,0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      {showSubHeader && (
        <div
          style={{
            background: "#0E2A4A",
            padding: "24px 20px 20px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 20,
                  color: "white",
                }}
              >
                {tabTitles[activeTab]}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {tabSubtitles[activeTab]}
              </div>
            </div>
            <button
              onClick={onBack}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(255,255,255,0.12)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Foydalanuvchi interfeysiga o'tish"
            >
              <UserSwitch
                size={22}
                weight="duotone"
                color="white"
              />
            </button>
          </div>
        </div>
      )}

      {/* Sub-header removed — titles moved to header */}

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 20,
        }}
      >
        {renderContent()}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "#FFEBEE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Prohibit
                  size={22}
                  weight="duotone"
                  color="#D32F2F"
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#0E2A4A",
                  }}
                >
                  Qabulni bekor qilish
                </div>
                <div style={{ fontSize: 12, color: "#6B8099" }}>
                  Sababni ko'rsating
                </div>
              </div>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Bekor qilish sababini yozing..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: "12px 14px",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#C8D8E8",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                resize: "vertical",
                outline: "none",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#F5F9FC",
                  color: "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmCancel}
                disabled={!rejectReason.trim()}
                style={{
                  flex: 1,
                  padding: 12,
                  background: !rejectReason.trim()
                    ? "#E4ECF2"
                    : "#D32F2F",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !rejectReason.trim()
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service modal */}
      {svcModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setSvcModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 16,
              }}
            >
              {svcModal.mode === "addCat"
                ? "Kategoriya qo'shish"
                : svcModal.mode === "editCat"
                  ? "Kategoriyani tahrirlash"
                  : svcModal.mode === "addItem"
                    ? "Xizmat qo'shish"
                    : "Xizmatni tahrirlash"}
            </div>
            {svcModal.mode === "addCat" ||
            svcModal.mode === "editCat" ? (
              <>
                <input
                  value={svcCatTitle}
                  onChange={(e) =>
                    setSvcCatTitle(e.target.value)
                  }
                  placeholder="Kategoriya nomi"
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
                    marginBottom: 10,
                    boxSizing: "border-box",
                  }}
                />
                <input
                  value={svcCatSubtitle}
                  onChange={(e) =>
                    setSvcCatSubtitle(e.target.value)
                  }
                  placeholder="Qisqa tavsif"
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
                    marginBottom: 10,
                    boxSizing: "border-box",
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6B8099",
                    marginBottom: 8,
                  }}
                >
                  Ikonka
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {(
                    [
                      "tooth",
                      "syringe",
                      "crown",
                      "sparkle",
                    ] as const
                  ).map((ic) => {
                    const IcComp = ICON_MAP_CAT[ic];
                    return (
                      <button
                        key={ic}
                        onClick={() => setSvcCatIcon(ic)}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          background:
                            svcCatIcon === ic
                              ? "#E0F5F3"
                              : "#F5F9FC",
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderColor:
                            svcCatIcon === ic
                              ? "#1FA89A"
                              : "transparent",
                        }}
                      >
                        <IcComp
                          size={20}
                          weight="duotone"
                          color={
                            svcCatIcon === ic
                              ? "#1FA89A"
                              : "#6B8099"
                          }
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <input
                  value={svcItemName}
                  onChange={(e) =>
                    setSvcItemName(e.target.value)
                  }
                  placeholder="Xizmat nomi"
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
                    marginBottom: 10,
                    boxSizing: "border-box",
                  }}
                />
                <input
                  value={svcItemPrice}
                  onChange={(e) =>
                    setSvcItemPrice(e.target.value)
                  }
                  placeholder="Narxi (masalan: 400 000)"
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
                    marginBottom: 16,
                    boxSizing: "border-box",
                  }}
                />
              </>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setSvcModal(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#F5F9FC",
                  color: "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={
                  svcModal.mode === "addCat" ||
                  svcModal.mode === "editCat"
                    ? saveCategory
                    : saveServiceItem
                }
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#1FA89A",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team modal */}
      {teamModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setTeamModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 16,
              }}
            >
              {teamModal.mode === "add"
                ? "A'zo qo'shish"
                : "A'zoni tahrirlash"}
            </div>
            <input
              value={tmName}
              onChange={(e) => setTmName(e.target.value)}
              placeholder="Ism (masalan: Dr. Nilufar)"
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
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <input
              value={tmRole}
              onChange={(e) => setTmRole(e.target.value)}
              placeholder="Lavozimi (masalan: Ortodont)"
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
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <input
              value={tmDesc}
              onChange={(e) => setTmDesc(e.target.value)}
              placeholder="Tavsif (masalan: 5 yil tajriba)"
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
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setTeamModal(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#F5F9FC",
                  color: "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={saveTeam}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#1FA89A",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ modal */}
      {faqModal && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setFaqModal(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              width: "100%",
              maxWidth: 380,
              boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 16,
              }}
            >
              {faqModal.mode === "add"
                ? "Savol qo'shish"
                : "Savolni tahrirlash"}
            </div>
            <input
              value={faqQ}
              onChange={(e) => setFaqQ(e.target.value)}
              placeholder="Savol"
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
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <textarea
              value={faqA}
              onChange={(e) => setFaqA(e.target.value)}
              placeholder="Javob"
              style={{
                width: "100%",
                minHeight: 100,
                padding: "12px 14px",
                borderWidth: 1.5,
                borderStyle: "solid",
                borderColor: "#C8D8E8",
                borderRadius: 12,
                fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                resize: "vertical",
                outline: "none",
                marginBottom: 16,
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setFaqModal(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#F5F9FC",
                  color: "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={saveFaq}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#1FA89A",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review delete confirm */}
      {deletingReviewId && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,42,74,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setDeletingReviewId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 20,
              padding: "24px",
              width: "100%",
              maxWidth: 340,
              boxShadow: "0 20px 60px rgba(14,42,74,0.2)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "#FFEBEE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Trash
                size={24}
                weight="duotone"
                color="#D32F2F"
              />
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#0E2A4A",
                marginBottom: 6,
              }}
            >
              Sharhni o'chirish
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6B8099",
                marginBottom: 20,
                lineHeight: 1.5,
              }}
            >
              Bu sharhni o'chirishni xohlaysizmi? Bu amalni
              qaytarib bo'lmaydi.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setDeletingReviewId(null)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#F5F9FC",
                  color: "#5A7A96",
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: "#C8D8E8",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDeleteReview}
                style={{
                  flex: 1,
                  padding: 12,
                  background: "#D32F2F",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Boshqalar" Right Drawer */}
      {showMoreDrawer && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2500,
          }}
          onClick={() => closeDrawer()}
        >
          {/* Backdrop */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(14,42,74,0.4)",
              transition: "opacity 0.28s ease",
              opacity: drawerVisible ? 1 : 0,
            }}
          />
          {/* Drawer */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 260,
              background: "white",
              boxShadow: "-8px 0 30px rgba(14,42,74,0.15)",
              display: "flex",
              flexDirection: "column",
              transition:
                "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              transform: drawerVisible
                ? "translateX(0)"
                : "translateX(100%)",
            }}
          >
            <div
              style={{
                padding: "24px 20px 16px",
                background: "#0E2A4A",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: 17,
                    color: "white",
                  }}
                >
                  Boshqalar
                </div>
                <button
                  onClick={() => closeDrawer()}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} color="white" />
                </button>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                Qo'shimcha bo'limlar
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
              {drawerTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <React.Fragment key={tab.id}>
                    {idx > 0 && (
                      <div
                        style={{
                          height: 1,
                          background: "#E8EEF4",
                          margin: "2px 16px",
                        }}
                      />
                    )}
                  <button
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedAppointment(null);
                      setSelectedUser(null);
                      closeDrawer();
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: "pointer",
                      border: "none",
                      marginBottom: 0,
                      background: isActive
                        ? "#E0F5F3"
                        : "#FAFCFE",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: isActive
                          ? "#1FA89A"
                          : "#F5F9FC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={20}
                        weight={isActive ? "fill" : "duotone"}
                        color={isActive ? "white" : "#6B8099"}
                      />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isActive
                            ? "#1FA89A"
                            : "#0E2A4A",
                        }}
                      >
                        {tab.label}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          marginLeft: "auto",
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#1FA89A",
                        }}
                      />
                    )}
                  </button>
                  </React.Fragment>
                );
              })}
            </div>
            <button
              onClick={() => {
                closeDrawer();
                onBack();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                width: "100%",
                padding: "10px 0 8px",
                paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
                borderTop: "1px solid #C8D8E8",
                border: "none",
                borderTopWidth: 1,
                borderTopStyle: "solid",
                borderTopColor: "#C8D8E8",
                background: "#0E2A4A",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                flexShrink: 0,
              }}
            >
              <UserSwitch size={37} weight="duotone" color="white" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                Foydalanuvchi interfeysi
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Bottom Nav — 4 tabs */}
      <div
        style={{
          display: "flex",
          flexShrink: 0,
          borderTop: "1px solid #C8D8E8",
          background: "rgba(245,249,252,0.97)",
          backdropFilter: "blur(12px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isMore = tab.id === "more";
          const isActive = isMore
            ? drawerTabs.some((dt) => dt.id === activeTab)
            : activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isMore) {
                  openDrawer();
                } else {
                  setActiveTab(tab.id as AdminTab);
                  setSelectedAppointment(null);
                  setSelectedUser(null);
                }
              }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                padding: "10px 0 8px",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Icon
                size={20}
                weight="regular"
                color={isActive ? "#1FA89A" : "#6B8099"}
              />
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: isActive ? "#1FA89A" : "#6B8099",
                  letterSpacing: "0.3px",
                }}
              >
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
    </div>
  );
}
