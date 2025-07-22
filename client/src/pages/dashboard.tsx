import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import StatsCards from "@/components/stats-cards";
import ContractTable from "@/components/contract-table";
import ContractModal from "@/components/contract-modal";
import EmailModal from "@/components/email-modal";
import { Link, useLocation } from "wouter";
import type { ContractWithDetails } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contracts
  const { data: contracts = [], isLoading: contractsLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ["/api/contracts"],
  });

  // Fetch stats
  const { data: stats = { totalContracts: 0, pendingContracts: 0, sentContracts: 0, completedContracts: 0 } } = useQuery<{
    totalContracts: number;
    pendingContracts: number;
    sentContracts: number;
    completedContracts: number;
  }>({
    queryKey: ["/api/contracts/stats"],
  });

  // Delete contract mutation
  const deleteContractMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contracts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
      toast({
        title: "Success",
        description: "Contractul a fost șters cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la ștergerea contractului.",
        variant: "destructive",
      });
    },
  });

  const handleView = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    setIsContractModalOpen(true);
  };

  const handleEdit = (contract: ContractWithDetails) => {
    setLocation(`/contract-form?edit=${contract.id}`);
  };

  const handleDownload = async (contract: ContractWithDetails) => {
    try {
      const response = await fetch(`/api/contracts/${contract.id}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contract-${contract.orderNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "A apărut o eroare la descărcarea contractului.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    setIsEmailModalOpen(true);
  };

  const handleDelete = (contract: ContractWithDetails) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest contract?")) {
      deleteContractMutation.mutate(contract.id);
    }
  };

  const handleEmailSent = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Dashboard Contracte</h2>
              <p className="text-gray-600 mt-1">Gestionați contractele dvs. rapid și eficient</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/contract-form">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Contract Nou
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-gray-400" />
                <span className="text-gray-700 font-medium">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Contracts Table */}
          {contractsLoading ? (
            <div className="text-center py-8">Se încarcă...</div>
          ) : (
            <ContractTable
              contracts={contracts}
              onView={handleView}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onEmail={handleEmail}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <ContractModal
        contract={selectedContract}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onDownload={handleDownload}
        onEmail={handleEmail}
      />

      <EmailModal
        contract={selectedContract}
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSent={handleEmailSent}
      />
    </div>
  );
}
