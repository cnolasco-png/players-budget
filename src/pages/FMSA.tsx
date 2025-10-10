import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useModuleGate } from '../lib/useModuleGate';
import { usePro } from '../lib/usePro';
import { useToast } from '../hooks/use-toast';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '../components/ui/accordion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { 
  Download, 
  CheckCircle, 
  Circle, 
  Lock, 
  Crown, 
  ExternalLink,
  Mail,
  Users
} from 'lucide-react';
import { generateFinancialMindsetAccelerator, generateProfessionalSponsorTemplate, downloadPDF } from '../lib/generateSponsorTemplate';

interface CourseProgress {
  user_id: string;
  course_id: string;
  day0: boolean;
  day1: boolean;
  day2: boolean;
  day3: boolean;
  day4: boolean;
  day5: boolean;
  updated_at: string;
}

interface LessonGateProps {
  slug: string;
  children: React.ReactNode;
}

function LessonGate({ slug, children }: LessonGateProps) {
  const { isLocked, lockReason, loading } = useModuleGate(slug);
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleSlug: slug,
          email: email.trim()
        })
      });

      const result = await response.json();

      if (result.ok) {
        toast({
          title: 'Success!',
          description: result.message || 'Successfully joined the waitlist!',
        });
        setEmail('');
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to join waitlist',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isLocked) {
    return <>{children}</>;
  }

  if (lockReason === 'coming_soon') {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              Fan Monetization (Mentorship, Hitting, Match Analysis)
            </CardTitle>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              Coming Soon
            </Badge>
          </div>
          <CardDescription>
            Advanced strategies for monetizing your fan engagement and expertise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What you'll learn:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Build and monetize your mentorship program</li>
              <li>• Advanced hitting analysis techniques</li>
              <li>• Match analysis for revenue generation</li>
              <li>• Fan engagement strategies that convert</li>
            </ul>
          </div>
          
          <form onSubmit={handleWaitlistSubmit} className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                disabled={isSubmitting || !email.trim()}
                className="shrink-0"
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-between pt-2 border-t">
            <Button variant="outline" size="sm" asChild>
              <a 
                href="https://discord.gg/wolfpro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Join Discord
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              Powered by WolfPro · Player X
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (lockReason === 'pro_required') {
    return (
      <Card className="border-dashed border-2 border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-600" />
              Fan Monetization (Mentorship, Hitting, Match Analysis)
            </CardTitle>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Pro Only
            </Badge>
          </div>
          <CardDescription>
            Unlock advanced monetization strategies with Pro access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Pro features include:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Complete Fan Monetization masterclass</li>
              <li>• Advanced revenue tracking tools</li>
              <li>• Premium templates and resources</li>
              <li>• Priority support and updates</li>
            </ul>
          </div>
          
          <Button asChild className="w-full">
            <a href="/settings/billing">
              <Crown className="h-4 w-4 mr-2" />
              Try Pro
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Future: unlocked content
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fan Monetization (Mentorship, Hitting, Match Analysis)</CardTitle>
        <CardDescription>Advanced strategies for monetizing your expertise</CardDescription>
      </CardHeader>
      <CardContent>
        {/* TODO: Implement unlocked Fan Monetization content */}
        <p className="text-muted-foreground">Coming soon - unlocked content will be displayed here.</p>
      </CardContent>
    </Card>
  );
}

export default function FMSAPage() {
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('course_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', 'fmsa')
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error loading progress:', error);
          } else if (data) {
            setProgress(data);
          }
        }
      } catch (error) {
        console.error('Unexpected error loading progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const updateProgress = async (day: keyof Pick<CourseProgress, 'day0' | 'day1' | 'day2' | 'day3' | 'day4' | 'day5'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newProgress = { ...progress, [day]: !(progress?.[day] || false) };
      
      const { data, error } = await supabase
        .from('course_progress')
        .upsert({
          user_id: user.id,
          course_id: 'fmsa',
          ...newProgress
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProgress(data);
      toast({
        title: 'Progress Updated',
        description: `Day ${day.replace('day', '')} marked as ${newProgress[day] ? 'complete' : 'incomplete'}`,
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadWorkbook = async () => {
    try {
      const blob = await generateFinancialMindsetAccelerator();
      downloadPDF(blob, 'Financial-Mindset-Strategy-Accelerator-Workbook.pdf');
    } catch (error) {
      toast({
        title: 'Download Error',
        description: 'Failed to download workbook. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadSponsorTool = async () => {
    try {
      const blob = await generateProfessionalSponsorTemplate();
      downloadPDF(blob, 'Professional-Sponsor-Tool.pdf');
    } catch (error) {
      toast({
        title: 'Download Error',
        description: 'Failed to download sponsor tool. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const ProgressChip = ({ day, label }: { day: keyof Pick<CourseProgress, 'day0' | 'day1' | 'day2' | 'day3' | 'day4' | 'day5'>, label: string }) => {
    const isComplete = progress?.[day] || false;
    
    return (
      <button
        onClick={() => updateProgress(day)}
        className="flex items-center gap-2 px-3 py-1 rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:bg-muted"
        disabled={loading}
      >
        {isComplete ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground" />
        )}
        <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-muted-foreground'}`}>
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center space-y-6 mb-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Financial Mindset & Strategy Accelerator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your approach to baseball finances with our comprehensive 6-day program. 
            Build the mindset and systems needed for long-term success.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadWorkbook} size="lg" className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Workbook
          </Button>
          <Button onClick={handleDownloadSponsorTool} variant="outline" size="lg" className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Sponsor Tool
          </Button>
        </div>
      </div>

      {/* Progress Chips */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
        <div className="flex flex-wrap gap-2">
          <ProgressChip day="day0" label="Day 0" />
          <ProgressChip day="day1" label="Day 1" />
          <ProgressChip day="day2" label="Day 2" />
          <ProgressChip day="day3" label="Day 3" />
          <ProgressChip day="day4" label="Day 4" />
          <ProgressChip day="day5" label="Day 5" />
        </div>
      </div>

      {/* Course Content */}
      <div className="space-y-8">
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="day0" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 0</Badge>
                <span className="font-semibold">Foundation & Assessment</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Assess your current financial situation honestly</li>
                  <li>• Understand the psychology of money in baseball</li>
                  <li>• Set realistic financial goals aligned with your career stage</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Complete Financial Assessment</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <p className="text-sm text-muted-foreground">
                  Export your completed assessment from the budget tool
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="day1" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 1</Badge>
                <span className="font-semibold">Emergency Fund & Risk Management</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Baseball careers are unpredictable - prepare for uncertainty</li>
                  <li>• Emergency funds provide mental clarity and confidence</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Set Emergency Fund Target</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <p className="text-sm text-muted-foreground">
                  Screenshot of your emergency fund goal in the budget tracker
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="day2" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 2</Badge>
                <span className="font-semibold">Investment Fundamentals</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Time in the market beats timing the market</li>
                  <li>• Diversification protects against career-ending injuries</li>
                  <li>• Start investing early, even with small amounts</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Plan Investment Allocation</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <p className="text-sm text-muted-foreground">
                  Document your investment strategy and allocations
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="day3" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 3</Badge>
                <span className="font-semibold">Contract Negotiation & Taxes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Understand your worth and negotiate accordingly</li>
                  <li>• Tax planning is as important as earning money</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Calculate Tax Obligations</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <p className="text-sm text-muted-foreground">
                  Export tax planning worksheet from budget tool
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="day4" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 4</Badge>
                <span className="font-semibold">Insurance & Protection</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Protect your most valuable asset - your ability to earn</li>
                  <li>• Insurance is an investment in peace of mind</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Review Insurance Needs</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <p className="text-sm text-muted-foreground">
                  Insurance coverage analysis and recommendations
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="day5" className="border rounded-lg px-4">
            <AccordionTrigger className="text-left hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="outline">Day 5</Badge>
                <span className="font-semibold">Long-term Wealth Building</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-medium mb-2">Principles/Mindset:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Think beyond your playing career</li>
                  <li>• Build multiple income streams</li>
                  <li>• Legacy planning starts now</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Do:</h4>
                <Button variant="outline" size="sm" asChild>
                  <a href="/budget">Create Wealth Building Plan</a>
                </Button>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proof:</h4>
                <Button variant="outline" size="sm" onClick={handleDownloadWorkbook}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Completed Workbook
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Fan Monetization Module - Gated */}
        <div className="pt-8 border-t">
          <LessonGate slug="fan-monetization">
            {/* Future unlocked content will go here */}
            <Card>
              <CardHeader>
                <CardTitle>Fan Monetization (Mentorship, Hitting, Match Analysis)</CardTitle>
                <CardDescription>Advanced strategies for monetizing your expertise</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Unlocked content coming soon...</p>
              </CardContent>
            </Card>
          </LessonGate>
        </div>
      </div>
    </div>
  );
}
