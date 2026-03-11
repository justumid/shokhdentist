import type { PatientState } from "./components/use-patient-state";

export interface LayoutContext {
  state: PatientState;
  mergeState: (updates: Partial<PatientState>) => void;
  onOpenSection: (id: string) => void;
  startWizard: (requestType: string, firstStepId: string) => void;
  onShowToast: (msg: string) => void;
  onNavigate: (tab: string) => void;
  onShowConditions: () => void;
  onShowFaq: () => void;
  onShowReviews: () => void;
  onStartAppointment: (type: "free" | "paid") => void;
  slotPickerRequested: boolean;
  slotPickerType: "free" | "paid";
  clearSlotPickerRequest: () => void;
}
