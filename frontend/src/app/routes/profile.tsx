import React from "react";
import { useOutletContext, useNavigate } from "react-router";
import { ProfilePage } from "../components/profile-page";
import type { LayoutContext } from "../types";

export default function ProfileRoute() {
  const { state, onOpenSection } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  return (
    <ProfilePage
      state={state}
      onOpenSection={onOpenSection}
      onNavigateToAdmin={() => navigate("/admin")}
    />
  );
}
