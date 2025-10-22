import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { Activation, Prospect } from "@/hooks/useSponsorsData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RANGE_OPTIONS: { label: string; value: 4 | 8 | 12 }[] = [
  { label: "Last 4 weeks", value: 4 },
  { label: "Last 8 weeks", value: 8 },
  { label: "Last 12 weeks", value: 12 },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday start
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export type ActivationMetricsProps = {
  activations: Activation[];
  prospects: Prospect[];
  onCreateActivation: (activation: Omit<Activation, "id">) => string;
  onUpdateActivation: (id: string, update: Partial<Omit<Activation, "id">>) => void;
  onDeleteActivation: (id: string) => void;
  onExport: (format?: "csv" | "json") => void;
};

type WeeklyPoint = {
  week: string;
  events: number;
  attendees: number;
  qrScans: number;
  redemptions: number;
  signups: number;
  clips: number;
};

export default function ActivationMetrics({
  activations,
  prospects,
  onCreateActivation,
  onUpdateActivation,
  onDeleteActivation,
  onExport,
}: ActivationMetricsProps) {
  const { toast } = useToast();
  const [range, setRange] = useState<4 | 8 | 12>(8);
  const [newActivation, setNewActivation] = useState<Omit<Activation, "id">>({
    prospectId: prospects[0]?.id ?? "",
    date: todayISO(),
    type: "Clinic",
    attendees: 0,
    qrScans: 0,
    redemptions: 0,
    signups: 0,
    clipsDelivered: 0,
  });

  const prospectMap = useMemo(() => {
    const map = new Map<string, Prospect>();
    prospects.forEach((prospect) => map.set(prospect.id, prospect));
    return map;
  }, [prospects]);

  const weeklyData = useMemo(() => {
    const map = new Map<string, WeeklyPoint>();

    activations.forEach((activation) => {
      const date = new Date(activation.date + "T00:00:00");
      const weekStart = startOfWeek(date).toISOString().slice(0, 10);

      if (!map.has(weekStart)) {
        map.set(weekStart, {
          week: weekStart,
          events: 0,
          attendees: 0,
          qrScans: 0,
          redemptions: 0,
          signups: 0,
          clips: 0,
        });
      }

      const entry = map.get(weekStart)!;
      entry.events += 1;
      entry.attendees += activation.attendees;
      entry.qrScans += activation.qrScans;
      entry.redemptions += activation.redemptions;
      entry.signups += activation.signups;
      entry.clips += activation.clipsDelivered;
    });

    return Array.from(map.values())
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(range * -1);
  }, [activations, range]);

  const handleAddActivation = () => {
    if (!newActivation.prospectId) {
      toast({ title: "Select partner", description: "Assign this activation to a sponsor prospect.", variant: "destructive" });
      return;
    }

    onCreateActivation(newActivation);
    toast({ title: "Activation logged", description: "Metrics updated." });
    setNewActivation((prev) => ({
      ...prev,
      date: todayISO(),
      attendees: 0,
      qrScans: 0,
      redemptions: 0,
      signups: 0,
      clipsDelivered: 0,
    }));
  };

  return (
    <section className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Activation metrics</CardTitle>
            <CardDescription>Weekly view of delivered events and ROI metrics.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={String(range)} onValueChange={(value) => setRange(Number(value) as 4 | 8 | 12)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                {RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => onExport("csv")}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onExport("json")}>
              <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="events" stroke="#2563eb" strokeWidth={2} dot={false} name="Events" />
                <Line type="monotone" dataKey="attendees" stroke="#0f766e" strokeWidth={2} dot={false} name="Attendees" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="qrScans" stroke="#f59e0b" strokeWidth={2} dot={false} name="QR scans" />
                <Line type="monotone" dataKey="redemptions" stroke="#7c3aed" strokeWidth={2} dot={false} name="Code redemptions" />
                <Line type="monotone" dataKey="signups" stroke="#dc2626" strokeWidth={2} dot={false} name="Email signups" />
                <Line type="monotone" dataKey="clips" stroke="#0284c7" strokeWidth={2} dot={false} name="Clips delivered" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>

        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground">Log a new activation</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Prospect</Label>
                <Select value={newActivation.prospectId} onValueChange={(value) => setNewActivation((prev) => ({ ...prev, prospectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {prospects.map((prospect) => (
                      <SelectItem key={prospect.id} value={prospect.id}>
                        {prospect.business}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Date</Label>
                <Input type="date" value={newActivation.date} onChange={(event) => setNewActivation((prev) => ({ ...prev, date: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Type</Label>
                <Input value={newActivation.type} onChange={(event) => setNewActivation((prev) => ({ ...prev, type: event.target.value }))} placeholder="Clinic, pop-up, demo" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Attendees</Label>
                <Input type="number" value={newActivation.attendees} onChange={(event) => setNewActivation((prev) => ({ ...prev, attendees: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">QR scans</Label>
                <Input type="number" value={newActivation.qrScans} onChange={(event) => setNewActivation((prev) => ({ ...prev, qrScans: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Redemptions</Label>
                <Input type="number" value={newActivation.redemptions} onChange={(event) => setNewActivation((prev) => ({ ...prev, redemptions: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Email signups</Label>
                <Input type="number" value={newActivation.signups} onChange={(event) => setNewActivation((prev) => ({ ...prev, signups: Number(event.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide">Clips delivered</Label>
                <Input type="number" value={newActivation.clipsDelivered} onChange={(event) => setNewActivation((prev) => ({ ...prev, clipsDelivered: Number(event.target.value) }))} />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddActivation}>
                  <Plus className="mr-2 h-4 w-4" /> Add activation
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase text-muted-foreground">Activation log</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Partner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Attendees</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Clips</TableHead>
                    <TableHead className="w-[60px]">&nbsp;</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activations.map((activation) => (
                    <TableRow key={activation.id}>
                      <TableCell className="text-sm font-medium">
                        {prospectMap.get(activation.prospectId)?.business ?? "--"}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={activation.date}
                          onChange={(event) => onUpdateActivation(activation.id, { date: event.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={activation.type}
                          onChange={(event) => onUpdateActivation(activation.id, { type: event.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={activation.attendees}
                          onChange={(event) => onUpdateActivation(activation.id, { attendees: Number(event.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={activation.qrScans}
                          onChange={(event) => onUpdateActivation(activation.id, { qrScans: Number(event.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={activation.redemptions}
                          onChange={(event) => onUpdateActivation(activation.id, { redemptions: Number(event.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={activation.signups}
                          onChange={(event) => onUpdateActivation(activation.id, { signups: Number(event.target.value) })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={activation.clipsDelivered}
                          onChange={(event) => onUpdateActivation(activation.id, { clipsDelivered: Number(event.target.value) })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { onDeleteActivation(activation.id); toast({ title: "Activation removed" }); }}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {activations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground">
                        No activations logged yet. Add your first event above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
