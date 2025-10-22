import { useEffect, useMemo, useState } from "react";

export type DaySlug = "day1" | "day2" | "day3" | "day4" | "day5" | "day6";
export const DAY_ORDER: DaySlug[] = ["day1", "day2", "day3", "day4", "day5", "day6"];

export type CourseFieldType = "text" | "textarea" | "number" | "url";

export type CourseField = {
  id: string;
  label: string;
  type: CourseFieldType;
  helper?: string;
  placeholder?: string;
  required?: boolean;
};

export const COURSE_FIELD_DEFS: Record<DaySlug, CourseField[]> = {
  day1: [
    {
      id: "vision",
      label: "3-Year Vision",
      type: "textarea",
      helper: "~150 words covering sport, wealth, relationships, contribution",
      required: true,
    },
    {
      id: "kpiSavingPercent",
      label: "Saving % target",
      type: "number",
      helper: "Example: 12",
      required: true,
    },
    {
      id: "kpiEmergencyMonths",
      label: "Emergency fund months",
      type: "number",
      helper: "Example: 4",
      required: true,
    },
    {
      id: "kpiEducationBudget",
      label: "Education / Up-skill budget (home currency)",
      type: "number",
      required: true,
    },
    {
      id: "kpiSeasonCapital",
      label: "Season capital target (home currency)",
      type: "number",
      required: true,
    },
    {
      id: "kpiSponsorsClinics",
      label: "% income from Sponsors/Clinics",
      type: "number",
      helper: "Example: 35",
      required: true,
    },
    {
      id: "kpiTaxProvision",
      label: "Tax provision %",
      type: "number",
      helper: "Example: 18",
      required: true,
    },
    {
      id: "moneyRules",
      label: "Personal money rules",
      type: "textarea",
      helper: "Write a list of binary rules (one per line).",
      required: true,
    },
  ],
  day2: [
    {
      id: "rateCardSummary",
      label: "Rate card summary",
      type: "textarea",
      helper: "Pricing notes, currency buffers, signature offers.",
      required: true,
    },
    {
      id: "opportunityList",
      label: "30-lead opportunity list notes",
      type: "textarea",
      helper: "Key clubs/SMEs you identified.",
      required: true,
    },
    {
      id: "actionsProof",
      label: "Proof of action",
      type: "textarea",
      helper: "What outreach was sent? Which clinic date is booked?",
      required: true,
    },
  ],
  day3: [
    {
      id: "seasonBudgetSummary",
      label: "Season budget summary",
      type: "textarea",
      helper: "Outline aggressive/optimal/conservative totals.",
      required: true,
    },
    {
      id: "templatesSaved",
      label: "Tournament templates saved",
      type: "text",
      helper: "List locations or filenames.",
      required: true,
    },
    {
      id: "vendorDirectory",
      label: "Vendor directory notes",
      type: "textarea",
      helper: "Stringer, physio, housing contacts for next 3 stops.",
      required: true,
    },
  ],
  day4: [
    {
      id: "runwayPolicy",
      label: "Runway policy",
      type: "textarea",
      helper: "Write the minimum months and trigger actions.",
      required: true,
    },
    {
      id: "approvedSchedules",
      label: "Two approved schedules",
      type: "textarea",
      helper: "Which schedules passed the ROI model?",
      required: true,
    },
    {
      id: "opsManual",
      label: "Cash operating manual",
      type: "textarea",
      helper: "Outline what happens when Yellow/Red alerts trigger.",
      required: true,
    },
  ],
  day5: [
    {
      id: "countryMap",
      label: "Country footprint map",
      type: "textarea",
      helper: "Summarize top 6 countries, tax/visa notes.",
      required: true,
    },
    {
      id: "insuranceChecklist",
      label: "Insurance checklist status",
      type: "textarea",
      helper: "What's covered, what's missing, next actions.",
      required: true,
    },
    {
      id: "taxDiary",
      label: "Tax diary entries",
      type: "textarea",
      helper: "Log the last 60 days of tournament income and locations.",
      required: true,
    },
  ],
  day6: [
    {
      id: "wealthPlan",
      label: "12-month wealth plan summary",
      type: "textarea",
      helper: "Saving %, investing %, debt plan.",
      required: true,
    },
    {
      id: "roadmap",
      label: "90-day action roadmap",
      type: "textarea",
      helper: "List the 9 tasks (3 per month).",
      required: true,
    },
    {
      id: "brandOnePager",
      label: "Personal brand one-pager link or notes",
      type: "textarea",
      helper: "Where is it saved? Key talking points?",
      required: true,
    },
  ],
};

