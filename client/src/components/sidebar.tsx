import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, Plus, Users, Settings, BarChart3, File } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Contract Nou", href: "/contract-form", icon: Plus },
  { name: "Template-uri", href: "/templates", icon: FileText },
  { name: "Beneficiari", href: "/beneficiaries", icon: Users },
  { name: "Setări", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
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
    </aside>
  );
}
