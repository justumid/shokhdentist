import React from "react";
import { useOutletContext } from "react-router";
import { AppointmentPage } from "../components/appointment-page";
import type { LayoutContext } from "../types";

export default function AppointmentRoute() {
  const { state, startWizard, mergeState, onShowToast, slotPickerRequested, slotPickerType, clearSlotPickerRequest } = useOutletContext<LayoutContext>();
  return (
    <AppointmentPage
      state={state}
      startWizard={startWizard}
      onUpdateState={mergeState}
      onShowToast={onShowToast}
      slotPickerRequested={slotPickerRequested}
      slotPickerType={slotPickerType}
      clearSlotPickerRequest={clearSlotPickerRequest}
    />
  );
}
