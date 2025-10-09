import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, LogOut, Plus, Settings, Plane, Bed, Utensils, Car, 
  Trophy, Users, Zap, Lock, Camera, FileText, Target, DollarSign, 
  Clock, AlertTriangle, Calendar, MapPin, ChartPie, Edit3, Save, X, Crown
} from "lucide-react";
import { formatCurrency } from "@/lib/budgetCalculations";
import { 
  calcFundingGap, 
  calcEnvelopeHealth, 
  calcCashRunway, 
  calcBreakEvenRound,
  formatFinancialMetric
} from "@/lib/finance";
import { exportHandlers } from "@/api/exports/route";
import FinancialEditor, { FinancialData } from "@/components/FinancialEditor";
import ProfessionalCharts from "@/components/ProfessionalCharts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import QuickAdd from "@/components/QuickAdd";
import "../api/ocr"; // Initialize OCR mock
import "../api/exports/route"; // Initialize export endpoints

// Types
interface SeasonData {
  plannedCost: number;
  earnedPreTax: number;
  earnedAfterTax: number;
  expensesToDate: number;
  netToDate: number;
  currency: string;
}

interface CategoryEnvelope {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  cap: number;
  spent: number;
  remaining: number;
  dailyBurn: number;
  daysLeft: number;
}

interface FundingStream {
  type: 'prize_pending' | 'prize_received' | 'sponsor_committed' | 'sponsor_paid' | 'other';
  label: string;
  amount: number;
  status: 'pending' | 'received' | 'committed' | 'paid';
}

interface UpcomingItem {
  type: 'entry' | 'flight' | 'hotel';
  description: string;
  dueDate: string;
  amount: number;
  status: 'due' | 'booked' | 'paid';
}

const SeasonDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seasonData, setSeasonData] = useState<SeasonData | null>(null);
  const [isProUser, setIsProUser] = useState(false);
  
  // Get current page name from location
  const getCurrentPageName = () => {
    switch(location.pathname) {
      case '/sponsors/tool': return 'Get Sponsors';
      case '/pricing': return 'Pricing';
      case '/settings': return 'Settings';
      case '/dashboard':
      default: return 'Dashboard';
    }
  };
  const [financialData, setFinancialData] = useState<FinancialData>({
    // Income Sources (ITF-level realistic earnings)
    prizeMoney: 30000,      // $2,500/month max at ITF level
    sponsors: 5000,         // Very little - maybe basic equipment discount
    gifts: 18000,           // $1,500/month - family support/donations
    otherIncome: 6000,      // $500/month - coaching lessons, part-time work
    monthlyExpenses: {
      flights: 1800,        // $21.6k/year - flights
      lodging: 1500,        // $18k/year - accommodation
      meals: 800,           // $9.6k/year - food
      transport: 500,       // $6k/year - ground transport
      entries: 1000,        // $12k/year - tournament entries
      coaching: 400,        // $4.8k/year - coaching support
      equipment: 200,       // $2.4k/year - equipment
      other: 800            // $9.6k/year - other expenses
    },
    yearlyProjected: {
      income: 59000,        // Adjusted income target (30k+5k+18k+6k)
      expenses: 72000       // Monthly $6k × 12 months
    }
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Calculate season data using financial functions
  const calculateSeasonData = (finData: FinancialData): SeasonData => {
    const totalYearlyIncome = finData.prizeMoney + finData.sponsors + finData.gifts + finData.otherIncome;
    const monthlyExpenseTotal = Object.values(finData.monthlyExpenses).reduce((sum, val) => sum + val, 0);
    
    const plannedCost = finData.yearlyProjected.expenses;
    
    // Calculate YTD actuals based on current date (October 9, 2025)
    const today = new Date();
    const monthsCompleted = today.getMonth() + (today.getDate() / 30); // More accurate partial month calculation
    
    // YTD Income (proportional to months completed)
    const earnedPreTaxYTD = (totalYearlyIncome * monthsCompleted) / 12;
    
    // Tax calculation (assume 25% effective tax rate for ITF players)
    const taxRate = 0.25;
    const earnedAfterTaxYTD = earnedPreTaxYTD * (1 - taxRate);
    
    // YTD Expenses (actual months of expenses)
    const expensesToDateYTD = monthlyExpenseTotal * monthsCompleted;
    
    // Net to Date calculation
    const netToDate = earnedAfterTaxYTD - expensesToDateYTD;
    
    return {
      plannedCost,
      earnedPreTax: earnedPreTaxYTD,
      earnedAfterTax: earnedAfterTaxYTD,
      expensesToDate: expensesToDateYTD,
      netToDate,
      currency: 'USD'
    };
  };

  const mockSeasonData = calculateSeasonData(financialData);



  const mockFundingStreams: FundingStream[] = [
    { type: 'prize_received', label: 'Prize Money (Received)', amount: 25000, status: 'received' },
    { type: 'prize_pending', label: 'Prize Money (Pending)', amount: 8500, status: 'pending' },
    { type: 'sponsor_paid', label: 'Main Sponsor', amount: 30000, status: 'paid' },
    { type: 'sponsor_committed', label: 'Equipment Sponsor', amount: 12000, status: 'committed' },
  ];

  const mockUpcoming: UpcomingItem[] = [
    { type: 'entry', description: 'ATP Miami Entry Fee', dueDate: '2024-02-15', amount: 1200, status: 'due' },
    { type: 'flight', description: 'Flight to Indian Wells', dueDate: '2024-02-20', amount: 850, status: 'due' },
    { type: 'hotel', description: 'Indian Wells Accommodation', dueDate: '2024-02-22', amount: 2400, status: 'booked' },
  ];

  const mockMonthlyData = [
    { month: 'Jan', plan: 7500, actual: 8200, forecast: 8000 },
    { month: 'Feb', plan: 8500, actual: 7800, forecast: 8200 },
    { month: 'Mar', plan: 9200, actual: null, forecast: 9000 },
    { month: 'Apr', plan: 8800, actual: null, forecast: 8600 },
  ];

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
      setSeasonData(calculateSeasonData(financialData));

    } catch (error: any) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialDataUpdate = (newData: FinancialData) => {
    setFinancialData(newData);
    setSeasonData(calculateSeasonData(newData));
    toast({
      title: "Financial data updated",
      description: "Your season projections have been recalculated.",
    });
  };



  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleAddExpense = (expense: { amount: number; description: string; category: string; date: string }) => {
    // In a real app, this would save to the database
    console.log('Adding expense:', expense);
    toast({
      title: "Expense added",
      description: `$${expense.amount} expense logged successfully.`,
    });
  };

  const handleAddIncome = (income: { amount: number; description: string; category: string; date: string }) => {
    // In a real app, this would save to the database
    console.log('Adding income:', income);
    toast({
      title: "Income added", 
      description: `$${income.amount} income logged successfully.`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary-foreground">Loading your season...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Combined Header with Navigation */}
      <header className="bg-primary/90 border-b border-primary/70 sticky top-0 z-10">
        {/* Navigation */}
        <div className="bg-primary border-b border-primary/70">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <nav className="flex gap-6">
              <button 
                onClick={() => navigate('/dashboard')} 
                className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${location.pathname === '/dashboard' ? 'text-secondary border-b-2 border-secondary pb-2' : 'text-primary-foreground/70 hover:text-secondary'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/sponsors/tool')} 
                className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${location.pathname === '/sponsors/tool' ? 'text-secondary border-b-2 border-secondary pb-2' : 'text-primary-foreground/70 hover:text-secondary'}`}
              >
                Get Sponsors
              </button>
              <button 
                onClick={() => navigate('/pricing')} 
                className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${location.pathname === '/pricing' ? 'text-secondary border-b-2 border-secondary pb-2' : 'text-primary-foreground/70 hover:text-secondary'}`}
              >
                Pricing
              </button>
              <button 
                onClick={() => navigate('/settings')} 
                className={`text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary ${location.pathname === '/settings' ? 'text-secondary border-b-2 border-secondary pb-2' : 'text-primary-foreground/70 hover:text-secondary'}`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>
        
        {/* Page Title and Actions */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary-foreground">{getCurrentPageName()}</h1>
              <p className="text-primary-foreground/70 mt-1">Season 2025 • 10.3 months completed</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/settings")}
                className="text-primary-foreground/70 hover:text-secondary hover:bg-primary/70 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-primary-foreground/70 hover:text-secondary hover:bg-primary/70 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Financial Editor */}
        <FinancialEditor
          data={financialData}
          onUpdate={handleFinancialDataUpdate}
          currency={seasonData?.currency}
        />

        {/* Professional Charts */}
        <ProfessionalCharts
          data={{
            income: {
              prizeMoney: financialData.prizeMoney,
              sponsors: financialData.sponsors,
              gifts: financialData.gifts,
              otherIncome: financialData.otherIncome,
            },
            monthlyExpenses: financialData.monthlyExpenses,
            yearlyProjected: financialData.yearlyProjected,
          }}
          currency={seasonData?.currency}
        />

        {/* Season Performance - Thin Strip */}
        <div className="bg-card border border-border rounded-lg p-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-card-foreground">Season Performance</h3>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Earned (Pre-Tax)</p>
                <p className="text-sm font-bold text-primary">{formatCurrency(seasonData?.earnedPreTax || 0, seasonData?.currency || 'USD')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Earned (After Tax)</p>
                <p className="text-sm font-bold text-secondary">{formatCurrency(seasonData?.earnedAfterTax || 0, seasonData?.currency || 'USD')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="text-sm font-bold text-destructive">{formatCurrency(seasonData?.expensesToDate || 0, seasonData?.currency || 'USD')}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Net</p>
                <p className={`text-sm font-bold ${(seasonData?.netToDate || 0) >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {formatCurrency(seasonData?.netToDate || 0, seasonData?.currency || 'USD')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Professional Financial Reports */}
        <div className="space-y-3">
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground mb-1">Professional Reports</h3>
            <p className="text-muted-foreground text-xs">Bank-grade accuracy and presentation</p>
          </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Executive Summary Report */}
              <Card className="p-2 bg-card border border-border hover:border-secondary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold text-card-foreground">
                        Executive Summary
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-xs">
                        High-level overview
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• YTD vs. Projections</li>
                        <li>• Revenue breakdown</li>
                      </ul>
                    </div>
                    <div className="ml-3">
                      {isProUser ? (
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Generating Executive Summary",
                              description: "Your executive financial summary is being prepared with bank-grade accuracy...",
                            });
                          }}
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Generate
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/billing')}
                          variant="outline"
                          size="sm"
                          className="border-border text-muted-foreground hover:bg-muted px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Lock className="mr-1 h-3 w-3" />
                          Pro
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Financial Statement */}
              <Card className="p-2 bg-card border border-border hover:border-secondary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <ChartPie className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold text-card-foreground">
                        Financial Statement
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-xs">
                        Comprehensive analysis
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• P&L Statement</li>
                        <li>• Cash Flow Analysis</li>
                      </ul>
                    </div>
                    <div className="ml-3">
                      {isProUser ? (
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Generating Financial Statement",
                              description: "Your complete financial statement is being prepared with institutional-grade detail...",
                            });
                          }}
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Generate
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/billing')}
                          variant="outline"
                          size="sm"
                          className="border-border text-muted-foreground hover:bg-muted px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Lock className="mr-1 h-3 w-3" />
                          Pro
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sponsor/Investor Package */}
              <Card className="p-2 bg-card border border-border hover:border-secondary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm font-bold text-card-foreground">
                        Sponsor Presentation
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-xs">
                        Investment-grade package
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>• ROI Analysis</li>
                        <li>• Media Value</li>
                      </ul>
                    </div>
                    <div className="ml-3">
                      {isProUser ? (
                        <Button 
                          onClick={() => {
                            toast({
                              title: "Generating Sponsor Package",
                              description: "Your professional sponsor presentation is being prepared with investment-grade quality...",
                            });
                          }}
                          size="sm"
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          Generate
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => navigate('/billing')}
                          variant="outline"
                          size="sm"
                          className="border-border text-muted-foreground hover:bg-muted px-3 focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <Lock className="mr-1 h-3 w-3" />
                          Pro
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>

        {/* Quick Add Component */}
        <QuickAdd 
          isProUser={isProUser}
          onAddExpense={handleAddExpense}
          onAddIncome={handleAddIncome}
        />
      </main>
    </div>
  );
};

export default SeasonDashboard;
