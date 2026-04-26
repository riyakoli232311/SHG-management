import { Link } from "react-router-dom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";
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
} from "lucide-react";
import { TubesBackground } from "@/components/TubesBackground";

const features = [
  {
    icon: Users,
    title: "SHG Management",
    description: "Organize and manage your Self Help Group with powerful digital tools designed for women empowerment.",
    color: "#C2185B",
  },
  {
    icon: PiggyBank,
    title: "Savings Tracking",
    description: "Track collective savings, individual contributions, and watch your group's financial strength grow.",
    color: "#6A1B9A",
  },
  {
    icon: Landmark,
    title: "Loan & Credit System",
    description: "Manage internal loans, track repayments, and access microfinance opportunities with ease.",
    color: "#0288D1",
  },
  {
    icon: CalendarCheck,
    title: "Meeting & Repayments",
    description: "Schedule meetings, track attendance, and monitor repayment schedules effortlessly.",
    color: "#EF9767",
  },
  {
    icon: BarChart3,
    title: "Growth Analytics",
    description: "Visualize your SHG's progress with insightful charts and financial reports.",
    color: "#388E3C",
  },
  {
    icon: MessageCircle,
    title: "AI Sakhi Assistant",
    description: "Get instant answers to your queries and guidance on financial matters.",
    color: "#F57C00",
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

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Landing() {
  const featuresRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const supportRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen font-sans bg-[#0a0a12] overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between py-4">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <Tilt scale={1.12} transitionSpeed={2500}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-[0_0_20px_rgba(194,24,91,0.5)]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </Tilt>
            <span className="font-bold text-xl bg-gradient-to-r from-[#ff6bc1] to-[#b56bff] bg-clip-text text-transparent">
              SakhiSahyog
            </span>
          </motion.div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "About", ref: aboutRef },
              { label: "Features", ref: featuresRef },
              { label: "Support", ref: supportRef },
            ].map((nav, i) => (
              <motion.button
                key={nav.label}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => scrollTo(nav.ref)}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
              >
                {nav.label}
              </motion.button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-white/80 hover:text-white hover:bg-white/10 hidden sm:flex">
              <Link to="/login">Login</Link>
            </Button>
            <Tilt scale={1.05}>
              <Button asChild className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white hover:opacity-90 shadow-[0_0_20px_rgba(194,24,91,0.4)] rounded-full px-5">
                <Link to="/signup">
                  Get Started <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </Tilt>
          </div>
        </div>
      </nav>

      {/* ── HERO — Full-screen Tubes Background ─────────────── */}
      <TubesBackground
        className="min-h-screen"
        enableClickInteraction={true}
      >
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 pointer-events-none">

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto pointer-events-auto"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-pink-300 text-sm font-bold mb-8 shadow-lg">
              <Heart className="w-4 h-4 fill-current animate-pulse" />
              Empowering Women. Enabling Growth.
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] mb-6 tracking-tight">
              <span className="text-white drop-shadow-2xl">Digital Strength</span>
              <br />
              <span className="bg-gradient-to-r from-[#ff6bc1] via-[#c084fc] to-[#fb923c] bg-clip-text text-transparent drop-shadow-lg">
                for Every Sakhi
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl mx-auto">
              SakhiSahyog is a digital platform empowering women's Self Help Groups across India.
    
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Tilt scale={1.06}>
                <Button asChild size="lg" className="h-14 bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white hover:opacity-90 shadow-[0_0_40px_rgba(194,24,91,0.5)] text-lg px-10 rounded-2xl border border-white/20 font-bold">
                  <Link to="/signup">
                    Start Your Journey <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </Tilt>
              <Tilt scale={1.06}>
                <Button variant="outline" size="lg" asChild className="h-14 bg-white/5 border-white/20 text-white hover:bg-white/15 text-lg px-10 rounded-2xl backdrop-blur-sm font-bold">
                  <Link to="/login">Login to Dashboard</Link>
                </Button>
              </Tilt>
            </motion.div>

            {/* Floating stat pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-12">
              {[
                { label: "Active SHGs", value: "500+" },
                { label: "Total Members", value: "6,000+" },
                { label: "Savings Managed", value: "₹2Cr+" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/8 border border-white/15 backdrop-blur-md shadow-xl">
                  <p className="text-xl font-black text-white">{stat.value}</p>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 pointer-events-none"
          >
            <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
            </div>
          
          </motion.div>
        </div>
      </TubesBackground>

      {/* ── ABOUT ──────────────────────────────────────────── */}
      <section ref={aboutRef} className="relative py-28 px-6 bg-gradient-to-b from-[#0a0a12] to-[#0f0520]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
            <motion.p variants={fadeUp} className="text-sm font-bold text-pink-400 uppercase tracking-[0.2em] mb-4">About Us</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              Built for Women.{" "}
              <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Designed for Growth.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg leading-relaxed max-w-2xl mx-auto">
              SakhiSahyog is a premium digital platform built to empower women's Self Help Groups across India.
              We believe every woman deserves access to simple, gorgeous, and powerful financial tools built
              with Silicon Valley design standards for the Indian grassroots.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section ref={featuresRef} className="relative py-28 px-6 bg-[#0f0520]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-pink-400 uppercase tracking-[0.2em] mb-4">Features</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Everything Your SHG Needs</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {features.map((feature, idx) => (
              <Tilt key={idx} tiltMaxAngleX={12} tiltMaxAngleY={12} scale={1.04} transitionSpeed={1500} className="h-full">
                <motion.div
                  variants={fadeUp}
                  className="h-full p-7 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group relative overflow-hidden"
                  style={{ boxShadow: `0 0 40px ${feature.color}10` }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${feature.color}15, transparent 70%)` }}
                  />
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                    style={{ backgroundColor: `${feature.color}20`, boxShadow: `0 0 20px ${feature.color}30` }}
                  >
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              </Tilt>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HERO IMAGE (Women Empowerment) ─────────────────── */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-[#0f0520] to-[#1a0030] overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
              <motion.p variants={fadeUp} className="text-sm font-bold text-pink-400 uppercase tracking-[0.2em] mb-4">Our Mission</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                Sakhi by your side,{" "}
                <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">every step</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-white/60 text-lg leading-relaxed mb-8">
                Join thousands of women across India who use SakhiSahyog to manage savings, 
                track loans, and build a stronger financial future together.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Tilt scale={1.05}>
                  <Button asChild size="lg" className="bg-gradient-to-r from-[#C2185B] to-[#6A1B9A] text-white hover:opacity-90 shadow-[0_0_30px_rgba(194,24,91,0.4)] rounded-2xl px-8 font-bold">
                    <Link to="/signup">Join SakhiSahyog Today <ArrowRight className="w-5 h-5 ml-2" /></Link>
                  </Button>
                </Tilt>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <Tilt tiltReverse tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.02} transitionSpeed={2000}>
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(194,24,91,0.3)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#C2185B]/30 to-transparent pointer-events-none z-10" />
                  <img
                    src="https://images.livemint.com/img/2022/03/07/600x338/oped1_1646670646465_1646670652294.jpg"
                    alt="Women Empowerment SHG"
                    className="w-full object-cover rounded-3xl"
                    style={{ height: "380px" }}
                  />
                  {/* Floating glass badges */}
                  <div className="absolute top-6 -left-4 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-float">
                    <div className="bg-green-500/30 p-2 rounded-full"><PiggyBank className="w-5 h-5 text-green-300" /></div>
                    <div>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Total Savings</p>
                      <p className="text-sm font-black text-white">₹2,45,000</p>
                    </div>
                  </div>
                  <div className="absolute bottom-6 -right-4 z-20 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-float" style={{ animationDelay: "2s" }}>
                    <div className="bg-blue-500/30 p-2 rounded-full"><Users className="w-5 h-5 text-blue-300" /></div>
                    <div>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Active Members</p>
                      <p className="text-sm font-black text-white">12 Sakhis</p>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SUPPORT / FAQ ───────────────────────────────────── */}
      <section ref={supportRef} className="py-24 px-6 bg-gradient-to-b from-[#1a0030] to-[#0a0a12]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-pink-400 uppercase tracking-[0.2em] mb-4">Support</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white">Frequently Asked Questions</h2>
          </div>
          <motion.div className="space-y-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={staggerContainer}>
            {supportFAQs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-pink-400/30 transition-all group">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">{faq.q}</h3>
                    <p className="text-white/55 leading-relaxed">{faq.a}</p>
                  </div>
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer ref={contactRef} className="py-10 border-t border-white/10 bg-[#0a0a12]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-[0_0_15px_rgba(194,24,91,0.4)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-[#ff6bc1] to-[#b56bff] bg-clip-text text-transparent">
              SakhiSahyog
            </span>
          </div>
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} SakhiSahyog. Designed with ❤️ for Women Empowerment.
          </p>
        </div>
      </footer>
    </div>
  );
}