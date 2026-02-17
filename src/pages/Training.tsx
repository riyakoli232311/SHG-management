import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Play, Clock, Award, Users, Sparkles } from "lucide-react";

const trainingModules = [
  {
    id: 1,
    title: "Financial Literacy Basics",
    description: "Learn the fundamentals of managing money, budgeting, and saving.",
    duration: "2 hours",
    level: "Beginner",
    enrolled: 45,
    icon: BookOpen,
  },
  {
    id: 2,
    title: "SHG Management",
    description: "Best practices for managing Self Help Groups effectively.",
    duration: "3 hours",
    level: "Intermediate",
    enrolled: 32,
    icon: Users,
  },
  {
    id: 3,
    title: "Microfinance Fundamentals",
    description: "Understanding loans, interest rates, and repayment strategies.",
    duration: "2.5 hours",
    level: "Beginner",
    enrolled: 28,
    icon: Award,
  },
  {
    id: 4,
    title: "Digital Skills for SHGs",
    description: "Using digital tools to manage and grow your SHG.",
    duration: "1.5 hours",
    level: "Beginner",
    enrolled: 56,
    icon: Sparkles,
  },
];

export default function Training() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Training & Skills"
        description="Empower yourself with knowledge and skills for SHG success"
      >
        <Button className="btn-gradient text-white border-0">
          <BookOpen className="w-4 h-4 mr-2" />
          My Learning
        </Button>
      </PageHeader>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6A1B9A] to-[#C2185B] flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FBC02D] to-[#F57F17] flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#C2185B]/10 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24h</p>
                <p className="text-sm text-muted-foreground">Learning Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Modules */}
      <div className="grid md:grid-cols-2 gap-6">
        {trainingModules.map((module) => (
          <Card key={module.id} className="border-[#C2185B]/10 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C2185B]/10 to-[#6A1B9A]/10 flex items-center justify-center flex-shrink-0">
                  <module.icon className="w-7 h-7 text-[#C2185B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{module.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C2185B]/10 text-[#C2185B] text-xs font-medium">
                      {module.level}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {module.enrolled} enrolled
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#C2185B]/10">
                <Button className="w-full btn-gradient text-white border-0">
                  <Play className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}
