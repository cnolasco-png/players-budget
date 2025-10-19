import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { approveFeedback, rejectFeedback } from "@/lib/feedbackService";

type FeedbackItem = {
  id: string;
  created_at: string;
  role: "player" | "sponsor" | "coach";
  quote: string;
  rating: number | null;
  tags: string[] | null;
  sentiment: string | null;
  status: "pending" | "approved" | "rejected";
  name: string | null;
  org: string | null;
};

export default function FeedbackQueue() {
  const { toast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, created_at, role, quote, rating, tags, sentiment, status, name, org")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch (error: unknown) {
      const description = error instanceof Error && error.message ? error.message : "Try again";
      toast({ title: "Failed to load queue", description, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string) => {
    try {
      await approveFeedback(id);
      toast({ title: "Approved", description: "Feedback now live on homepage." });
      await load();
    } catch (error: unknown) {
      const description = error instanceof Error && error.message ? error.message : "Try again";
      toast({ title: "Approval failed", description, variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectFeedback(id);
      toast({ title: "Rejected", description: "Feedback removed from queue." });
      await load();
    } catch (error: unknown) {
      const description = error instanceof Error && error.message ? error.message : "Try again";
      toast({ title: "Reject failed", description, variant: "destructive" });
    }
  };

  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader>
        <CardTitle>Feedback moderation</CardTitle>
        <CardDescription>Approve or reject submissions before they appear publicly.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Quote</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(item.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.role}</Badge>
                </TableCell>
                <TableCell className="max-w-sm">
                  <p className="text-sm">{item.quote}</p>
                  {item.name && <p className="text-xs text-muted-foreground mt-1">{item.name} · {item.org}</p>}
                </TableCell>
                <TableCell>{item.rating ?? "-"}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {item.tags?.join(", ") ?? "-"}
                </TableCell>
                <TableCell className="flex flex-col gap-2">
                  <Button size="sm" onClick={() => handleApprove(item.id)}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(item.id)}>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  {loading ? "Loading..." : "No pending feedback right now."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
