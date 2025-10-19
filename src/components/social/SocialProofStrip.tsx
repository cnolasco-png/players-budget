import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type SocialProofStripProps = {
  stats: {
    total_attendees: number;
    total_qr_scans: number;
    avg_time_to_first_sponsor: number;
  };
};

const formatNumber = (value: number) => value.toLocaleString();

export default function SocialProofStrip({ stats }: SocialProofStripProps) {
  return (
    <div className="bg-gradient-to-r from-emerald-900 to-emerald-700 text-white rounded-3xl px-6 py-8 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="uppercase text-sm tracking-wide text-emerald-100">Proven local impact</p>
          <h2 className="text-3xl font-semibold">
            Community-first sponsorships that move your business forward in weeks, not months.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
          <Card className="bg-white/10 border-none text-left">
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">{formatNumber(stats.total_attendees)}+</p>
              <p className="text-sm text-emerald-100">attendees reached</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none text-left">
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">{formatNumber(stats.total_qr_scans)}+</p>
              <p className="text-sm text-emerald-100">QR scans tracked</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-none text-left">
            <CardContent className="p-4">
              <p className="text-2xl font-semibold">
                {stats.avg_time_to_first_sponsor ? stats.avg_time_to_first_sponsor.toFixed(0) : 17} days
              </p>
              <p className="text-sm text-emerald-100">to land the first sponsor</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" className="bg-white text-emerald-800 hover:bg-white/90">
          Start free → land your first sponsor
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
