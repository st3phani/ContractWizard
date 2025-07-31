import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, User, Globe, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ContractLogEntry {
  id: number;
  contractId: number;
  partnerId?: number;
  actionCode: string;
  ipAddress?: string;
  userAgent?: string;
  additionalData?: string;
  createdAt: string;
  actionName?: string;
}

interface ContractLogModalProps {
  contractId: number;
  contractOrderNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractLogModal({ contractId, contractOrderNumber, isOpen, onClose }: ContractLogModalProps) {
  const { data: logHistory, isLoading } = useQuery({
    queryKey: ['/api/contracts', contractId, 'history'],
    enabled: isOpen && !!contractId,
  });

  const getActionBadgeVariant = (actionCode: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (actionCode) {
      case 'contract_created':
      case 'contract_reserved':
        return 'default';
      case 'contract_edited':
        return 'secondary';
      case 'contract_sent_for_signing':
        return 'outline';
      case 'signing_page_viewed':
      case 'contract_preview_accessed':
        return 'secondary';
      case 'contract_signed':
        return 'default';
      case 'signed_contract_sent':
      case 'signed_contract_page_viewed':
        return 'outline';
      case 'contract_pdf_downloaded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (actionCode: string) => {
    switch (actionCode) {
      case 'contract_created':
      case 'contract_reserved':
      case 'contract_edited':
        return <FileText className="h-4 w-4" />;
      case 'contract_sent_for_signing':
      case 'signed_contract_sent':
        return <Globe className="h-4 w-4" />;
      case 'signing_page_viewed':
      case 'contract_preview_accessed':
      case 'signed_contract_page_viewed':
        return <Activity className="h-4 w-4" />;
      case 'contract_signed':
        return <User className="h-4 w-4" />;
      case 'contract_pdf_downloaded':
        return <FileText className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseAdditionalData = (additionalDataString?: string) => {
    if (!additionalDataString) return null;
    try {
      return JSON.parse(additionalDataString);
    } catch {
      return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Contract Log History - Contract #{contractOrderNumber}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading contract history...</p>
            </div>
          ) : !logHistory || logHistory.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found for this contract.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logHistory.map((entry: ContractLogEntry) => {
                const additionalData = parseAdditionalData(entry.additionalData);
                
                return (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getActionIcon(entry.actionCode)}
                        </div>
                        <div>
                          <Badge variant={getActionBadgeVariant(entry.actionCode)}>
                            {entry.actionName || entry.actionCode}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(entry.createdAt)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {entry.ipAddress && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">IP Address:</span>
                          <span className="font-mono">{entry.ipAddress}</span>
                        </div>
                      )}
                      
                      {entry.partnerId && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Partner ID:</span>
                          <span>{entry.partnerId}</span>
                        </div>
                      )}
                    </div>

                    {additionalData && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-2">Additional Details:</p>
                        <div className="text-sm text-gray-600">
                          {Object.entries(additionalData).map(([key, value]) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                              <span className="font-mono text-right">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.userAgent && (
                      <div className="mt-3 text-xs text-gray-500 truncate">
                        <span className="font-medium">User Agent:</span> {entry.userAgent}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}