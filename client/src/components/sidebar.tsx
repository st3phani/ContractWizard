import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, Plus, Users, Settings, BarChart3, File, FolderOpen, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { UserProfile } from "@shared/schema";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "New Contract", href: "/contract-form", icon: Plus },
  { name: "Contracts", href: "/contracts", icon: FolderOpen },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Partners", href: "/partners", icon: Users },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  // Fetch user profile
  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
  });

  // Generate initials from first and last name
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "AD";
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return first + last;
  };

  const displayName = userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}` 
    : "Administrator";
  
  const displayEmail = userProfile?.email || "admin@contractmanager.ro";
  const initials = getInitials(userProfile?.firstName, userProfile?.lastName);

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col h-screen">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <File className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Contract Manager</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer",
                    isActive
                      ? "text-white bg-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Administrator Profile */}
      <div className="p-6 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer hover:bg-gray-50">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link href="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
