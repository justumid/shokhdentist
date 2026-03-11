import React from "react";
import { useNavigate } from "react-router";
import { AdminPanel } from "../components/admin-panel";

export default function AdminRoute() {
  const navigate = useNavigate();
  return <AdminPanel onBack={() => navigate("/profile")} />;
}
