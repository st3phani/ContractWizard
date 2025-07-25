import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import ContractTable from "@/components/contract-table";
import ContractModal from "@/components/contract-modal";
import EmailModal from "@/components/email-modal";
import Sidebar from "@/components/sidebar";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { ContractWithDetails } from "@shared/schema";

export default function ContractsPage() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const [contractToEmail, setContractToEmail] = useState<ContractWithDetails | null>(null);

  const {
    data: contracts = [],
    isLoading,
    error,
  } = useQuery<ContractWithDetails[]>({
    queryKey: ["/api/contracts"],
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error('Failed to delete contract');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
    },
  });

  const handleView = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
  };

  const handleEdit = (contract: ContractWithDetails) => {
    setLocation(`/contract-form?edit=${contract.id}`);
  };

  const handleDownload = async (contract: ContractWithDetails) => {
    try {
      const response = await fetch(`/api/contracts/${contract.id}/pdf`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contract-${contract.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Eroare la descărcarea PDF-ului:', error);
    }
  };

  const handleEmail = (contract: ContractWithDetails) => {
    setContractToEmail(contract);
  };

  const handleDelete = (contract: ContractWithDetails) => {
    if (confirm("Ești sigur că vrei să ștergi acest contract?")) {
      deleteContractMutation.mutate(contract.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Se încarcă contractele...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Eroare la încărcarea contractelor</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Contracte</h1>
              <p className="text-gray-600 mt-1">Gestionează toate contractele din sistem</p>
            </div>
            <Link href="/contract-form">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Contract Nou
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <ContractTable 
              contracts={contracts}
              onView={handleView}
              onEdit={handleEdit}
              onDownload={handleDownload}
              onEmail={handleEmail}
              onDelete={handleDelete}
            />
          </div>

          {selectedContract && (
            <ContractModal
              contract={selectedContract}
              isOpen={!!selectedContract}
              onClose={() => setSelectedContract(null)}
              onDownload={handleDownload}
              onEmail={handleEmail}
            />
          )}

          {contractToEmail && (
            <EmailModal
              contract={contractToEmail}
              isOpen={!!contractToEmail}
              onClose={() => setContractToEmail(null)}
              onSent={() => {
                setContractToEmail(null);
                queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}