import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

type ProofItem = {
  id: string;
  quote: string;
  org: string | null;
  city?: string | null;
  attendees?: number | null;
  qrScans?: number | null;
  redemptions?: number | null;
  signups?: number | null;
  media_url?: string | null;
  blurred?: boolean;
};

type ProofMasonryProps = {
  items: ProofItem[];
  blurVariant: boolean;
};

export default function ProofMasonry({ items, blurVariant }: ProofMasonryProps) {
  const decorated = useMemo(() => {
    if (!blurVariant || items.length < 2) return items;
    const clone = [...items];
    for (let i = clone.length - 2; i < clone.length; i += 1) {
      if (clone[i]) clone[i].blurred = true;
    }
    return clone;
  }, [items, blurVariant]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Recent wins near you</h3>
        {blurVariant && (
          <Button variant="ghost" className="text-primary">
            Unlock more local examples → Start free
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decorated.map((item) => (
          <Card
            key={item.id}
            className={item.blurred ? "relative overflow-hidden" : ""}
          >
            {item.blurred && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 grid place-items-center">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium">Unlock more local proof</p>
                  <Button variant="default" size="sm">
                    Start free
                  </Button>
                </div>
              </div>
            )}
            <CardContent className="space-y-3 p-4">
              <p className="text-sm leading-relaxed">“{item.quote}”</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.org && <Badge variant="outline">{item.org}</Badge>}
                {item.city && <span>{item.city}</span>}
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {typeof item.attendees === "number" && (
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-1">
                    {item.attendees} attendees
                  </span>
                )}
                {typeof item.qrScans === "number" && (
                  <span className="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                    {item.qrScans} QR scans
                  </span>
                )}
                {typeof item.redemptions === "number" && (
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-1">
                    {item.redemptions} redemptions
                  </span>
                )}
                {typeof item.signups === "number" && (
                  <span className="rounded-full bg-purple-100 text-purple-700 px-2 py-1">
                    {item.signups} signups
                  </span>
                )}
              </div>
              {item.media_url && !item.blurred && (
                <img
                  src={item.media_url}
                  alt="Activation proof"
                  className="rounded-md border object-cover h-32 w-full"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
