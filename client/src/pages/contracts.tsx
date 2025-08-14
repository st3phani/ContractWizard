import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import ContractTable from "@/components/contract-table";
import ContractModal from "@/components/contract-modal";
import { useToast } from "@/hooks/use-toast";

import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { ContractWithDetails } from "@shared/schema";

export default function ContractsPage() {
  const [, setLocation] = useLocation();
  const [selectedContract, setSelectedContract] = useState<ContractWithDetails | null>(null);
  const { toast } = useToast();


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
      
      // Use the appropriate filename format for signed contracts
      let filename: string;
      if (contract.status?.statusCode === 'signed' && contract.signedToken) {
        filename = `CTR_${contract.orderNumber}_${contract.signedToken}.pdf`;
      } else {
        filename = `contract-${contract.orderNumber}.pdf`;
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const handleEmail = async (contract: ContractWithDetails) => {
    try {
      await apiRequest("POST", `/api/contracts/${contract.id}/email`, {
        recipient: contract.beneficiary?.email || '',
        subject: `Contract ${contract.template?.name || 'Unknown'} - No. ${contract.orderNumber}`,
        message: `Hello,

We are sending you the contract for signing.

To sign the contract, please access the link from the email you will receive.

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
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contract.id}/history`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (contract: ContractWithDetails) => {
    if (confirm("Are you sure you want to delete this contract?")) {
      deleteContractMutation.mutate(contract.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading contracts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading contracts</div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Contracts</h2>
              <p className="text-gray-600 mt-1">Manage all contracts in the system</p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  console.log("Direct navigation attempt");
                  window.location.href = '/contract-form';
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                title="Create a new contract"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </button>
              <br/>
              <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                Debug: <a href="/contract-form" style={{ color: '#0066cc' }}>Direct link test</a>
              </small>
            </div>
          </div>
        </header>

      {/* Content */}
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


        </div>
    </>
  );
}