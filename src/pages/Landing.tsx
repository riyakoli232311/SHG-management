import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Users,
  PiggyBank,
  Landmark,
  CalendarCheck,
  BarChart3,
  MessageCircle,
  Shield,
  Smartphone,
  FileText,
  Eye,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Track all members with their personal details, savings history, and loan status in one place.",
  },
  {
    icon: PiggyBank,
    title: "Savings Tracking",
    description: "Record monthly savings, view collection history, and monitor group fund growth.",
  },
  {
    icon: Landmark,
    title: "Loan & EMI System",
    description: "Manage loans with automatic EMI calculation, interest tracking, and disbursement records.",
  },
  {
    icon: CalendarCheck,
    title: "Repayment Monitoring",
    description: "Track EMI payments, pending dues, and send automatic reminders to members.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    description: "Generate financial reports, view growth charts, and analyze group performance.",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Get help with queries, understand loan terms, and receive financial guidance.",
  },
];

const trustItems = [
  { icon: Shield, label: "Secure & Private" },
  { icon: Smartphone, label: "Easy to Use" },
  { icon: FileText, label: "100% Paperless" },
  { icon: Eye, label: "Fully Transparent" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SHG Manager</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-display font-bold mb-6 animate-fade-in text-balance text-foreground">
                Digital Self Help Group Management Made Simple
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-xl">
                Empower your women's group with easy-to-use digital tools for savings, loans, and financial growth. No technical skills needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="xl" asChild>
                  <Link to="/login">
                    Login to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <Link to="/signup">Create Your SHG</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src={heroIllustration}
                alt="Women's Self Help Group - Financial Empowerment"
                className="w-full h-auto rounded-2xl shadow-card-hover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-heading font-bold mb-4">Everything Your SHG Needs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete digital solution for managing your self-help group efficiently
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-medium text-lg">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-10 md:p-16 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%224%22%20cy%3D%224%22%20r%3D%222%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
            <div className="relative">
              <CheckCircle className="w-16 h-16 mx-auto mb-6 opacity-80" />
              <h2 className="text-heading font-bold mb-4">
                Start Managing Your SHG Digitally Today
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join hundreds of self-help groups who have transformed their financial management with our simple digital tools.
              </p>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/signup">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SHG Manager</span>
          </div>
          <p>© 2024 SHG Manager. Empowering women's financial independence.</p>
        </div>
      </footer>
    </div>
  );
}
