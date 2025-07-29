import { File, Clock, Send, CheckCircle, Calendar, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: {
    totalContracts: number;
    pendingContracts: number;
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
    signedContractsTotal: number;
    completedContractsTotal: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const cards = [
    {
      title: "Total Contracte",
      value: stats.totalContracts,
      subtitle: null,
      icon: File,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "În Așteptare",
      value: stats.pendingContracts,
      subtitle: null,
      icon: Clock,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      title: "Rezervate",
      value: stats.reservedContracts,
      subtitle: null,
      icon: Calendar,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Semnate",
      value: stats.signedContracts,
      subtitle: formatCurrency(stats.signedContractsTotal),
      icon: Send,
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Finalizate",
      value: stats.completedContracts,
      subtitle: formatCurrency(stats.completedContractsTotal),
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
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-sm text-gray-500 mt-1 font-medium">{card.subtitle}</p>
                  )}
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