const STORAGE_KEY = "players-budget:fmsa-course";

type DayState = {
  unlocked: boolean;
  completed: boolean;
  fields: Record<string, string>;
  completedAt: string | null;
};

type CourseState = Record<DaySlug, DayState>;

const createDefaultState = (): CourseState => {
  const base: Partial<CourseState> = {};
  DAY_ORDER.forEach((slug, index) => {
    const fieldDefs = COURSE_FIELD_DEFS[slug];
    const fields: Record<string, string> = {};
    fieldDefs.forEach((field) => {
      fields[field.id] = "";
    });
    base[slug] = {
      unlocked: index === 0,
      completed: false,
      fields,
      completedAt: null,
    };
  });
  return base as CourseState;
};

const loadState = (): CourseState => {
  if (typeof window === "undefined") return createDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw) as CourseState;
    const defaults = createDefaultState();
    // merge to ensure new fields exist
    DAY_ORDER.forEach((slug) => {
      const fieldDefs = COURSE_FIELD_DEFS[slug];
      const defaultFields = defaults[slug].fields;
      const existing = parsed[slug];
      if (!existing) {
        parsed[slug] = defaults[slug];
        return;
      }
      if (!existing.fields || typeof existing.fields !== "object") {
        existing.fields = {} as Record<string, string>;
      }
      fieldDefs.forEach((field) => {
        if (!(field.id in existing.fields)) {
          existing.fields[field.id] = defaultFields[field.id];
        }
      });
    });
    return parsed;
  } catch (error) {
    console.warn("Failed to parse FMSA course state", error);
    return createDefaultState();
  }
};

const persistState = (state: CourseState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to persist FMSA course state", error);
  }
};

export function useFMSACourse() {
  const [state, setState] = useState<CourseState>(createDefaultState());

  useEffect(() => {
    setState(loadState());
  }, []);

  const updateField = (day: DaySlug, fieldId: string, value: string) => {
    setState((prev) => {
      const next: CourseState = {
        ...prev,
        [day]: {
          ...prev[day],
          fields: {
            ...prev[day].fields,
            [fieldId]: value,
          },
        },
      };
      persistState(next);
      return next;
    });
  };

  const canMarkComplete = (day: DaySlug): boolean => {
    const fieldDefs = COURSE_FIELD_DEFS[day];
    const dayState = state[day];
    if (!dayState) return false;
    return fieldDefs.every((field) => {
      if (!field.required) return true;
      const value = dayState.fields[field.id];
      if (field.type === "number") {
        return value !== "" && !Number.isNaN(Number(value));
      }
      return value != null && value.toString().trim().length > 0;
    });
  };

  const markComplete = (day: DaySlug) => {
    if (!canMarkComplete(day)) return;
    setState((prev) => {
      const next = { ...prev };
      next[day] = {
        ...prev[day],
        completed: true,
        unlocked: true,
        completedAt: new Date().toISOString(),
      };
      const index = DAY_ORDER.indexOf(day);
      if (index !== -1 && index < DAY_ORDER.length - 1) {
        const nextDay = DAY_ORDER[index + 1];
        next[nextDay] = { ...next[nextDay], unlocked: true };
      }
      persistState(next);
      return next;
    });
  };

  const resetDay = (day: DaySlug) => {
    setState((prev) => {
      const defaults = createDefaultState();
      const next = {
        ...prev,
        [day]: {
          ...defaults[day],
          unlocked: prev[day].unlocked,
        },
      } as CourseState;
      persistState(next);
      return next;
    });
  };

  return {
    state,
    updateField,
    canMarkComplete,
    markComplete,
    resetDay,
  };
}
