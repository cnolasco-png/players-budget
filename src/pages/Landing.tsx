import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calculator, FileText, Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent font-medium text-sm mb-6">
                <TrendingUp className="w-4 h-4" />
                Plan Your Season in Minutes
              </span>
            </div>
            
            <h1 className="text-foreground max-w-4xl mx-auto">
              Budget Your Tennis Season Like a{" "}
              <span className="text-accent">Champion</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Fast data entry. Clear, print-ready sheets. Easy scenario tweaks. 
              Know your funding gap and plan with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button asChild size="lg" variant="default">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">View Demo</Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              No credit card required • Free plan available
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-foreground mb-4">
              Everything You Need to Plan Your Season
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for tennis players, coaches, and parents who need clear financial planning
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <Calculator className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">60-Second Setup</h3>
              <p className="text-muted-foreground leading-relaxed">
                Three quick steps: profile, scenario presets, confirm. Your budget is ready in under a minute.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Scenarios</h3>
              <p className="text-muted-foreground leading-relaxed">
                Compare Lean, Standard, and Premium plans. Adjust 6 key variables and watch totals update instantly.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Print-Ready Sheets</h3>
              <p className="text-muted-foreground leading-relaxed">
                Summary, comparison, and cash flow views. Perfect for sponsors, parents, or personal planning.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tax Calculator</h3>
              <p className="text-muted-foreground leading-relaxed">
                Auto-fill tax rates by country. See your funding gap after taxes with one click.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl gradient-gold flex items-center justify-center mb-6">
                <Calculator className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Updates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Change a slider, see instant updates. Spreadsheet-style editing with autosave every 5 seconds.
              </p>
            </Card>

            <Card className="p-8 shadow-card hover-lift border-2">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Export & Share</h3>
              <p className="text-muted-foreground leading-relaxed">
                Download CSV instantly. Pro users get PDF export and shareable sponsor links.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-primary-foreground mb-6">
            Ready to Plan Your Season?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join tennis players worldwide who trust Player's Budget for clear, professional season planning.
          </p>
          <Button asChild size="lg" variant="gold">
            <Link to="/auth">
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              © 2026 Player's Budget. Built for champions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
