import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, ArrowLeft } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Signup Card */}
        <div className="bg-card rounded-2xl shadow-card p-8 border border-border">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <PiggyBank className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl">SHG Manager</span>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Create Your SHG</h1>
          <p className="text-muted-foreground text-center mb-8">
            Register your Self Help Group in minutes
          </p>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* SHG Name */}
            <div className="space-y-2">
              <Label htmlFor="shgName">SHG Name</Label>
              <Input
                id="shgName"
                name="shgName"
                type="text"
                placeholder="e.g., Shakti Mahila SHG"
                value={formData.shgName}
                onChange={handleChange}
              />
            </div>

            {/* Leader Name */}
            <div className="space-y-2">
              <Label htmlFor="leaderName">Leader Name</Label>
              <Input
                id="leaderName"
                name="leaderName"
                type="text"
                placeholder="Enter group leader's name"
                value={formData.leaderName}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" size="lg">
              Create SHG Account
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center mt-6 text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
