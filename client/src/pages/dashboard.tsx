import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Download, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import StatsCards from "@/components/stats-cards";
import ContractModal from "@/components/contract-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getStatusColor, getStatusText, getInitials, getAvatarColor } from "@/lib/utils";

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
        description: "A apărut o eroare la descărcarea contractului.",
        variant: "destructive",
      });
    }
  };

  const handleEmail = async (contract: ContractWithDetails) => {
    try {
      await apiRequest("POST", `/api/contracts/${contract.id}/email`, {
        recipient: contract.beneficiary.email,
        subject: `Contract ${contract.template.name} - Nr. ${contract.orderNumber}`,
        message: `Bună ziua,

Vă transmitem contractul pentru semnare.

Pentru a semna contractul, vă rugăm să accesați link-ul din emailul pe care îl veți primi.

Mulțumim,
Echipa Contract Manager`,
        attachPDF: true,
      });

      toast({
        title: "Succes",
        description: "Emailul cu contractul pentru semnare a fost trimis cu succes!",
      });

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la trimiterea emailului.",
        variant: "destructive",
      });
    }
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
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard Contracte</h2>
          <p className="text-gray-600 mt-1">Gestionați contractele dvs. rapid și eficient</p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {/* Recent Contracts */}
        <Card>
          <CardHeader>
            <CardTitle>Contracte Recente</CardTitle>
            <p className="text-sm text-gray-600">Ultimele 5 contracte create</p>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="text-center py-8">Se încarcă...</div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nu există contracte</div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10" style={{ backgroundColor: getAvatarColor(contract.beneficiary.name) }}>
                        <AvatarFallback className="text-white font-medium">
                          {getInitials(contract.beneficiary.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Contract Nr. {contract.orderNumber}</div>
                        <div className="text-sm text-gray-500">{contract.beneficiary.name}</div>
                        <div className="text-xs text-gray-400">{formatDate(contract.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className={getStatusColor(contract.status?.statusCode || '')}>
                        {getStatusText(contract.status?.statusCode || '')}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(contract)}
                          className="hover:bg-blue-50"
                          title="Previzualizează contractul"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contract)}
                          className="hover:bg-green-50"
                          title="Editează contractul"
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(contract)}
                          className="hover:bg-indigo-50"
                          title="Descarcă contractul ca PDF"
                        >
                          <Download className="h-4 w-4 text-indigo-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {contracts.length >= 5 && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/contracts")}
                    >
                      Vezi toate contractele
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
