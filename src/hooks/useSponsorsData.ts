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
    prospectId: "prospect-1",
    date: new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10),
    type: "Clinic",
    attendees: 24,
    qrScans: 38,
    redemptions: 22,
    signups: 15,
    clipsDelivered: 5,
  },
  {
    id: "act-2",
    prospectId: "prospect-2",
    date: new Date(today.getTime() - 14 * 86400000).toISOString().slice(0, 10),
    type: "Recovery pop-up",
    attendees: 18,
    qrScans: 25,
    redemptions: 17,
    signups: 12,
    clipsDelivered: 5,
  },
  {
    id: "act-3",
    prospectId: "prospect-4",
    date: new Date(today.getTime() - 3 * 86400000).toISOString().slice(0, 10),
    type: "Stringing demo",
    attendees: 32,
    qrScans: 41,
    redemptions: 28,
    signups: 19,
    clipsDelivered: 4,
  },
  {
    id: "act-4",
    prospectId: "prospect-1",
    date: new Date(today.getTime() + 4 * 86400000).toISOString().slice(0, 10),
    type: "Clinic",
    attendees: 0,
    qrScans: 0,
    redemptions: 0,
    signups: 0,
    clipsDelivered: 0,
  },
];

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

export function useSponsorsData() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [assets, setAssets] = useState<SponsorAsset[]>(initialAssets);
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects);
  const [tasks, setTasks] = useState<SponsorTask[]>(initialTasks);
  const [activations, setActivations] = useState<Activation[]>(initialActivations);

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

  const addActivation = (activation: Omit<Activation, "id">) => {
    setActivations((prev) => [
      ...prev,
      {
        ...activation,
        id: crypto.randomUUID(),
      },
    ]);
  };

  return {
    profile,
    setProfile,
    assets,
    setAssets,
    prospects,
    updateProspectStage,
    tasks,
    markTaskDone,
    createTask,
    activations,
    addActivation,
    checklist,
    packCompletion,
    meetings,
    upcomingActivations,
    leadMetrics,
    pipelineCounts,
  };
}
