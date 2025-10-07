import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

const CHAT_URL = "https://www.chatbase.co/chatbot-iframe/Cb2u0ArcmSSlofv46r_Za";

const ChatSupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {isOpen && (
        <Card className="w-[320px] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b px-3 py-2 bg-card">
          <p className="text-sm font-semibold">Player's Budget Assistant</p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close live chat"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close live chat</span>
          </Button>
        </div>
          <div className="h-[420px] bg-background">
            <iframe
              title="Player's Budget Live Agent"
              src={CHAT_URL}
              className="h-full w-full border-0"
              allow="microphone"
            />
          </div>
        </Card>
      )}
      <Button
        variant="gold"
        className="shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Hide live chat" : "Open live chat"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="mr-2 h-4 w-4" /> : <MessageCircle className="mr-2 h-4 w-4" />} 
        {isOpen ? "Hide live agent" : "Chat with us"}
      </Button>
    </div>
  );
};

export default ChatSupportWidget;
