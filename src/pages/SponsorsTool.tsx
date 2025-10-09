/*
Build a Sponsor Tool page with:
- Hero: "Pitch like a pro" + brief explainer.
- Two cards:
  1) Sponsor Deck Template (Download button linking to /files/Tennis_Sponsor_Deck_and_Outreach_Tool.pdf).
  2) Outreach Planner with three copy buttons (IG DM, Email, 7-Day Plan).
- Right rail: "Get discovered" with external links (Levanta, JoinBrands, Player X App—coming soon).
- If user is Pro, show "Personalize PDF" button → opens dialog to collect player fields and POST to /api/sponsors/deck to return a personalized PDF blob.
- Accessibility: large targets, keyboard focus, tooltips.
*/

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Copy, 
  ExternalLink, 
  Star, 
  Users, 
  Calendar,
  Trophy,
  CheckCircle,
  Crown
} from "lucide-react";
import "../api/sponsors/deck"; // Initialize sponsors API mock

// Outreach templates
const OUTREACH_TEMPLATES = {
  igDm: `Hey [Brand], I'm [Name], an [level] tennis player traveling to [cities] this season. My audience is [X] who care about [Y]. I'm planning content around [topic]. Could we test a small pilot next week: 1 reel + 2 stories with a code/link? I'll send a clean recap. Best place to send a one-pager?`,
  
  emailSubject: `Local athlete partnership — [Your Name] · [City]`,
  
  emailBody: `Hi [Brand Team],

I'm [Name], a [level] tennis player based in [City]. I'm reaching out because I think there's a great opportunity for us to work together this season.

Quick Background:
• Current ranking: [Current Ranking]
• Best ranking: [Best Ranking]  
• Upcoming tournaments: [Cities/Dates]
• Social following: [Follower Count] engaged tennis fans

My audience cares about [interests] and I create content around [topics]. I'm looking for authentic brand partnerships where I can genuinely recommend products I use and love.

What I'm proposing:
• Small pilot campaign to test engagement
• Clean content + genuine recommendations
• Full performance recap with metrics
• Flexible on deliverables based on your goals

Would love to send over a one-page deck with more details. What's the best email for partnerships?

Best regards,
[Your Name]
[Your Contact Info]`,

  sevenDayPlan: `7-Day Sponsor Outreach Plan:

Day 1: Research 5 brands that align with your values
Day 2: Follow their social accounts, engage authentically  
Day 3: Send personalized IG DMs to 3 brands
Day 4: Follow up via email with 2 brands from Day 3
Day 5: Send cold emails to 2 new brands
Day 6: Engage with brands' content, build relationships
Day 7: Follow up on Day 1-3 outreach, plan next week

Tips:
• Be genuine, not salesy
• Lead with value, not follower count
• Show your personality
• Follow up professionally
• Track everything in a spreadsheet`
};

const EXTERNAL_PLATFORMS = [
  {
    name: "Levanta",
    description: "Athlete brand deals",
    url: "https://levanta.io",
    icon: Trophy,
    color: "bg-blue-500"
  },
  {
    name: "JoinBrands", 
    description: "Product partnerships",
    url: "https://joinbrands.com",
    icon: Users,
    color: "bg-purple-500"
  },
  {
    name: "Player X App",
    description: "Coming soon (powered by WolfPro)",
    url: "#",
    icon: Star,
    color: "bg-amber-500",
    comingSoon: true
  }
];

