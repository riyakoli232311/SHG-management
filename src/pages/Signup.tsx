import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, Heart, Users, Shield, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    shgName: "",
    leaderName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock signup - navigate to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-soft-gradient flex">
      {/* Left Side - Hero Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-empowerment-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%20fill%3D%22rgba(255%2C255%2C255%2C0.1)%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Join SakhiSahyog!</h1>
            <p className="text-lg text-white/80 max-w-md">
              Start your digital journey towards financial empowerment. Create your SHG in minutes.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Free forever for small SHGs",
              "No technical skills required",
              "24/7 support in your language",
              "Secure and transparent",
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#FBC02D] flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-[#C2185B] mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Signup Card */}
          <div className="bg-white rounded-3xl shadow-card p-8 border border-[#C2185B]/10">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-empowerment-gradient flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <span className="font-bold text-2xl text-gradient block">SakhiSahyog</span>
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create Your SHG</h1>
              <p className="text-muted-foreground">
                Register your Self Help Group in minutes
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* SHG Name */}
              <div className="space-y-2">
                <Label htmlFor="shgName" className="text-foreground font-medium">SHG Name</Label>
                <Input
                  id="shgName"
                  name="shgName"
                  type="text"
                  placeholder="e.g., Shakti Mahila SHG"
                  value={formData.shgName}
                  onChange={handleChange}
                  className="h-11 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
                />
              </div>

              {/* Leader Name */}
              <div className="space-y-2">
                <Label htmlFor="leaderName" className="text-foreground font-medium">Leader Name</Label>
                <Input
                  id="leaderName"
                  name="leaderName"
                  type="text"
                  placeholder="Enter group leader's name"
                  value={formData.leaderName}
                  onChange={handleChange}
                  className="h-11 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-11 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Create Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    className="h-11 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20 pr-10"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="h-11 border-[#C2185B]/20 focus:border-[#C2185B] focus:ring-[#C2185B]/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#C2185B] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-11 btn-gradient text-white border-0 text-base font-semibold mt-2"
              >
                Create SHG Account
              </Button>
            </form>

            {/* Login link */}
            <p className="text-center mt-6 text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-[#C2185B] font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-muted-foreground">
            &copy; 2024 SakhiSahyog. Empowering women's financial independence.
          </p>
        </div>
      </div>
    </div>
  );
}
