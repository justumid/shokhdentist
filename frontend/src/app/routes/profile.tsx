import React, { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router";
import { ProfilePage } from "../components/profile-page";
import { api } from "../api/client";
import type { LayoutContext } from "../types";

export default function ProfileRoute() {
  const { state, onOpenSection } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Check admin status
    const checkAdmin = async () => {
      try {
        const response = await api.init();
        if (response.success && response.isAdmin) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };
    checkAdmin();
  }, []);
  
  return (
    <ProfilePage
      state={state}
      onOpenSection={onOpenSection}
      onNavigateToAdmin={isAdmin ? () => navigate("/admin") : undefined}
    />
  );
}
