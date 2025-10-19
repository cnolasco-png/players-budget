import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Prospect, ProspectStage } from "@/hooks/useSponsorsData";
import { cn } from "@/lib/utils";

const STAGE_COLORS: Record<ProspectStage, string> = {
  Lead: "bg-slate-100 text-slate-700",
  Contacted: "bg-blue-100 text-blue-700",
  Meeting: "bg-amber-100 text-amber-700",
  Proposal: "bg-purple-100 text-purple-700",
  Won: "bg-emerald-100 text-emerald-700",
  Lost: "bg-rose-100 text-rose-700",
};

type DealsBoardProps = {
  prospects: Prospect[];
  onStageChange: (id: string, stage: ProspectStage) => void;
};

export function DealsBoard({ prospects, onStageChange }: DealsBoardProps) {
  const totalPipeline = useMemo(
    () => prospects.filter((prospect) => prospect.stage !== "Lost").reduce((sum, p) => sum + p.value, 0),
    [prospects],
  );

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader>
          <CardTitle>Deals board</CardTitle>
          <CardDescription>
            Track local partners from lead to signed activation. Update stages inline and keep next actions tight.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Next action</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Close date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">
                    <div>{prospect.business}</div>
                    <div className="text-xs text-muted-foreground">{prospect.city}</div>
                  </TableCell>
                  <TableCell>
                    <div>{prospect.contactName}</div>
                    <div className="text-xs text-muted-foreground">{prospect.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{prospect.segment}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={prospect.stage}
                      onValueChange={(value) => onStageChange(prospect.id, value as ProspectStage)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(STAGE_COLORS).map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{prospect.nextAction}</TableCell>
                  <TableCell>${prospect.value.toLocaleString()}</TableCell>
                  <TableCell>{new Date(prospect.closeDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            Pipeline value: <span className="font-semibold text-foreground">${totalPipeline.toLocaleString()}</span>
          </div>
          <Button variant="outline" size="sm">
            Export to CSV
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}

export default DealsBoard;
