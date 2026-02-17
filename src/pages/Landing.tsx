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
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  BookOpen,
  ShoppingBag,
  Settings,
} from "lucide-react";
import heroIllustration from "@/assets/hero-illustration.png";

const features = [
  {
    icon: Users,
    title: "SHG Management",
    description: "Organize and manage your Self Help Group with powerful digital tools designed for women empowerment.",
  },
  {
    icon: PiggyBank,
    title: "Savings Tracking",
    description: "Track collective savings, individual contributions, and watch your group's financial strength grow.",
  },
  {
    icon: Landmark,
    title: "Loan & Credit System",
    description: "Manage internal loans, track repayments, and access microfinance opportunities with ease.",
  },
  {
    icon: CalendarCheck,
    title: "Meeting & Repayments",
    description: "Schedule meetings, track attendance, and monitor repayment schedules effortlessly.",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Visualize your SHG's progress with insightful charts and financial reports.",
  },
  {
    icon: BookOpen,
    title: "Training & Skills",
    description: "Access skill development resources and training modules for group members.",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Connect with buyers and sellers to expand your SHG's business opportunities.",
  },
  {
    icon: MessageCircle,
    title: "AI Sakhi Assistant",
    description: "Get instant answers to your queries and guidance on financial matters.",
  },
];

const trustItems = [
  { icon: Shield, label: "Bank-Grade Security" },
  { icon: Smartphone, label: "Mobile Friendly" },
  { icon: FileText, label: "Digital Records" },
  { icon: Eye, label: "100% Transparent" },
];

const stats = [
  { value: "10,000+", label: "Active SHGs" },
  { value: "2.5L+", label: "Women Empowered" },
  { value: "₹500Cr+", label: "Savings Managed" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-soft-gradient font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#C2185B]/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-empowerment-gradient flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gradient">SakhiSahyog</span>
              <p className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">Strengthening SHGs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex hover:bg-[#C2185B]/5 hover:text-[#C2185B]">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="btn-gradient text-white border-0">
              <Link to="/signup">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C2185B]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6A1B9A]/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-sm font-medium mb-6">
                <Heart className="w-4 h-4 fill-current" />
                <span>Empowering Women. Enabling Growth.</span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Digital Strength</span>
                <br />
                <span className="text-foreground">for Every Sakhi</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
                Join thousands of Self Help Groups transforming their financial future. 
                SakhiSahyog brings modern digital tools to empower women entrepreneurs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild className="btn-gradient text-white border-0 text-lg px-8">
                  <Link to="/signup">
                    Start Your Journey
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="border-[#C2185B]/30 hover:bg-[#C2185B]/5 hover:border-[#C2185B] text-lg px-8">
                  <Link to="/login">Login to Dashboard</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
                {trustItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-[#C2185B]" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="absolute inset-0 bg-empowerment-gradient rounded-3xl blur-2xl opacity-20 transform rotate-3" />
                <img
                  src={heroIllustration}
                  alt="Women's Self Help Group - Financial Empowerment"
                  className="w-full h-auto rounded-3xl shadow-2xl relative z-10"
                />
                
                {/* Floating stats card */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 z-20 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#FBC02D]/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-[#F57F17]" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[#C2185B]">+127%</p>
                      <p className="text-xs text-muted-foreground">Savings Growth</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 z-20 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#6A1B9A]" />
                    <span className="font-semibold text-sm">Trusted by 10K+ SHGs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-empowerment-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <p className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#C2185B] font-medium mb-3">FEATURES</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything Your SHG Needs to <span className="text-gradient">Thrive</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive digital tools designed specifically for women's Self Help Groups
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="card-empowerment border-empowerment p-6 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="icon-empowerment mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#C2185B]" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-warm-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-[#C2185B] font-medium mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Start Your <span className="text-gradient">Digital Journey</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Register Your SHG", desc: "Create your group profile in minutes with basic details" },
              { step: "02", title: "Add Members", desc: "Invite members and build your digital community" },
              { step: "03", title: "Start Growing", desc: "Track savings, manage loans, and scale together" },
            ].map((item, index) => (
              <div key={item.step} className="relative text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-empowerment-gradient flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full">
                    <ArrowRight className="w-8 h-8 text-[#C2185B]/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-empowerment-gradient rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%224%22%20cy%3D%224%22%20r%3D%222%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-50"></div>
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your SHG?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
                Join the digital revolution empowering women across India. 
                Start your journey towards financial independence today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="bg-white text-[#C2185B] hover:bg-white/90 text-lg px-8">
                  <Link to="/signup">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/20 text-lg px-8">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#C2185B]/10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-empowerment-gradient flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-gradient">SakhiSahyog</span>
                <p className="text-xs text-muted-foreground">Strengthening SHGs through Digital Empowerment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-[#C2185B] transition-colors">About Us</Link>
              <Link to="#" className="hover:text-[#C2185B] transition-colors">Features</Link>
              <Link to="#" className="hover:text-[#C2185B] transition-colors">Support</Link>
              <Link to="#" className="hover:text-[#C2185B] transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[#C2185B]/10 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SakhiSahyog. Empowering women's financial independence across India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
