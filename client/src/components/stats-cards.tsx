import { File, Clock, Send, CheckCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalContracts: number;
    pendingContracts: number;
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Contracts",
      value: stats.totalContracts,
      icon: File,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      title: "Reserved",
      value: stats.reservedContracts,
      icon: Calendar,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending",
      value: stats.pendingContracts,
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Signed",
      value: stats.signedContracts,
      icon: Send,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Completed",
      value: stats.completedContracts,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
