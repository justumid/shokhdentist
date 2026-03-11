import React from "react";
import { House } from "@phosphor-icons/react/dist/csr/House";
import { SquaresFour } from "@phosphor-icons/react/dist/csr/SquaresFour";
import { CalendarBlank } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { MapPin } from "@phosphor-icons/react/dist/csr/MapPin";
import { User } from "@phosphor-icons/react/dist/csr/User";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showDot: boolean;
}

const tabs = [
  { id: "home", icon: House, label: "Asosiy" },
  { id: "services", icon: SquaresFour, label: "Xizmatlar" },
  { id: "appt", icon: CalendarBlank, label: "Qabul" },
  { id: "contact", icon: MapPin, label: "Aloqa" },
  { id: "profile", icon: User, label: "Profil" },
];

export function TabBar({
  activeTab,
  onTabChange,
  showDot,
}: TabBarProps) {
  return (
    <div
      className="flex shrink-0 z-50"
      style={{
        borderTop: "1px solid #C8D8E8",
        background: "rgba(245,249,252,0.97)",
        backdropFilter: "blur(12px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center gap-[3px] py-[10px] pb-[8px] cursor-pointer relative border-none bg-transparent"
          >
            <Icon
              size={22}
              weight={isActive ? "fill" : "regular"}
              color={isActive ? "#1FA89A" : "#6B8099"}
            />
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                color: isActive ? "#1FA89A" : "#6B8099",
                letterSpacing: "0.3px",
              }}
            >
              {tab.label}
            </div>
            {tab.id === "profile" && showDot && null}
          </button>
        );
      })}
    </div>
  );
}