export default function SponsorsToolPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [personalizeDialogOpen, setPersonalizeDialogOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Personalized PDF form state
  const [pdfForm, setPdfForm] = useState({
    name: '',
    level: '',
    currentRanking: '',
    bestRanking: '',
    seasonSchedule: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    other: '',
    regions: '',
    ageRange: '',
    interests: '',
    packages: {
      bronze: '',
      silver: '',
      gold: ''
    }
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(profileData);
      setIsProUser(profileData?.role === "pro");

      // Pre-fill form with profile data
      if (profileData) {
        setPdfForm(prev => ({
          ...prev,
          name: profileData.name || '',
          level: profileData.player_level || '',
          // Add other profile fields as they become available in the database
        }));
      }

    } catch (error: any) {
      console.error("Error loading sponsors tool:", error);
      toast({
        title: "Error loading page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${label} template copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadStaticPDF = () => {
    // Create download link for static PDF
    const link = document.createElement('a');
    link.href = '/files/Tennis_Sponsor_Deck_and_Outreach_Tool.pdf';
    link.download = 'Tennis_Sponsor_Deck_and_Outreach_Tool.pdf';
    link.click();
    
    toast({
      title: "Download started",
      description: "Your sponsor deck template is downloading",
    });
  };

  const generatePersonalizedPDF = async () => {
    if (!isProUser) {
      toast({
        title: "Pro feature",
        description: "Upgrade to Pro to generate personalized PDFs",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      // Parse schedule into array format
      const scheduleArray = pdfForm.seasonSchedule
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(',');
          return {
            city: parts[0]?.trim() || '',
            country: parts[1]?.trim() || '',
            dates: parts[2]?.trim() || ''
          };
        });

      const payload = {
        name: pdfForm.name,
        level: pdfForm.level,
        currentRanking: pdfForm.currentRanking,
        bestRanking: pdfForm.bestRanking,
        seasonSchedule: scheduleArray,
        socials: {
          instagram: pdfForm.instagram,
          tiktok: pdfForm.tiktok,
          youtube: pdfForm.youtube,
          other: pdfForm.other
        },
        audience: {
          regions: pdfForm.regions.split(',').map(r => r.trim()).filter(Boolean),
          ageRange: pdfForm.ageRange,
          interests: pdfForm.interests.split(',').map(i => i.trim()).filter(Boolean)
        },
        packages: pdfForm.packages
      };

      const response = await fetch('/api/sponsors/deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfForm.name}_Sponsor_Deck.pdf`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      setPersonalizeDialogOpen(false);
      
      toast({
        title: "PDF generated",
        description: "Your personalized sponsor deck is downloading",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate personalized PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Pitch Like a Pro
            </h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Get the tools, templates, and connections you need to secure sponsors and build lasting partnerships. 
              From deck templates to outreach strategies, everything you need to turn your tennis career into a business.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Sponsor Deck Template Card */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-600" />
                    Sponsor Deck Template
                  </CardTitle>
                  <CardDescription>
                    Professional one-page deck template with outreach strategies and tips
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• One-page sponsor deck template (story, value, assets, packages)</li>
                      <li>• Season schedule + proof blocks</li>
                      <li>• Outreach cheat sheet with platform recommendations</li>
                      <li>• 7-day outreach plan + DM/email templates</li>
                    </ul>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={downloadStaticPDF}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Template PDF
                    </Button>
                    
                    {isProUser && (
                      <Dialog open={personalizeDialogOpen} onOpenChange={setPersonalizeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            <Crown className="h-4 w-4 mr-2" />
                            Personalize PDF
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create Personalized Sponsor Deck</DialogTitle>
                            <DialogDescription>
                              Fill in your details to generate a customized PDF with your information
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                  id="name"
                                  value={pdfForm.name}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Your full name"
                                />
                              </div>
                              <div>
                                <Label htmlFor="level">Level</Label>
                                <Input
                                  id="level"
                                  value={pdfForm.level}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, level: e.target.value }))}
                                  placeholder="e.g., ITF, NCAA, Professional"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="currentRanking">Current Ranking</Label>
                                <Input
                                  id="currentRanking"
                                  value={pdfForm.currentRanking}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, currentRanking: e.target.value }))}
                                  placeholder="e.g., ATP 250, WTA 150"
                                />
                              </div>
                              <div>
                                <Label htmlFor="bestRanking">Best Ranking</Label>
                                <Input
                                  id="bestRanking"
                                  value={pdfForm.bestRanking}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, bestRanking: e.target.value }))}
                                  placeholder="e.g., ATP 180, WTA 120"
                                />
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="seasonSchedule">Season Schedule (next 90 days)</Label>
                              <Textarea
                                id="seasonSchedule"
                                value={pdfForm.seasonSchedule}
                                onChange={(e) => setPdfForm(prev => ({ ...prev, seasonSchedule: e.target.value }))}
                                placeholder="One per line: City, Country, Dates"
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="instagram">Instagram Handle</Label>
                                <Input
                                  id="instagram"
                                  value={pdfForm.instagram}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, instagram: e.target.value }))}
                                  placeholder="@yourusername"
                                />
                              </div>
                              <div>
                                <Label htmlFor="tiktok">TikTok Handle</Label>
                                <Input
                                  id="tiktok"
                                  value={pdfForm.tiktok}
                                  onChange={(e) => setPdfForm(prev => ({ ...prev, tiktok: e.target.value }))}
                                  placeholder="@yourusername"
                                />
                              </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={generatePersonalizedPDF}
                                disabled={generatingPdf || !pdfForm.name}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {generatingPdf ? "Generating..." : "Generate PDF"}
                              </Button>
                              <Button variant="outline" onClick={() => setPersonalizeDialogOpen(false)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Outreach Templates Card */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Copy className="h-5 w-5 text-blue-600" />
                    Outreach Planner
                  </CardTitle>
                  <CardDescription>
                    Copy-paste templates for Instagram DMs, emails, and strategic planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto p-4 text-left justify-start"
                          onClick={() => copyToClipboard(OUTREACH_TEMPLATES.igDm, "Instagram DM")}
                        >
                          <div>
                            <div className="font-medium">Instagram DM</div>
                            <div className="text-sm text-muted-foreground">Casual, personal approach</div>
                          </div>
                          <Copy className="h-4 w-4 ml-auto" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy Instagram DM template</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto p-4 text-left justify-start"
                          onClick={() => copyToClipboard(`${OUTREACH_TEMPLATES.emailSubject}\n\n${OUTREACH_TEMPLATES.emailBody}`, "Email")}
                        >
                          <div>
                            <div className="font-medium">Email Template</div>
                            <div className="text-sm text-muted-foreground">Professional outreach</div>
                          </div>
                          <Copy className="h-4 w-4 ml-auto" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy email template with subject</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto p-4 text-left justify-start"
                          onClick={() => copyToClipboard(OUTREACH_TEMPLATES.sevenDayPlan, "7-Day Plan")}
                        >
                          <div>
                            <div className="font-medium">7-Day Plan</div>
                            <div className="text-sm text-muted-foreground">Strategic approach</div>
                          </div>
                          <Copy className="h-4 w-4 ml-auto" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy 7-day outreach strategy</p>
                      </TooltipContent>
                    </Tooltip>

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Rail */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                    Get Discovered
                  </CardTitle>
                  <CardDescription>
                    Register on these platforms to connect with brands
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {EXTERNAL_PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <Tooltip key={platform.name}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-start h-auto p-3"
                            onClick={() => platform.comingSoon ? null : window.open(platform.url, '_blank')}
                            disabled={platform.comingSoon}
                          >
                            <div className={`w-8 h-8 rounded-full ${platform.color} flex items-center justify-center mr-3`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium flex items-center gap-2">
                                {platform.name}
                                {platform.comingSoon && (
                                  <Badge variant="secondary" className="text-xs">
                                    Soon
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {platform.description}
                              </div>
                            </div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{platform.comingSoon ? "Coming soon" : `Visit ${platform.name}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {!isProUser && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-4 w-4 text-amber-600" />
                        <span className="font-medium text-amber-800">Pro Features</span>
                      </div>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Personalized PDF generation</li>
                        <li>• Sponsor recap exports</li>
                        <li>• Live sponsor links (coming)</li>
                      </ul>
                      <Button 
                        size="sm" 
                        className="w-full mt-3 bg-amber-600 hover:bg-amber-700"
                        onClick={() => navigate('/billing')}
                      >
                        Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
