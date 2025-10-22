import { useMemo, useState } from "react";

export type AssetType =
  | "headshot"
  | "bio"
  | "results_pdf"
  | "intro_video"
  | "testimonial"
  | "activation_idea";

export type SponsorAsset = {
  id: string;
  type: AssetType;
  label: string;
  url?: string;
  createdAt: string;
};

export type SponsorTask = {
  id: string;
  title: string;
  dueDate: string;
  done: boolean;
  category?: "meeting" | "outreach" | "activation";
  prospectId?: string | null;
};

export type ProspectStage = "Lead" | "Contacted" | "Meeting" | "Proposal" | "Won" | "Lost";

export type Prospect = {
  id: string;
  business: string;
  contactName: string;
  email: string;
  phone: string;
  segment: string;
  city: string;
  notes: string;
  stage: ProspectStage;
  nextAction: string;
  value: number;
  closeDate: string;
};

export type Activation = {
  id: string;
  prospectId: string;
  date: string;
  type: string;
  attendees: number;
  qrScans: number;
  redemptions: number;
  signups: number;
  clipsDelivered: number;
};

export type Profile = {
  id: string;
  name: string;
  club: string;
  city: string;
  ranking: string;
  phone: string;
  email: string;
  headshotUrl?: string;
  bio?: string;
  introVideoUrl?: string;
  activationIdeas: string[];
};

export type SponsorCampaign = {
  id: string;
  name: string;
  objective: string;
  targetSegment: string;
  offerSummary: string;
  deliverables: string[];
  timeline: string;
  investment: string;
  notes: string;
  lastUpdated: string;
};

export type ReadinessAnswers = {
  resultsProof: boolean;
  testimonialCount: number;
  clubTouchpoints: number;
  activationHours: number;
  alignedSegments: string[];
  complianceAck: boolean;
};

