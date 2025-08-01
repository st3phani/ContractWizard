import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StatsCards from "@/components/stats-cards";
import ContractTable from "@/components/contract-table";
import ContractModal from "@/components/contract-modal";

import { useLocation } from "wouter";
import type { ContractWithDetails } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch latest 5 contracts for dashboard
  const { data: allContracts = [], isLoading: contractsLoading } = useQuery<ContractWithDetails[]>({
    queryKey: ["/api/contracts"],
  });

  // Get only the latest 5 contracts for dashboard display
  const contracts = allContracts.slice(0, 5);

  // Fetch stats
  const { data: stats = { totalContracts: 0, pendingContracts: 0, signedContracts: 0, completedContracts: 0, reservedContracts: 0 } } = useQuery<{
    totalContracts: number;
    pendingContracts: number;
    signedContracts: number;
    completedContracts: number;
    reservedContracts: number;
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
        description: "Contract deleted successfully!",
        className: "bg-green-600 text-white border-green-600",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while deleting the contract.",
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
      
      // Use the appropriate filename format for signed contracts
      let filename: string;
      if (contract.status?.statusCode === 'signed' && contract.signedToken) {
        filename = `CTR_${contract.orderNumber}_${contract.signedToken}.pdf`;
      } else {
        filename = `contract-${contract.orderNumber}.pdf`;
      }
      
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while downloading the contract.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = async (contract: ContractWithDetails) => {
    try {
      await apiRequest("POST", `/api/contracts/${contract.id}/email`, {
        recipient: contract.beneficiary?.email || '',
        subject: `Contract ${contract.template?.name || 'N/A'} - Nr. ${contract.orderNumber}`,
        message: `Hello,

We are sending you the contract for signing.

To sign the contract, please access the link in the email you will receive.

Thank you,
Contract Manager Team`,
        attachPDF: true,
      });

      toast({
        title: "Success",
        description: "Email with contract for signing sent successfully!",
        className: "bg-green-600 text-white border-green-600",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (contract: ContractWithDetails) => {
    if (window.confirm("Are you sure you want to delete this contract?")) {
      deleteContractMutation.mutate(contract.id);
    }
  };

  const handleEmailSent = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Contracts Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your contracts quickly and efficiently</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Contracts Table */}
        {contractsLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <ContractTable
            contracts={contracts}
            onView={handleView}
            onEdit={handleEdit}
            onDownload={handleDownload}
            onEmail={handleEmail}
            onDelete={handleDelete}
            showPagination={false}
            title="Recent Contracts (Latest 5)"
          />
        )}
      </div>

      {/* Modals */}
      <ContractModal
        contract={selectedContract}
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onDownload={handleDownload}
        onEmail={handleEmail}
      />


    </>
  );
}
