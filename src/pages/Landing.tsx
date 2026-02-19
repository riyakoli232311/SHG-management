import { Link } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Users,
  PiggyBank,
  Landmark,
  CalendarCheck,
  BarChart3,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Heart,
  CheckCircle,
} from "lucide-react";

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
    icon: MessageCircle,
    title: "AI Sakhi Assistant",
    description: "Get instant answers to your queries and guidance on financial matters.",
  },
];

const supportFAQs = [
  {
    q: "How do I add a new member to my SHG?",
    a: "Go to the Members section from the dashboard and click 'Add Member'. Fill in the required details and save.",
  },
  {
    q: "Can I track individual savings?",
    a: "Yes! The Finance section lets you record and view each member's savings history month by month.",
  },
  {
    q: "How are EMIs calculated?",
    a: "EMIs are calculated automatically based on the loan amount, interest rate, and tenure you enter while creating a loan.",
  },
  {
    q: "Is my data secure?",
    a: "Your data is stored securely. We follow best practices to ensure all SHG financial records remain private and safe.",
  },
];

export default function Landing() {
  const featuresRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const supportRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#C2185B]/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
              SakhiSahyog
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => scrollTo(aboutRef)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#C2185B] rounded-lg hover:bg-[#C2185B]/5 transition-all"
            >
              About Us
            </button>
            <button
              onClick={() => scrollTo(featuresRef)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#C2185B] rounded-lg hover:bg-[#C2185B]/5 transition-all"
            >
              Features
            </button>
            <button
              onClick={() => scrollTo(supportRef)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#C2185B] rounded-lg hover:bg-[#C2185B]/5 transition-all"
            >
              Support
            </button>
            <button
              onClick={() => scrollTo(contactRef)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-[#C2185B] rounded-lg hover:bg-[#C2185B]/5 transition-all"
            >
              Contact
            </button>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-[#C2185B] hover:bg-[#C2185B]/5 hidden sm:flex">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-[#C2185B] to-[#AD1457] text-white hover:opacity-90 shadow-sm">
              <Link to="/signup">
                Get Started
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-sm font-medium mb-6">
                <Heart className="w-3.5 h-3.5 fill-current" />
                Empowering Women. Enabling Growth.
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-5 text-gray-900">
                Digital Strength for
                <br />
                <span className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
                  Every Sakhi
                </span>
              </h1>

              <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
                SakhiSahyog brings modern digital tools to empower women's Self Help Groups — 
                manage savings, loans, repayments and more, all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-[#C2185B] to-[#AD1457] text-white hover:opacity-90 shadow-md text-base px-8"
                >
                  <Link to="/signup">
                    Start Your Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-[#C2185B]/30 text-[#C2185B] hover:bg-[#C2185B]/5 text-base px-8"
                >
                  <Link to="/login">Login to Dashboard</Link>
                </Button>
              </div>
            </div>

            {/* SHG Image */}
            <div className="hidden lg:block">
              <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ height: "420px" }}>
                <img
                  src="https://images.livemint.com/img/2022/03/07/600x338/oped1_1646670646465_1646670652294.jpg"
                  alt="Village women's Self Help Group meeting"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section ref={aboutRef} className="py-20 px-6 bg-gradient-to-br from-[#FFF5F7] to-[#F3E5F5]/40">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-semibold text-[#C2185B] uppercase tracking-widest mb-3">About Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-5">
              Built for Women. Designed for Growth.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              SakhiSahyog is a digital platform built to empower women's Self Help Groups across India. 
              We believe every woman deserves access to simple, transparent, and powerful financial tools — 
              regardless of technical background. Our platform is built with love, simplicity, and a deep 
              understanding of how SHGs operate on the ground.
            </p>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#C2185B] uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Everything Your SHG Needs
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Comprehensive tools designed specifically for women's Self Help Groups
            </p>
          </div>

          {/* 3x2 symmetric grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-gray-100 p-6 hover:border-[#C2185B]/20 hover:shadow-md transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B]/10 to-[#6A1B9A]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#C2185B]" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Ready to Transform */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#FFF5F7] to-[#F3E5F5]/40">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full border border-white"
                  style={{
                    width: `${(i + 1) * 80}px`,
                    height: `${(i + 1) * 80}px`,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your SHG?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of women building a stronger financial future together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-white text-[#C2185B] hover:bg-white/90 font-semibold px-8 shadow-md"
                >
                  <Link to="/signup">
                    Create Free Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="bg-white/20 text-white border-2 border-white/60 hover:bg-white/30 font-semibold px-8 backdrop-blur-sm"
                >
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section ref={supportRef} className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#C2185B] uppercase tracking-widest mb-3">Support</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-lg">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {supportFAQs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-6 hover:border-[#C2185B]/20 hover:shadow-sm transition-all">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="py-20 px-6 bg-gradient-to-br from-[#FFF5F7] to-[#F3E5F5]/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#C2185B] uppercase tracking-widest mb-3">Contact</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-gray-500 text-lg">We'd love to hear from you</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mb-10 max-w-lg mx-auto w-full">
            {[
              { label: "Email", value: "sakhisahyog@gmail.com", icon: "📧" },
              { label: "Phone", value: "+91 98765 43210", icon: "📞" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                <span className="text-3xl mb-3 block">{c.icon}</span>
                <p className="text-xs font-semibold text-[#C2185B] uppercase tracking-wide mb-1">{c.label}</p>
                <p className="text-sm text-gray-600">{c.value}</p>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#C2185B]/10 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] bg-clip-text text-transparent">
              SakhiSahyog
            </span>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2026 SakhiSahyog. Empowering women's financial independence across India.
          </p>
        </div>
      </footer>
    </div>
  );
}