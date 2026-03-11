import React from "react";
import { useOutletContext } from "react-router";
import { HomePage } from "../components/home-page";
import type { LayoutContext } from "../types";

export default function HomeRoute() {
  const { onNavigate, onShowConditions, onShowFaq, onShowReviews, onStartAppointment } = useOutletContext<LayoutContext>();
  return (
    <HomePage
      onNavigate={onNavigate}
      onShowConditions={onShowConditions}
      onShowFaq={onShowFaq}
      onShowReviews={onShowReviews}
      onStartAppointment={onStartAppointment}
    />
  );
}
