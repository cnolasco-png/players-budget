import { ArrowLeft, Instagram } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PlayerX = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-10">
      <Card className="max-w-2xl space-y-6 p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Instagram className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Player X launches early 2026</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;re building the next generation of connected player tools. Follow our journey on Instagram to get behind-the-scenes updates and be first in line for early access.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <a href="https://www.instagram.com/playex.official/" target="_blank" rel="noopener noreferrer">
              Follow @playex.official
            </a>
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />Back
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlayerX;
