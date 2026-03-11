import { useState, useCallback, useEffect } from "react";
import api from "../api/client";

const SK = "shokh_v2";
const LAST_SYNC_KEY = "shokh_last_sync";

export interface PatientState {
  [key: string]: any;
  fullName?: string;
  phone?: string;
  birthDate?: string;
  email?: string;
  address?: string;
  job?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  diabet?: boolean;
  heart?: boolean;
  bp?: boolean;
  allergy?: string;
  meds?: string;
  pregnancy?: string;
  lastVisit?: string;
  toothpain?: boolean;
  gumbleed?: boolean;
  sensitivity?: boolean;
  bruxism?: boolean;
  otherComplaint?: string;
  photoConsent?: boolean;
  programConsent?: boolean;
  bleedDur?: string;
  bleedWhen?: string[];
  brushFreq?: string;
  floss?: string;
  badBreath?: boolean;
  smoking?: boolean;
  complaint?: string;
  hasSubmitted?: boolean;
  requestType?: string;
}

export interface Section {
  id: string;
  title: string;
  iconId: string;
  weight: number;
}

export const SECTIONS: Section[] = [
  { id: "personal", title: "Shaxsiy ma'lumotlar", iconId: "user", weight: 30 },
  { id: "medical", title: "Tibbiy tarix", iconId: "firstAid", weight: 20 },
  { id: "dental", title: "Tish tarixi", iconId: "tooth", weight: 20 },
  { id: "consent", title: "Tasdiqlash", iconId: "clipboard", weight: 10 },
  { id: "consult", title: "Konsultatsiya anketa", iconId: "notePencil", weight: 20 },
];

export const PROFILE_SECTIONS = SECTIONS.filter((s) => s.id !== "consult" && s.id !== "consent");
export const CONSULT_SECTION = SECTIONS.find((s) => s.id === "consult")!;

export const REQ: Record<string, string[]> = {
  personal: ["fullName", "phone", "birthDate"],
  medical: ["diabet", "heart", "bp"],
  dental: ["toothpain", "gumbleed"],
  consent: ["photoConsent", "programConsent"],
  consult: ["bleedDur"],
};

function loadState(): PatientState {
  try {
    return JSON.parse(localStorage.getItem(SK) || "{}");
  } catch {
    return {};
  }
}

function saveStateToDisk(d: PatientState) {
  localStorage.setItem(SK, JSON.stringify(d));
}

function getLastSync(): number {
  try {
    return parseInt(localStorage.getItem(LAST_SYNC_KEY) || "0");
  } catch {
    return 0;
  }
}

function setLastSync() {
  localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
}

export function sectionPct(state: PatientState, id: string): number {
  const r = REQ[id];
  if (!r) return 0;
  return Math.round(
    (r.filter((k) => state[k] !== undefined && state[k] !== "" && state[k] !== null).length / r.length) * 100
  );
}

export function totalPct(state: PatientState): number {
  return Math.round(
    SECTIONS.reduce((t, s) => t + (sectionPct(state, s.id) / 100) * s.weight, 0)
  );
}

export function profilePct(state: PatientState): number {
  const totalWeight = PROFILE_SECTIONS.reduce((t, s) => t + s.weight, 0);
  return Math.round(
    PROFILE_SECTIONS.reduce((t, s) => t + (sectionPct(state, s.id) / 100) * s.weight, 0) / totalWeight * 100
  );
}

export function sectionStatus(state: PatientState, id: string): "done" | "partial" | "empty" {
  const p = sectionPct(state, id);
  return p === 100 ? "done" : p > 0 ? "partial" : "empty";
}

export function usePatientState() {
  const [state, setState] = useState<PatientState>(loadState);
  const [syncing, setSyncing] = useState(false);

  // Load from backend on mount if we haven't synced recently (5 minutes)
  useEffect(() => {
    const lastSync = getLastSync();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - lastSync > fiveMinutes) {
      api.getPatientState()
        .then((response) => {
          if (response.patientState) {
            const backendState = response.patientState;
            // Merge with local state (backend wins)
            setState((prev) => {
              const merged = { ...prev, ...backendState };
              saveStateToDisk(merged);
              return merged;
            });
            setLastSync();
            console.log('[Patient State] Synced from backend');
          }
        })
        .catch((error) => {
          console.warn('[Patient State] Failed to sync from backend:', error);
          // Continue with local state
        });
    }
  }, []);

  const updateState = useCallback((updates: Partial<PatientState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      saveStateToDisk(next);
      
      // Sync to backend (fire and forget, with debounce)
      setSyncing(true);
      api.savePatientState(next)
        .then(() => {
          console.log('[Patient State] Saved to backend');
          setLastSync();
        })
        .catch((error) => {
          console.warn('[Patient State] Failed to save to backend:', error);
          // Still saved locally, backend will sync later
        })
        .finally(() => setSyncing(false));
      
      return next;
    });
  }, []);

  const mergeState = useCallback((updates: Record<string, any>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      saveStateToDisk(next);
      
      // Sync to backend
      setSyncing(true);
      api.savePatientState(next)
        .then(() => {
          console.log('[Patient State] Saved to backend');
          setLastSync();
        })
        .catch((error) => {
          console.warn('[Patient State] Failed to save to backend:', error);
        })
        .finally(() => setSyncing(false));
      
      return next;
    });
  }, []);

  return { state, updateState, mergeState, syncing };
}
