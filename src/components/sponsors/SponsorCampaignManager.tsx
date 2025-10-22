import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Download, FilePlus2, Save, Trash2, Copy } from "lucide-react";
import type { SponsorCampaign } from "@/hooks/useSponsorsData";

type NewCampaignInput = Omit<SponsorCampaign, "id" | "lastUpdated">;

type SponsorCampaignManagerProps = {
  campaigns: SponsorCampaign[];
  onCreate: (input: NewCampaignInput) => string;
  onUpdate: (id: string, update: Partial<Omit<SponsorCampaign, "id">>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => string | null;
};

const BLANK_CAMPAIGN: NewCampaignInput = {
  name: "New Campaign",
  objective: "",
  targetSegment: "",
  offerSummary: "",
  deliverables: [""],
  timeline: "",
  investment: "",
  notes: "",
};

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function sanitizeDeliverables(values: string[]): string[] {
  return values.map((value) => value.trim()).filter((value) => value.length > 0);
}

export default function SponsorCampaignManager({ campaigns, onCreate, onUpdate, onDelete, onDuplicate }: SponsorCampaignManagerProps) {
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string>(() => campaigns[0]?.id ?? "");
  const [draft, setDraft] = useState<NewCampaignInput>(BLANK_CAMPAIGN);
  const activeCampaign = useMemo(() => campaigns.find((campaign) => campaign.id === selectedId), [campaigns, selectedId]);

  useEffect(() => {
    if (!selectedId && campaigns[0]) {
      setSelectedId(campaigns[0].id);
      return;
    }

    if (activeCampaign) {
      setDraft({
        name: activeCampaign.name,
        objective: activeCampaign.objective,
        targetSegment: activeCampaign.targetSegment,
        offerSummary: activeCampaign.offerSummary,
        deliverables: activeCampaign.deliverables.length ? [...activeCampaign.deliverables] : [""] ,
        timeline: activeCampaign.timeline,
        investment: activeCampaign.investment,
        notes: activeCampaign.notes,
      });
    } else {
      setDraft(BLANK_CAMPAIGN);
    }
  }, [activeCampaign, campaigns, selectedId]);

  const handleCreate = () => {
    const id = onCreate({
      ...BLANK_CAMPAIGN,
      name: "New Campaign",
      deliverables: [""],
    });
    setSelectedId(id);
    toast({ title: "Campaign created", description: "Start filling in the details." });
  };

  const handleSave = () => {
    if (!selectedId) {
      const id = onCreate({
        ...draft,
        deliverables: sanitizeDeliverables(draft.deliverables),
      });
      setSelectedId(id);
      toast({ title: "Campaign saved", description: "Ready to share or export." });
      return;
    }

    onUpdate(selectedId, {
      ...draft,
      deliverables: sanitizeDeliverables(draft.deliverables),
    });
    toast({ title: "Campaign updated", description: "Changes have been saved." });
  };

  const handleDelete = () => {
    if (!selectedId) return;
    onDelete(selectedId);
    toast({ title: "Campaign deleted", description: "Removed from your library." });
    const remaining = campaigns.filter((campaign) => campaign.id !== selectedId);
    setSelectedId(remaining[0]?.id ?? "");
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const id = onDuplicate(selectedId);
    if (id) {
      setSelectedId(id);
      toast({ title: "Campaign duplicated", description: "Customize the copy for a new partner." });
    }
  };

  const handleDownloadBrief = () => {
    const campaign = activeCampaign ?? {
      ...draft,
      deliverables: sanitizeDeliverables(draft.deliverables),
      lastUpdated: new Date().toISOString(),
      id: "draft",
    };

    const content = [
      `Campaign: ${campaign.name}`,
      `Objective: ${campaign.objective}`,
      `Target segment: ${campaign.targetSegment}`,
      "",
      "Offer summary:",
      campaign.offerSummary,
      "",
      "Deliverables:",
      ...sanitizeDeliverables(campaign.deliverables).map((item) => `• ${item}`),
      "",
      `Timeline: ${campaign.timeline}`,
      `Investment: ${campaign.investment}`,
      campaign.notes ? `Notes: ${campaign.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    downloadTextFile(`${campaign.name.replace(/\s+/g, "-")}-brief.txt`, content);
  };

  const handleDownloadJson = () => {
    const campaign = activeCampaign ?? {
      ...draft,
      id: "draft",
      lastUpdated: new Date().toISOString(),
      deliverables: sanitizeDeliverables(draft.deliverables),
    };
    downloadJsonFile(`${campaign.name.replace(/\s+/g, "-")}-campaign.json`, campaign);
  };

  const updateDraftField = <K extends keyof NewCampaignInput>(key: K, value: NewCampaignInput[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setDraft((prev) => {
      const next = [...prev.deliverables];
      next[index] = value;
      return { ...prev, deliverables: next };
    });
  };

  const addDeliverable = () => {
    setDraft((prev) => ({ ...prev, deliverables: [...prev.deliverables, ""] }));
  };

  const removeDeliverable = (index: number) => {
    setDraft((prev) => {
      const next = prev.deliverables.filter((_, idx) => idx !== index);
      return { ...prev, deliverables: next.length ? next : [""] };
    });
  };

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Campaign Library</CardTitle>
            <CardDescription>Build, edit and export sponsor-ready activations tailored to each partner.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCreate}>
              <FilePlus2 className="mr-2 h-4 w-4" /> New campaign
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={!selectedId}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={!selectedId}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[240px,1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaigns</p>
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => setSelectedId(campaign.id)}
                  className={`w-full rounded-xl border p-3 text-left transition hover:border-emerald-400 hover:bg-emerald-50 ${
                    selectedId === campaign.id ? "border-emerald-500 bg-emerald-50" : "border-muted"
                  }`}
                >
                  <p className="font-medium text-emerald-900">{campaign.name}</p>
                  <p className="text-xs text-muted-foreground">Updated {new Date(campaign.lastUpdated).toLocaleDateString()}</p>
                  <Badge variant="outline" className="mt-2 border-emerald-200 text-emerald-700">
                    {campaign.targetSegment || "Segment"}
                  </Badge>
                </button>
              ))}
              {campaigns.length === 0 && <p className="text-xs text-muted-foreground">No campaigns yet. Create one to get started.</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign name</label>
                <Input value={draft.name} onChange={(event) => updateDraftField("name", event.target.value)} placeholder="Sponsor clinic accelerator" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target segment</label>
                <Input value={draft.targetSegment} onChange={(event) => updateDraftField("targetSegment", event.target.value)} placeholder="Cafés, hospitality, physio" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Objective</label>
              <Textarea
                rows={2}
                value={draft.objective}
                onChange={(event) => updateDraftField("objective", event.target.value)}
                placeholder="Drive weekend foot traffic with measurable ROI."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Offer summary</label>
              <Textarea
                rows={3}
                value={draft.offerSummary}
                onChange={(event) => updateDraftField("offerSummary", event.target.value)}
                placeholder="Outline the experience, tracking, deliverables and follow-up cadence."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Deliverables</label>
                <Button variant="ghost" size="sm" onClick={addDeliverable}>
                  Add item
                </Button>
              </div>
              <div className="space-y-2">
                {draft.deliverables.map((item, index) => (
                  <div key={`${index}-${selectedId}`} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(event) => updateDeliverable(index, event.target.value)}
                      placeholder="Example: QR offer with lead capture"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeDeliverable(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Timeline / run of show</label>
                <Textarea
                  rows={3}
                  value={draft.timeline}
                  onChange={(event) => updateDraftField("timeline", event.target.value)}
                  placeholder="Lead time, key milestones, follow-up windows."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment & add-ons</label>
                <Textarea
                  rows={3}
                  value={draft.investment}
                  onChange={(event) => updateDraftField("investment", event.target.value)}
                  placeholder="$1,800 activation fee · add-on: $350 microsite"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / backstage instructions</label>
              <Textarea
                rows={3}
                value={draft.notes}
                onChange={(event) => updateDraftField("notes", event.target.value)}
                placeholder="Remind team to capture testimonial on-site. Bundle with recovery partner when possible."
              />
            </div>
          </div>
        </CardContent>
        <Separator className="mx-6" />
        <CardFooter className="flex flex-wrap items-center gap-3 px-6 py-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save campaign
          </Button>
          <Button variant="outline" onClick={handleDownloadBrief}>
            <Download className="mr-2 h-4 w-4" /> Download brief
          </Button>
          <Button variant="outline" onClick={handleDownloadJson}>
            <Download className="mr-2 h-4 w-4" /> Download JSON
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