export type ReadinessReport = {
  id: string;
  name: string;
  answers: ReadinessAnswers;
  score: number;
  gaps: string[];
  nextSteps: string[];
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_SEGMENTS = [
  "Café/Restaurant",
  "Physio/Chiro/Gym",
  "Retail/Sport",
  "Education/Club",
  "Health/Recovery",
  "Financial",
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const initialProfile: Profile = {
  id: "player-1",
  name: "Alex Rivera",
  club: "Sunset Tennis Club",
  city: "Austin, TX",
  ranking: "USTA 5.0 / ITF 820",
  phone: "(512) 555-0148",
  email: "alex@playersbudget.app",
  headshotUrl: "/images/demo-headshot.jpg",
  bio: "Local tour-level lefty competing on the ITF circuit while running youth clinics in Austin. I average 4 events per month with community partners and track every redemption via QR and codes.",
  introVideoUrl: "https://player.vimeo.com/video/123456789",
  activationIdeas: [
    "Saturday doubles and dine bundle",
    "Post-match recovery clinic with live demos",
    "Neighborhood rally + QR offer for first visit",
  ],
};

const initialAssets: SponsorAsset[] = [
  {
    id: "asset-1",
    type: "headshot",
    label: "Pro headshot",
    url: "/images/demo-headshot.jpg",
    createdAt: "2025-02-01",
  },
  {
    id: "asset-2",
    type: "bio",
    label: "150 word bio",
    createdAt: "2025-02-02",
  },
  {
    id: "asset-3",
    type: "results_pdf",
    label: "Results & ranking PDF",
    createdAt: "2025-02-04",
  },
  {
    id: "asset-4",
    type: "intro_video",
    label: "30s intro video",
    url: "https://player.vimeo.com/video/123456789",
    createdAt: "2025-02-05",
  },
  {
    id: "asset-5",
    type: "testimonial",
    label: "Testimonial – Coach Dana",
    createdAt: "2025-02-08",
  },
  {
    id: "asset-6",
    type: "testimonial",
    label: "Testimonial – Clinic parent",
    createdAt: "2025-02-09",
  },
  {
    id: "asset-7",
    type: "activation_idea",
    label: "Activation idea – Matchday receipt promo",
    createdAt: "2025-02-11",
  },
  {
    id: "asset-8",
    type: "activation_idea",
    label: "Activation idea – Recovery pop-up",
    createdAt: "2025-02-11",
  },
  {
    id: "asset-9",
    type: "activation_idea",
    label: "Activation idea – Community school visit",
    createdAt: "2025-02-12",
  },
];

const initialProspects: Prospect[] = [
  {
    id: "prospect-1",
    business: "Rally Café",
    contactName: "Melissa Ortiz",
    email: "melissa@rallycafe.com",
    phone: "(512) 555-1023",
    segment: "Café/Restaurant",
    city: "Austin, TX",
    notes: "Loved the Saturday clinic idea; wants to see flyer samples.",
    stage: "Proposal",
    nextAction: "Drop flyer mockups Thu 4PM",
    value: 3200,
    closeDate: "2025-02-20",
  },
  {
    id: "prospect-2",
    business: "RecoverLab Physio",
    contactName: "Dr. Dan Brooks",
    email: "dan@recoverlab.com",
    phone: "(512) 555-4490",
    segment: "Physio/Chiro/Gym",
    city: "Austin, TX",
    notes: "Needs clinic dates and lead capture plan. Zoom booked.",
    stage: "Meeting",
    nextAction: "Zoom Tue 10:30 AM",
    value: 5400,
    closeDate: "2025-03-01",
  },
  {
    id: "prospect-3",
    business: "FreshFade Grooming",
    contactName: "Ty Coleman",
    email: "ty@freshfade.co",
    phone: "(512) 555-9921",
    segment: "Barbershop/Salon",
    city: "Round Rock, TX",
    notes: "Interested in tournament week special. Needs metrics.",
    stage: "Contacted",
    nextAction: "Send one-pager & metrics deck",
    value: 1800,
    closeDate: "2025-02-28",
  },
  {
    id: "prospect-4",
    business: "TopSpin Racket Shop",
    contactName: "Lina Patel",
    email: "lina@topspinshop.com",
    phone: "(512) 555-7770",
    segment: "Racket Shop",
    city: "Austin, TX",
    notes: "Scheduling in-store stringing demo.",
    stage: "Meeting",
    nextAction: "Confirm Saturday demo time",
    value: 2600,
    closeDate: "2025-03-06",
  },
  {
    id: "prospect-5",
    business: "RiverBank Credit Union",
    contactName: "Sonia Park",
    email: "sparks@riverbankcu.org",
    phone: "(512) 555-6612",
    segment: "Credit Union",
    city: "Georgetown, TX",
    notes: "Considering youth financial literacy clinics.",
    stage: "Lead",
    nextAction: "Call to scope school partnership",
    value: 7200,
    closeDate: "2025-03-20",
  },
  {
    id: "prospect-6",
    business: "Serve & Sip Bistro",
    contactName: "Elena Tran",
    email: "elena@serveandsip.com",
    phone: "(210) 555-7701",
    segment: "Café/Restaurant",
    city: "San Antonio, TX",
    notes: "Interested in post-match brunch activations.",
    stage: "Lead",
    nextAction: "Send activation outline with costs",
    value: 2600,
    closeDate: "2025-03-05",
  },
  {
    id: "prospect-7",
    business: "CourtFit Recovery",
    contactName: "Marcos Ledez",
    email: "marcos@courtfitrecovery.com",
    phone: "(713) 555-2109",
    segment: "Physio/Chiro/Gym",
    city: "Houston, TX",
    notes: "Testing QR trial vouchers; wants more metrics.",
    stage: "Meeting",
    nextAction: "Share demo clips and ROI snapshot",
    value: 4800,
    closeDate: "2025-03-12",
  },
  {
    id: "prospect-8",
    business: "Baseline Coffee",
    contactName: "Hannah Lee",
    email: "hannah@baselinecoffee.com",
    phone: "(972) 555-4311",
    segment: "Café/Restaurant",
    city: "Dallas, TX",
    notes: "Interested in youth-day activations.",
    stage: "Contacted",
    nextAction: "Schedule discovery call",
    value: 3100,
    closeDate: "2025-03-18",
  },
];

const today = new Date();
const initialTasks: SponsorTask[] = [
  {
    id: "task-1",
    title: "Finalize flyer for Rally Café clinic",
    dueDate: todayISO(),
    done: false,
    category: "activation",
    prospectId: "prospect-1",
  },
  {
    id: "task-2",
    title: "Zoom with RecoverLab Physio",
    dueDate: new Date(today.getTime() + 2 * 86400000).toISOString().slice(0, 10),
    done: false,
    category: "meeting",
    prospectId: "prospect-2",
  },
  {
    id: "task-3",
    title: "Send metrics snapshot to FreshFade",
    dueDate: todayISO(),
    done: false,
    category: "outreach",
    prospectId: "prospect-3",
  },
  {
    id: "task-4",
    title: "Confirm demo schedule with TopSpin",
    dueDate: new Date(today.getTime() + 86400000).toISOString().slice(0, 10),
    done: false,
    category: "meeting",
    prospectId: "prospect-4",
  },
];

const initialActivations: Activation[] = [
  {
    id: "act-1",
    prospectId: "prospect-4",
    date: "2025-10-01",
    type: "Clinic",
    attendees: 14,
    qrScans: 15,
    redemptions: 7,
    signups: 6,
    clipsDelivered: 3,
  },
  {
    id: "act-2",
    prospectId: "prospect-5",
    date: "2025-10-04",
    type: "Clinic",
    attendees: 35,
    qrScans: 45,
    redemptions: 27,
    signups: 19,
    clipsDelivered: 8,
  },
  {
    id: "act-3",
    prospectId: "prospect-5",
    date: "2025-10-07",
    type: "Recovery pop-up",
    attendees: 34,
    qrScans: 46,
    redemptions: 35,
    signups: 18,
    clipsDelivered: 4,
  },
  {
    id: "act-4",
    prospectId: "prospect-1",
    date: "2025-10-10",
    type: "Demo",
    attendees: 31,
    qrScans: 22,
    redemptions: 16,
    signups: 15,
    clipsDelivered: 3,
  },
  {
    id: "act-5",
    prospectId: "prospect-6",
    date: "2025-10-13",
    type: "Demo",
    attendees: 32,
    qrScans: 37,
    redemptions: 20,
    signups: 17,
    clipsDelivered: 7,
  },
  {
    id: "act-6",
    prospectId: "prospect-7",
    date: "2025-10-16",
    type: "Demo",
    attendees: 22,
    qrScans: 15,
    redemptions: 7,
    signups: 11,
    clipsDelivered: 3,
  },
  {
    id: "act-7",
    prospectId: "prospect-3",
    date: "2025-10-19",
    type: "School visit",
    attendees: 21,
    qrScans: 16,
    redemptions: 8,
    signups: 6,
    clipsDelivered: 4,
  },
  {
    id: "act-8",
    prospectId: "prospect-2",
    date: "2025-10-22",
    type: "School visit",
    attendees: 16,
    qrScans: 21,
    redemptions: 13,
    signups: 7,
    clipsDelivered: 4,
  },
  {
    id: "act-9",
    prospectId: "prospect-1",
    date: "2025-10-25",
    type: "Demo",
    attendees: 34,
    qrScans: 42,
    redemptions: 24,
    signups: 20,
    clipsDelivered: 4,
  },
  {
    id: "act-10",
    prospectId: "prospect-2",
    date: "2025-10-28",
    type: "Demo",
    attendees: 17,
    qrScans: 18,
    redemptions: 12,
    signups: 8,
    clipsDelivered: 4,
  },
  {
    id: "act-11",
    prospectId: "prospect-2",
    date: "2025-10-31",
    type: "Demo",
    attendees: 31,
    qrScans: 36,
    redemptions: 26,
    signups: 14,
    clipsDelivered: 3,
  },
  {
    id: "act-12",
    prospectId: "prospect-1",
    date: "2025-11-03",
    type: "School visit",
    attendees: 35,
    qrScans: 33,
    redemptions: 23,
    signups: 17,
    clipsDelivered: 3,
  },
];

const initialCampaigns: SponsorCampaign[] = [
  {
    id: "campaign-1",
    name: "Rally Café Off-Day Clinic",
    objective: "Drive weekend foot traffic and loyalty signups for the café using on-court activations.",
    targetSegment: "Local cafés and hospitality partners near tournament sites.",
    offerSummary:
      "Two-hour off-day clinic with branded stations, QR offer for first visit, post-event recap with metrics within 48h.",
    deliverables: [
      "2-hour themed clinic for 18–24 participants",
      "QR + receipt offer with 30-day expiry",
      "Photo reel + 5 vertical clips within 48h",
      "Metrics dashboard (scans, redemptions, signups)",
    ],
    timeline: "Ideal lead time 10–14 days before the event. Review flyer assets 7 days out. Recap delivered within 48h.",
    investment: "$1,800 activation fee · add-on: $350 microsite, $250 email drip",
    notes: "Works well during early rounds. Bundle with recovery partner to increase ARPU.",
    lastUpdated: todayISO(),
  },
  {
    id: "campaign-2",
    name: "RecoverLab Match Recovery Pop-Up",
    objective: "Position RecoverLab as the go-to physio partner with live demos and trial offers.",
    targetSegment: "Physio/Chiro/Gym partners who want proof-of-performance content.",
    offerSummary:
      "Courtside recovery pop-up with guided demos, trial vouchers, and follow-up content clips for Reels/Shorts.",
    deliverables: [
      "Three 30-minute recovery demos with live attendee Q&A",
      "Trial voucher QR with lead capture",
      "Professional photo set + 6 reels delivered in 72h",
      "ROI report with QR scans, redemptions, signups",
    ],
    timeline: "Book 2–3 weeks ahead to secure venue approvals. Collect testimonial during activation.",
    investment: "$2,750 activation fee · $600 add-on for advanced analytics dashboard",
    notes: "Include co-branded stretching guide PDF for post-event drip.",
    lastUpdated: todayISO(),
  },
];

const DEFAULT_READINESS_ANSWERS: ReadinessAnswers = {
  resultsProof: true,
  testimonialCount: 2,
  clubTouchpoints: 3,
  activationHours: 3,
  alignedSegments: ["Café/Restaurant", "Physio/Chiro/Gym", "Retail/Sport"],
  complianceAck: true,
};

const computeReadiness = (answers: ReadinessAnswers) => {
  const weights = {
    credibility: 20,
    proKit: 20,
    localMarketability: 20,
    activationCapacity: 15,
    sponsorFit: 15,
    compliance: 10,
  } as const;

  const credibility =
    (answers.resultsProof ? 1 : 0) * (weights.credibility * 0.6) +
    Math.min(answers.testimonialCount, 2) / 2 * (weights.credibility * 0.4);

  const proKit =
    Math.min(answers.testimonialCount, 2) / 2 * (weights.proKit * 0.4) +
    (answers.activationHours >= 3 ? weights.proKit * 0.6 : weights.proKit * 0.3);

  const localMarketability = Math.min(answers.clubTouchpoints, 3) / 3 * weights.localMarketability;
  const activationCapacity = Math.min(answers.activationHours, 4) / 4 * weights.activationCapacity;
  const sponsorFit = Math.min(answers.alignedSegments.length, 3) / 3 * weights.sponsorFit;
  const compliance = answers.complianceAck ? weights.compliance : 0;

  const score = Math.round(credibility + proKit + localMarketability + activationCapacity + sponsorFit + compliance);

  const gaps: string[] = [];
  const nextSteps: string[] = [];

  if (!answers.resultsProof) {
    gaps.push("Upload results or ranking proof.");
    nextSteps.push("Add your latest results PDF to the pack.");
  }
  if (answers.testimonialCount < 2) {
    gaps.push("Secure at least two testimonials.");
    nextSteps.push("Request testimonials from a coach and clinic parent.");
  }
  if (answers.clubTouchpoints < 2) {
    gaps.push("Increase club/school touchpoints.");
    nextSteps.push("Schedule outreach with two local clubs this week.");
  }
  if (answers.activationHours < 2) {
    gaps.push("Set aside activation hours.");
    nextSteps.push("Block two 90-minute activation windows next week.");
  }
  if (answers.alignedSegments.length < 3) {
    gaps.push("Clarify top sponsor segments.");
    nextSteps.push("Map three sponsor segments aligned to your routine.");
  }
  if (!answers.complianceAck) {
    gaps.push("Acknowledge brand/safe topic guidelines.");
    nextSteps.push("Draft compliance notes before sponsor meetings.");
  }

  while (nextSteps.length < 3) {
    nextSteps.push("Review Sponsor Pack and update activation menu with real examples.");
  }

  return { score, gaps, nextSteps: nextSteps.slice(0, 5) };
};

const initialReadinessReports: ReadinessReport[] = [(() => {
  const summary = computeReadiness(DEFAULT_READINESS_ANSWERS);
  return {
    id: "readiness-1",
    name: "Austin Swing",
    answers: DEFAULT_READINESS_ANSWERS,
    score: summary.score,
    gaps: summary.gaps,
    nextSteps: summary.nextSteps,
    createdAt: todayISO(),
    updatedAt: todayISO(),
  } as ReadinessReport;
})()];

const PACK_REQUIREMENTS: { label: string; satisfied: (profile: Profile, assets: SponsorAsset[]) => boolean }[] =
  [
    {
      label: "Headshot",
      satisfied: (profile, assets) => Boolean(profile.headshotUrl) || assets.some((a) => a.type === "headshot"),
    },
    {
      label: "150–200 word bio",
      satisfied: (profile, assets) =>
        Boolean(profile.bio && profile.bio.length >= 120) || assets.some((a) => a.type === "bio"),
    },
    {
      label: "Results/Ranking PDF",
      satisfied: (_, assets) => assets.some((a) => a.type === "results_pdf"),
    },
    {
      label: "30s intro video",
      satisfied: (profile, assets) =>
        Boolean(profile.introVideoUrl) || assets.some((a) => a.type === "intro_video"),
    },
    {
      label: "2 testimonials",
      satisfied: (_, assets) => assets.filter((a) => a.type === "testimonial").length >= 2,
    },
    {
      label: "3 activation ideas",
      satisfied: (profile, assets) =>
        profile.activationIdeas.length >= 3 || assets.filter((a) => a.type === "activation_idea").length >= 3,
    },
  ];

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persistToStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // noop
  }
}

