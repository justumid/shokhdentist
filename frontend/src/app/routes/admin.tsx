import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AdminPanel } from "../components/admin-panel";
import { api } from "../api/client";

export default function AdminRoute() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Verify admin access
    const checkAdmin = async () => {
      try {
        const response = await api.init();
        if (response.success && response.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Not admin - redirect to profile
          navigate("/profile", { replace: true });
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
        navigate("/profile", { replace: true });
      }
    };
    checkAdmin();
  }, [navigate]);
  
  // Loading state
  if (isAdmin === null) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100dvh",
        background: "#F5F9FC"
      }}>
        <div style={{ fontSize: 14, color: "#5A7A9A" }}>Tekshirilmoqda...</div>
      </div>
    );
  }
  
  // Not admin - will redirect via useEffect
  if (!isAdmin) {
    return null;
  }
  
  // Is admin - show panel
  return <AdminPanel onBack={() => navigate("/profile")} />;
}
