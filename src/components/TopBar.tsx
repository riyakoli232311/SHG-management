import { Bell, Search, User, Sparkles, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/data/users";
import { Badge } from "@/components/ui/badge";

export function TopBar() {
  return (
    <header className="h-16 border-b border-[#C2185B]/10 bg-white flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - Welcome message */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">SakhiSahyog Dashboard</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#C2185B] fill-[#C2185B]" />
            Empowering Women. Enabling Growth.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search members, loans..."
          className="pl-10 bg-[#C2185B]/5 border-0 focus-visible:ring-[#C2185B]/30 rounded-xl"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-[#C2185B]/5">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-[#C2185B] to-[#AD1457] text-white text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 hover:bg-[#C2185B]/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#6A1B9A] flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{currentUser.name}</p>
                <Badge variant="secondary" className="text-xs font-normal bg-[#FBC02D]/20 text-[#F57F17] border-0">
                  {currentUser.role}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