export function useSponsorsData() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [assets, setAssets] = useState<SponsorAsset[]>(initialAssets);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [tasks, setTasks] = useState<SponsorTask[]>(initialTasks);
  const [activations, setActivations] = useState<Activation[]>(initialActivations);
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>(() => loadFromStorage("pb_campaigns", initialCampaigns));
  const [readinessReports, setReadinessReports] = useState<ReadinessReport[]>(() =>
    loadFromStorage("pb_readiness_reports", initialReadinessReports),
  );

  const checklist = useMemo(
    () =>
      PACK_REQUIREMENTS.map((item) => ({
        label: item.label,
        done: item.satisfied(profile, assets),
      })),
    [profile, assets],
  );

  const packCompletion = useMemo(() => {
    const total = PACK_REQUIREMENTS.length;
    const done = checklist.filter((c) => c.done).length;
    return {
      done,
      total,
      percent: Math.round((done / total) * 100),
    };
  }, [checklist]);

  const meetings = useMemo(() => {
    const now = new Date();
    const sevenDaysOut = new Date(now.getTime() + 7 * 86400000);
    const meetingTasks = tasks.filter((task) => task.category === "meeting");
    const upcoming7 = meetingTasks.filter((task) => {
      const due = new Date(task.dueDate);
      return due >= now && due <= sevenDaysOut;
    }).length;
    return {
      total: meetingTasks.length,
      next7: upcoming7,
    };
  }, [tasks]);

  const upcomingActivations = useMemo(() => {
    const now = new Date(todayISO());
    return activations.filter((act) => new Date(act.date) >= now).length;
  }, [activations]);

  const leadMetrics = useMemo(() => {
    const totals = activations.reduce(
      (acc, act) => {
        acc.qr += act.qrScans;
        acc.redemptions += act.redemptions;
        acc.signups += act.signups;
        return acc;
      },
      { qr: 0, redemptions: 0, signups: 0 },
    );
    return totals;
  }, [activations]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<ProspectStage, number> = {
      Lead: 0,
      Contacted: 0,
      Meeting: 0,
      Proposal: 0,
      Won: 0,
      Lost: 0,
    };
    prospects.forEach((p) => {
      counts[p.stage] = (counts[p.stage] ?? 0) + 1;
    });
    return counts;
  }, [prospects]);

  const markTaskDone = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, done: true } : task)),
    );
  };

  const createTask = (task: Omit<SponsorTask, "id" | "done">) => {
    setTasks((prev) => [
      ...prev,
      {
        ...task,
        id: crypto.randomUUID(),
        done: false,
      },
    ]);
  };

  const updateProspectStage = (id: string, stage: ProspectStage) => {
    setProspects((prev) => prev.map((prospect) => (prospect.id === id ? { ...prospect, stage } : prospect)));
  };

  const updateProspect = (id: string, update: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((prospect) =>
        prospect.id === id
          ? {
              ...prospect,
              ...update,
            }
          : prospect,
      ),
    );
  };

  const createProspect = (prospect: Partial<Prospect>) => {
    const id = crypto.randomUUID();
    const now = todayISO();
    const newProspect: Prospect = {
      id,
      business: prospect.business ?? "New Partner",
      contactName: prospect.contactName ?? "",
      email: prospect.email ?? "",
      phone: prospect.phone ?? "",
      segment: prospect.segment ?? DEFAULT_SEGMENTS[0],
      city: prospect.city ?? "",
      notes: prospect.notes ?? "",
      stage: prospect.stage ?? "Lead",
      nextAction: prospect.nextAction ?? "",
      value: prospect.value ?? 0,
      closeDate: prospect.closeDate ?? now,
    };
    setProspects((prev) => [...prev, newProspect]);
    return id;
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((prospect) => prospect.id !== id));
  };

  const exportProspects = () => {
    const header = [
      "Business",
      "Contact Name",
      "Email",
      "Phone",
      "Segment",
      "City",
      "Stage",
      "Next Action",
      "Value",
      "Close Date",
      "Notes",
    ];
    const rows = prospects.map((prospect) => [
      prospect.business,
      prospect.contactName,
      prospect.email,
      prospect.phone,
      prospect.segment,
      prospect.city,
      prospect.stage,
      prospect.nextAction,
      prospect.value.toString(),
      prospect.closeDate,
      prospect.notes,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sponsor-pipeline-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addActivation = (activation: Omit<Activation, "id">) => {
    const id = crypto.randomUUID();
    const newActivation: Activation = {
      ...activation,
      id,
    };
    setActivations((prev) => [...prev, newActivation]);
    return id;
  };

  const updateActivation = (id: string, update: Partial<Omit<Activation, "id">>) => {
    setActivations((prev) =>
      prev.map((activation) => (activation.id === id ? { ...activation, ...update } : activation)),
    );
  };

  const deleteActivation = (id: string) => {
    setActivations((prev) => prev.filter((activation) => activation.id !== id));
  };

  const exportActivations = (format: "csv" | "json" = "csv") => {
    const rows = activations.map((activation) => ({
      date: activation.date,
      prospectId: activation.prospectId,
      type: activation.type,
      attendees: activation.attendees,
      qrScans: activation.qrScans,
      redemptions: activation.redemptions,
      signups: activation.signups,
      clipsDelivered: activation.clipsDelivered,
    }));

    if (format === "json") {
      const jsonBlob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonLink = document.createElement("a");
      jsonLink.href = jsonUrl;
      jsonLink.download = `activation-metrics-${todayISO()}.json`;
      document.body.appendChild(jsonLink);
      jsonLink.click();
      document.body.removeChild(jsonLink);
      URL.revokeObjectURL(jsonUrl);
      return;
    }

    const header = [
      "Date",
      "Prospect ID",
      "Type",
      "Attendees",
      "QR Scans",
      "Redemptions",
      "Signups",
      "Clips Delivered",
    ];

    const csv = [header, ...rows.map((row) => [
      row.date,
      row.prospectId,
      row.type,
      row.attendees.toString(),
      row.qrScans.toString(),
      row.redemptions.toString(),
      row.signups.toString(),
      row.clipsDelivered.toString(),
    ])]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const csvUrl = URL.createObjectURL(csvBlob);
    const csvLink = document.createElement("a");
    csvLink.href = csvUrl;
    csvLink.download = `activation-metrics-${todayISO()}.csv`;
    document.body.appendChild(csvLink);
    csvLink.click();
    document.body.removeChild(csvLink);
    URL.revokeObjectURL(csvUrl);
  };

  const createCampaign = (campaign: Omit<SponsorCampaign, "id" | "lastUpdated">) => {
    const id = crypto.randomUUID();
    setCampaigns((prev) => {
      const next = [
        ...prev,
        {
          ...campaign,
          id,
          deliverables: campaign.deliverables.filter((item) => item.trim().length > 0),
          lastUpdated: new Date().toISOString(),
        },
      ];
      persistToStorage("pb_campaigns", next);
      return next;
    });
    return id;
  };

  const updateCampaign = (id: string, update: Partial<Omit<SponsorCampaign, "id">>) => {
    setCampaigns((prev) => {
      const next = prev.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              ...update,
              deliverables:
                update.deliverables !== undefined
                  ? update.deliverables.filter((item) => item.trim().length > 0)
                  : campaign.deliverables,
              lastUpdated: new Date().toISOString(),
            }
          : campaign,
      );
      persistToStorage("pb_campaigns", next);
      return next;
    });
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => {
      const next = prev.filter((campaign) => campaign.id !== id);
      persistToStorage("pb_campaigns", next);
      return next;
    });
  };

  const duplicateCampaign = (id: string) => {
    const campaign = campaigns.find((item) => item.id === id);
    if (!campaign) return null;
    return createCampaign({
      name: `${campaign.name} (Copy)`,
      objective: campaign.objective,
      targetSegment: campaign.targetSegment,
      offerSummary: campaign.offerSummary,
      deliverables: [...campaign.deliverables],
      timeline: campaign.timeline,
      investment: campaign.investment,
      notes: campaign.notes,
    });
  };

  const createReadinessReport = (input: Omit<ReadinessReport, "id" | "createdAt" | "updatedAt">) => {
    const id = crypto.randomUUID();
    setReadinessReports((prev) => {
      const next = [
        ...prev,
        {
          ...input,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      persistToStorage("pb_readiness_reports", next);
      return next;
    });
    return id;
  };

  const updateReadinessReport = (id: string, input: Omit<ReadinessReport, "id" | "createdAt" | "updatedAt">) => {
    setReadinessReports((prev) => {
      const next = prev.map((report) =>
        report.id === id
          ? {
              ...report,
              ...input,
              updatedAt: new Date().toISOString(),
            }
          : report,
      );
      persistToStorage("pb_readiness_reports", next);
      return next;
    });
  };

  const deleteReadinessReport = (id: string) => {
    setReadinessReports((prev) => {
      const next = prev.filter((report) => report.id !== id);
      persistToStorage("pb_readiness_reports", next);
      return next;
    });
  };

  const duplicateReadinessReport = (id: string) => {
    const report = readinessReports.find((item) => item.id === id);
    if (!report) return null;
    return createReadinessReport({
      name: `${report.name} (Copy)`,
      answers: { ...report.answers },
      score: report.score,
      gaps: [...report.gaps],
      nextSteps: [...report.nextSteps],
    });
  };

  return {
    profile,
    setProfile,
    assets,
    setAssets,
    prospects,
    updateProspectStage,
    updateProspect,
    createProspect,
    deleteProspect,
    exportProspects,
    tasks,
    markTaskDone,
    createTask,
    activations,
    addActivation,
    updateActivation,
    deleteActivation,
    exportActivations,
    campaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    duplicateCampaign,
    readinessReports,
    createReadinessReport,
    updateReadinessReport,
    deleteReadinessReport,
    duplicateReadinessReport,
    checklist,
    packCompletion,
    meetings,
    upcomingActivations,
    leadMetrics,
    pipelineCounts,
  };
}
