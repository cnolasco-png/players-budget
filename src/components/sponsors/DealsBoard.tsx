import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Download } from "lucide-react";
import type { Prospect, ProspectStage } from "@/hooks/useSponsorsData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  onUpdateProspect: (id: string, update: Partial<Prospect>) => void;
  onCreateProspect: (prospect?: Partial<Prospect>) => string;
  onDeleteProspect: (id: string) => void;
  onExport: () => void;
};

export function DealsBoard({ prospects, onStageChange, onUpdateProspect, onCreateProspect, onDeleteProspect, onExport }: DealsBoardProps) {
  const { toast } = useToast();
  const totalPipeline = useMemo(
    () => prospects.filter((prospect) => prospect.stage !== "Lost").reduce((sum, p) => sum + p.value, 0),
    [prospects],
  );

  return (
    <section className="space-y-4">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Deals board</CardTitle>
            <CardDescription>
              Track local partners from lead to signed activation. Update stages inline and keep next actions tight.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => {
              const id = onCreateProspect({});
              toast({ title: "Prospect created", description: "Fill in the row to personalize this opportunity." });
            }}>
              <Plus className="mr-2 h-4 w-4" /> New prospect
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
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
                <TableHead className="w-[60px]">&nbsp;</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">
                    <Input
                      value={prospect.business}
                      onChange={(event) => onUpdateProspect(prospect.id, { business: event.target.value })}
                      className="mb-1"
                    />
                    <Input
                      value={prospect.city}
                      onChange={(event) => onUpdateProspect(prospect.id, { city: event.target.value })}
                      placeholder="City"
                      className="text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={prospect.contactName}
                      onChange={(event) => onUpdateProspect(prospect.id, { contactName: event.target.value })}
                      className="mb-1"
                    />
                    <Input
                      value={prospect.phone}
                      onChange={(event) => onUpdateProspect(prospect.id, { phone: event.target.value })}
                      placeholder="Phone"
                      className="text-xs"
                    />
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
                  <TableCell className="text-sm text-muted-foreground">
                    <Textarea
                      value={prospect.nextAction}
                      onChange={(event) => onUpdateProspect(prospect.id, { nextAction: event.target.value })}
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={prospect.value}
                      onChange={(event) => onUpdateProspect(prospect.id, { value: Number(event.target.value) })}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={prospect.closeDate}
                      onChange={(event) => onUpdateProspect(prospect.id, { closeDate: event.target.value })}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onDeleteProspect(prospect.id)}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
          <div>
            Pipeline value: <span className="font-semibold text-foreground">${totalPipeline.toLocaleString()}</span>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}

export default DealsBoard;
