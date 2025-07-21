import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import ContractTable from "@/components/contract-table";
import ContractModal from "@/components/contract-modal";
import EmailModal from "@/components/email-modal";
import Sidebar from "@/components/sidebar";
import { apiRequest } from "@/lib/queryClient";
import type { ContractWithDetails } from "@shared/schema";

export default function ContractsPage() {
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

  const handleDownload = (contract: ContractWithDetails) => {
    setSelectedContract(contract);
    // PDF download functionality will be handled by ContractModal
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
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contracte
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestionează toate contractele din sistem
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <ContractTable 
              contracts={contracts}
              onView={handleView}
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