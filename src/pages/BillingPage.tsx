import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, ExternalLink, AlertTriangle, Calendar, 
  Check, Crown, Zap, ArrowLeft
} from "lucide-react";

interface BillingStatus {
  plan: 'free' | 'pro_monthly' | 'pro_yearly';
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  pastDue?: boolean;
}

const BillingPage = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock billing data - replace with real Stripe integration
  const mockBillingStatus: BillingStatus = {
    plan: 'pro_monthly',
    status: 'active',
    currentPeriodEnd: '2024-03-15',
    cancelAtPeriodEnd: false,
    pastDue: false
  };

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
      
      // Set mock billing status based on profile
      if (profileData?.role === 'pro') {
        setBillingStatus(mockBillingStatus);
      } else {
        setBillingStatus({ plan: 'free', status: 'active' });
      }

    } catch (error: any) {
      console.error("Error loading billing:", error);
      toast({
        title: "Error loading billing information",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeMonthly = () => {
    const monthlyUrl = "https://buy.stripe.com/00w4gz1hC9kh0kS6TqbfO04";
    window.open(monthlyUrl, "_blank", "noopener,noreferrer");
    
    toast({
      title: "Redirecting to Stripe",
      description: "Complete your upgrade to Pro Court membership.",
    });
  };

  const handleUpgradeYearly = () => {
    const yearlyUrl = "https://buy.stripe.com/5kQ4gz1hCeEB8RofpWbfO05";
    window.open(yearlyUrl, "_blank", "noopener,noreferrer");
    
    toast({
      title: "Redirecting to Stripe",
      description: "Complete your upgrade to Pro Court membership.",
    });
  };

  const handleManageBilling = () => {
    // Use environment variable or fallback to placeholder  
    const stripePortalUrl = import.meta.env.VITE_STRIPE_BILLING_PORTAL_URL || "https://billing.stripe.com/p/login/your-portal-link";
    window.open(stripePortalUrl, "_blank", "noopener,noreferrer");
    
    toast({
      title: "Opening billing portal",
      description: "Manage your subscription and billing details.",
    });
  };

  const getPlanDetails = (plan: string) => {
    switch (plan) {
      case 'pro_monthly':
        return { name: 'Pro Court Monthly', price: '$2.99/month', color: 'bg-emerald-600' };
      case 'pro_yearly':
        return { name: 'Pro Court Annual', price: '$29.99/year', color: 'bg-emerald-600' };
      default:
        return { name: 'Free Court', price: 'Free', color: 'bg-muted' };
    }
  };

  const getStatusBadge = (status: BillingStatus) => {
    if (status.pastDue) {
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Past Due</Badge>;
    }
    
    if (status.cancelAtPeriodEnd) {
      return <Badge variant="outline" className="gap-1"><Calendar className="w-3 h-3" />Canceling</Badge>;
    }

    switch (status.status) {
      case 'active':
        return <Badge variant="default" className="gap-1 bg-emerald-600"><Check className="w-3 h-3" />Active</Badge>;
      case 'trialing':
        return <Badge variant="secondary" className="gap-1"><Zap className="w-3 h-3" />Trial</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="secondary">{status.status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const planDetails = getPlanDetails(billingStatus?.plan || 'free');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-green-900">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="shadow-sm hover:bg-emerald-50"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-600" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg ring-2 ring-emerald-500/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Membership</h1>
                <p className="text-base text-muted-foreground">Manage your Pro Court subscription</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-5xl px-6 py-10 space-y-8">
        
        {/* Past Due Warning */}
        {billingStatus?.pastDue && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your payment is past due. Features remain active for 3 days while we attempt to process payment.
              Please update your billing information to avoid service interruption.
            </AlertDescription>
          </Alert>
        )}

        {/* Current Plan Status */}
        <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold tracking-tight flex items-center gap-3">
                  <Crown className="w-6 h-6 text-emerald-600" />
                  Current Membership
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Your active subscription and billing details
                </CardDescription>
              </div>
              {billingStatus && getStatusBadge(billingStatus)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Plan</p>
                <p className="text-xl font-bold">{planDetails.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Price</p>
                <p className="text-xl font-bold text-emerald-600">{planDetails.price}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">
                  {billingStatus?.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
                </p>
                <p className="text-xl font-bold">
                  {billingStatus?.currentPeriodEnd 
                    ? new Date(billingStatus.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            {billingStatus?.cancelAtPeriodEnd && (
              <Alert>
                <Calendar className="h-4 w-4" />
                <AlertDescription>
                  Your subscription will cancel on {new Date(billingStatus.currentPeriodEnd || '').toLocaleDateString()}.
                  You'll continue to have Pro features until then.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Subscription Actions */}
        {billingStatus?.plan === 'free' ? (
          <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Upgrade to Pro Court</CardTitle>
              <CardDescription className="text-base">
                Unlock premium features and advanced tournament analytics
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">Monthly</h3>
                      <p className="text-3xl font-bold text-emerald-700">$2.99<span className="text-base font-normal">/month</span></p>
                    </div>
                    <ul className="text-sm text-emerald-700 space-y-2">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Receipt scanning & OCR</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Advanced analytics</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Sponsor presentations</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Priority support</li>
                    </ul>
                    <Button onClick={handleUpgradeMonthly} className="w-full shadow-md font-medium">
                      Start Monthly
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-100 to-green-100 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-emerald-600">
                    Best Value
                  </Badge>
                  <div className="text-center space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-emerald-800">Annual</h3>
                      <p className="text-3xl font-bold text-emerald-700">$29.99<span className="text-base font-normal">/year</span></p>
                      <p className="text-sm text-emerald-600">Save $6/year</p>
                    </div>
                    <ul className="text-sm text-emerald-700 space-y-2">
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Everything in Monthly</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Advanced tax reporting</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Multi-season analytics</li>
                      <li className="flex items-center gap-2"><Check className="w-4 h-4" />Custom branding</li>
                    </ul>
                    <Button onClick={handleUpgradeYearly} variant="gold" className="w-full shadow-md font-medium">
                      Start Annual
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight">Manage Subscription</CardTitle>
              <CardDescription className="text-base">
                Update billing details, change plans, or cancel your subscription
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleManageBilling}
                  className="flex-1 shadow-md font-medium border-emerald-200 hover:bg-emerald-50"
                  variant="outline"
                >
                  <CreditCard className="mr-2 h-5 w-5 text-emerald-600" />
                  Manage Subscription
                  <ExternalLink className="ml-2 h-4 w-4 text-emerald-600" />
                </Button>
                
                {billingStatus?.plan === 'pro_monthly' && (
                  <Button 
                    onClick={handleUpgradeYearly}
                    variant="gold"
                    className="flex-1 shadow-md font-medium"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Annual
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>
                  Changes will take effect at your next billing cycle. 
                  You can cancel anytime through the billing portal.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro Features Overview */}
        <Card className="p-8 shadow-lg border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Pro Court Features</CardTitle>
            <CardDescription className="text-base">
              What you get with your Pro membership
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-emerald-800">Analytics & Reporting</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Tournament ROI analysis</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Break-even round calculations</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Multi-season comparisons</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Advanced tax reporting</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-bold text-emerald-800">Premium Tools</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Receipt scanning & OCR</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Sponsor presentation builder</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Live sponsor dashboards</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" />Priority support chat</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BillingPage;
