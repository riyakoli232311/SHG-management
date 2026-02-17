import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, ArrowLeft, Heart, Users, Shield, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-soft-gradient flex">
      {/* Left Side - Hero Image/Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-empowerment-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back, Sakhi!</h1>
            <p className="text-lg text-white/80 max-w-md">
              Continue your journey towards financial empowerment. Your SHG is waiting for you.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">10,000+ Active SHGs</p>
                <p className="text-sm text-white/70">Growing together</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Bank-Grade Security</p>
                <p className="text-sm text-white/70">Your data is protected</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Made for Women</p>
                <p className="text-sm text-white/70">By women, for women</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#C2185B] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-card p-8 border border-[#C2185B]/10">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-empowerment-gradient flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <span className="font-bold text-2xl text-gradient block">SakhiSahyog</span>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">
                Sign in to access your SHG dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-foreground font-medium">Select Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role" className="h-12 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20">
                    <SelectValue placeholder="Choose your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="leader">SHG Leader</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email/Phone */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email or Phone</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter email or phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#C2185B] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot password */}
              <div className="text-right">
                <a href="#" className="text-sm text-[#C2185B] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-12 btn-gradient text-white border-0 text-base font-semibold"
              >
                Login to Dashboard
              </Button>
            </form>

            {/* Signup link */}
            <p className="text-center mt-6 text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-[#C2185B] font-semibold hover:underline">
                Create SHG
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-sm text-muted-foreground">
            &copy; 2024 SakhiSahyog. Empowering women's financial independence.
          </p>
        </div>
      </div>
    </div>
  );
}
