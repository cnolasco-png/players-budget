import { useMemo } from "react";
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
import type { Activation } from "@/hooks/useSponsorsData";

type ActivationMetricsProps = {
  activations: Activation[];
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

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7; // Monday as start
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function ActivationMetrics({ activations }: ActivationMetricsProps) {
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
      .slice(-8);
  }, [activations]);

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Activation metrics</CardTitle>
          <CardDescription>
            Weekly view of events delivered and the offline metrics that prove value to partners.
          </CardDescription>
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
                <Line type="monotone" dataKey="events" stroke="#2563eb" strokeWidth={2} dot={false} name="Events held" />
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
      </Card>
    </section>
  );
}

export default ActivationMetrics;
