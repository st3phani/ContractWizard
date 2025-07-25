import { useState } from "react";
import { Eye, Download, Mail, Trash2, Search, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getStatusColor, getStatusText, getInitials, getAvatarColor } from "@/lib/utils";
import type { ContractWithDetails } from "@shared/schema";

interface ContractTableProps {
  contracts: ContractWithDetails[];
  onView: (contract: ContractWithDetails) => void;
  onEdit: (contract: ContractWithDetails) => void;
  onDownload: (contract: ContractWithDetails) => void;
  onEmail: (contract: ContractWithDetails) => void;
  onDelete: (contract: ContractWithDetails) => void;
}

export default function ContractTable({ contracts, onView, onEdit, onDownload, onEmail, onDelete }: ContractTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Find the highest order number to determine which contract can be deleted
  const maxOrderNumber = Math.max(...contracts.map(c => c.orderNumber || 0));

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = 
      String(contract.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.beneficiary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.template.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const canDeleteContract = (contract: ContractWithDetails) => {
    return contract.orderNumber === maxOrderNumber;
  };

  const canPerformActions = (contract: ContractWithDetails) => {
    return contract.status !== "reserved";
  };

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Contracte Recente</CardTitle>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută contracte..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Toate statusurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="draft">În Așteptare</SelectItem>
                <SelectItem value="sent">Trimis</SelectItem>
                <SelectItem value="completed">Finalizat</SelectItem>
                <SelectItem value="reserved">Rezervat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 pe pagină</SelectItem>
                <SelectItem value="10">10 pe pagină</SelectItem>
                <SelectItem value="20">20 pe pagină</SelectItem>
                <SelectItem value="50">50 pe pagină</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nr. Ordine</TableHead>
              <TableHead>Beneficiar</TableHead>
              <TableHead>Tip Contract</TableHead>
              <TableHead>Data Creării</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Acțiuni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContracts.map((contract) => (
              <TableRow key={contract.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{contract.orderNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className={`${getAvatarColor(contract.beneficiary.name || "")} text-white`}>
                        {getInitials(contract.beneficiary.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contract.beneficiary.name}</div>
                      <div className="text-sm text-gray-500">{contract.beneficiary.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contract.template?.name || 'Template șters'}</TableCell>
                <TableCell>{formatDate(contract.createdAt)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(contract.status)}>
                    {getStatusText(contract.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canPerformActions(contract) ? onView(contract) : undefined}
                      disabled={!canPerformActions(contract)}
                      className={!canPerformActions(contract) ? "opacity-30 cursor-not-allowed" : ""}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contract)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canPerformActions(contract) ? onDownload(contract) : undefined}
                      disabled={!canPerformActions(contract)}
                      className={!canPerformActions(contract) ? "opacity-30 cursor-not-allowed" : ""}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canPerformActions(contract) ? onEmail(contract) : undefined}
                      disabled={!canPerformActions(contract)}
                      className={!canPerformActions(contract) ? "opacity-30 cursor-not-allowed" : ""}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canDeleteContract(contract) ? onDelete(contract) : undefined}
                      disabled={!canDeleteContract(contract)}
                      className={!canDeleteContract(contract) ? "opacity-30 cursor-not-allowed" : ""}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredContracts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Nu au fost găsite contracte
          </div>
        )}

        {/* Pagination */}
        {filteredContracts.length > 0 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-700">
              Afișare {startIndex + 1}-{Math.min(endIndex, filteredContracts.length)} din {filteredContracts.length} contracte
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterioara
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, filteredPages) => (
                    <div key={page} className="flex items-center">
                      {index > 0 && filteredPages[index - 1] !== page - 1 && (
                        <span className="px-2 text-gray-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Următoarea
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
