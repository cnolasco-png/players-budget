import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuickFeedbackSheet from "./QuickFeedbackSheet";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setEnabled(Boolean(data.session));
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button onClick={() => setOpen(true)} className="shadow-lg">
          Give feedback (60s)
        </Button>
      </div>
      <QuickFeedbackSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
