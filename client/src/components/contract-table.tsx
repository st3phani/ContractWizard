import { useState } from "react";
import { Eye, Download, PenTool, Trash2, Search, Edit, ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusColor, getStatusText, getInitials, getAvatarColor } from "@/lib/utils";
import { useDateFormat } from "@/hooks/use-date-format";
import type { ContractWithDetails } from "@shared/schema";
import { paginateItems, type PaginationConfig } from "@/utils/paginationUtils";
import { ContractLogModal } from "@/components/ContractLogModal";

interface ContractTableProps {
  contracts: ContractWithDetails[];
  onView: (contract: ContractWithDetails) => void;
  onEdit: (contract: ContractWithDetails) => void;
  onDownload: (contract: ContractWithDetails) => void;
  onEmail: (contract: ContractWithDetails) => void;
  onDelete: (contract: ContractWithDetails) => void;
  showPagination?: boolean;
  title?: string;
}

export default function ContractTable({ contracts, onView, onEdit, onDownload, onEmail, onDelete, showPagination = true, title }: ContractTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [confirmSendContract, setConfirmSendContract] = useState<ContractWithDetails | null>(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [selectedContractForLog, setSelectedContractForLog] = useState<ContractWithDetails | null>(null);
  const { formatDate } = useDateFormat();
  // Find the highest order number to determine which contract can be deleted
  const maxOrderNumber = Math.max(...contracts.map(c => c.orderNumber || 0));

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = 
      String(contract.orderNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.beneficiary?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.template?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || contract.status?.statusCode === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Apply pagination using utils (only if showPagination is true)
  let paginatedContracts = filteredContracts;
  let totalItems = filteredContracts.length;
  let totalPages = 1;
  let hasNextPage = false;
  let hasPreviousPage = false;
  let startIndex = 0;
  let endIndex = filteredContracts.length;

  if (showPagination) {
    const paginationConfig: PaginationConfig = { currentPage, itemsPerPage };
    const paginationResult = paginateItems(filteredContracts, paginationConfig);
    
    paginatedContracts = paginationResult.items;
    totalItems = paginationResult.totalItems;
    totalPages = paginationResult.totalPages;
    hasNextPage = paginationResult.hasNextPage;
    hasPreviousPage = paginationResult.hasPreviousPage;
    startIndex = paginationResult.startIndex;
    endIndex = paginationResult.endIndex;
  }

  const canDeleteContract = (contract: ContractWithDetails) => {
    return contract.orderNumber === maxOrderNumber;
  };

  const canPerformActions = (contract: ContractWithDetails) => {
    return contract.status?.statusCode !== "reserved";
  };

  const canSendContract = (contract: ContractWithDetails) => {
    return contract.status?.statusCode !== "reserved" && 
           contract.status?.statusCode !== "signed" && 
           contract.status?.statusCode !== "completed" &&
           contract.status?.statusCode !== "sent";
  };

  const handleConfirmSend = () => {
    if (confirmSendContract) {
      onEmail(confirmSendContract);
      setConfirmSendContract(null);
    }
  };

  const handleViewLog = (contract: ContractWithDetails) => {
    setSelectedContractForLog(contract);
    setLogModalOpen(true);
  };

  const handleCloseLogModal = () => {
    setLogModalOpen(false);
    setSelectedContractForLog(null);
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
    <>
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title || "Contracts"}</CardTitle>
          {showPagination && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="draft">Pending</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No.</TableHead>
              <TableHead>Partner</TableHead>
              <TableHead>Contract Type</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContracts.map((contract) => (
              <TableRow key={contract.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{contract.orderNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className={`${getAvatarColor(contract.beneficiary?.name || "")} text-white`}>
                        {getInitials(contract.beneficiary?.name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contract.beneficiary?.name}</div>
                      <div className="text-sm text-gray-500">{contract.beneficiary?.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{contract.template?.name || 'Deleted template'}</TableCell>
                <TableCell>{formatDate(contract.createdAt)}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(contract.status?.statusCode || "")}>
                    {contract.status?.statusLabel || "Unknown"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canPerformActions(contract) ? onView(contract) : undefined}
                      disabled={!canPerformActions(contract)}
                      className={!canPerformActions(contract) ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-50"}
                      title="Preview contract"
                      aria-label="Preview contract"
                    >
                      <Eye className={`h-4 w-4 ${!canPerformActions(contract) ? "" : "text-blue-600"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(contract)}
                      className="hover:bg-green-50"
                      title="Edit contract"
                      aria-label="Edit contract"
                    >
                      <Edit className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canPerformActions(contract) ? onDownload(contract) : undefined}
                      disabled={!canPerformActions(contract)}
                      className={!canPerformActions(contract) ? "opacity-30 cursor-not-allowed" : "hover:bg-indigo-50"}
                      title="Download contract as PDF"
                      aria-label="Download contract as PDF"
                    >
                      <Download className={`h-4 w-4 ${!canPerformActions(contract) ? "" : "text-indigo-600"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canSendContract(contract) ? setConfirmSendContract(contract) : undefined}
                      disabled={!canSendContract(contract)}
                      className={!canSendContract(contract) ? "opacity-30 cursor-not-allowed" : "hover:bg-purple-50"}
                      title="Send for signing"
                      aria-label="Send for signing"
                    >
                      <PenTool className={`h-4 w-4 ${!canSendContract(contract) ? "" : "text-purple-600"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewLog(contract)}
                      className="hover:bg-orange-50"
                      title="View contract log history"
                      aria-label="View contract log history"
                    >
                      <Activity className="h-4 w-4 text-orange-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => canDeleteContract(contract) ? onDelete(contract) : undefined}
                      disabled={!canDeleteContract(contract)}
                      className={!canDeleteContract(contract) ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50"}
                      title="Delete contract"
                      aria-label="Delete contract"
                    >
                      <Trash2 className={`h-4 w-4 ${!canDeleteContract(contract) ? "" : "text-red-600"}`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {totalItems === 0 && (
          <div className="text-center py-8 text-gray-500">
            No contracts found
          </div>
        )}

        {/* Pagination Controls */}
        {showPagination && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Showing:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-700">
                of {totalItems} {totalItems === 1 ? 'contract' : 'contracts'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!hasPreviousPage}
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                    title={`Go to page ${pageNum}`}
                    aria-label={`Go to page ${pageNum}`}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!hasNextPage}
                title="Next page"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Confirmation Dialog for Sending Contract */}
    <Dialog open={!!confirmSendContract} onOpenChange={() => setConfirmSendContract(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Sending for Signature</DialogTitle>
          <DialogDescription>
            Are you sure you want to send contract {confirmSendContract?.orderNumber} for signature to partner {confirmSendContract?.beneficiary?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              <strong>What will happen:</strong><br />
              • An email with the signing link will be sent to {confirmSendContract?.beneficiary?.email}<br />
              • Contract status will be changed to "Sent"<br />
              • Partner will be able to digitally sign the contract
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setConfirmSendContract(null)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSend}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Send for Signing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Contract Log Modal */}
    {selectedContractForLog && (
      <ContractLogModal
        contractId={selectedContractForLog.id}
        contractOrderNumber={selectedContractForLog.orderNumber || 0}
        isOpen={logModalOpen}
        onClose={handleCloseLogModal}
      />
    )}
  </>
  );
}
