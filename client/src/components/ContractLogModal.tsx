import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Calendar, User, Globe, Activity, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface ContractLogEntry {
  id: number;
  contractId: number;
  partnerId?: number;
  actionCode: {
    id: number;
    actionCode: string;
    actionName: string;
    description: string;
    createdAt: string;
  };
  ipAddress?: string;
  userAgent?: string;
  additionalData?: {
    signingUrl?: string;
    signingToken?: string;
    recipientEmail?: string;
    subject?: string;
    accessedUrl?: string;
    previewContext?: string;
    signedToken?: string;
    signedContractUrl?: string;
    adminEmail?: string;
    downloadUrl?: string;
    filename?: string;
    contractStatus?: string;
    sourcePage?: string;
    refererUrl?: string;
  };
  createdAt: string;
  partner?: {
    id: number;
    name: string;
    email: string;
  };
}

interface ContractLogModalProps {
  contractId: number;
  contractOrderNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ContractLogModal({ contractId, contractOrderNumber, isOpen, onClose }: ContractLogModalProps) {
  const { data: logHistory = [], isLoading } = useQuery<ContractLogEntry[]>({
    queryKey: [`/api/contracts/${contractId}/history`],
    enabled: isOpen && !!contractId,
  });

  console.log('Modal opened for contract:', contractId);
  console.log('Query key:', ['/api/contracts', contractId, 'history']);
  console.log('Raw logHistory data:', logHistory);
  console.log('logHistory length:', logHistory?.length);
  console.log('First entry:', logHistory[0]);

  const getActionBadgeVariant = (actionCodeString: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (actionCodeString) {
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

  const getActionIcon = (actionCodeString: string) => {
    switch (actionCodeString) {
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
          ) : !Array.isArray(logHistory) || logHistory.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity logs found for this contract.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(logHistory) && logHistory.map((entry: ContractLogEntry, index: number) => {
                console.log(`Entry ${index + 1}:`, entry);
                
                return (
                  <div
                    key={entry.id}
                    className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          {getActionIcon(entry.actionCode?.actionCode || 'unknown')}
                        </div>
                        <div>
                          <Badge variant={getActionBadgeVariant(entry.actionCode?.actionCode || 'unknown')}>
                            {entry.actionCode?.actionName || 'Unknown Action'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(entry.createdAt)}
                      </div>
                    </div>
                    
                    {entry.actionCode?.description && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Description:</span>
                        <span>{entry.actionCode.description}</span>
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Log ID:</span>
                        <span className="font-mono">#{entry.id}</span>
                      </div>

                      {entry.ipAddress && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">IP Address:</span>
                          <span className="font-mono">{entry.ipAddress}</span>
                        </div>
                      )}
                      
                      {entry.partner && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Partner:</span>
                          <span>{entry.partner.name}</span>
                        </div>
                      )}

                      {entry.userAgent && (
                        <div className="flex items-start gap-2">
                          <Activity className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-600">User Agent:</span>
                            <div className="font-mono text-xs text-gray-700 break-all mt-1">{entry.userAgent}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Data Section for various action codes */}
                    {entry.additionalData && (entry.actionCode?.actionCode === 'contract_sent_for_signing' || entry.actionCode?.actionCode === 'signing_page_viewed' || entry.actionCode?.actionCode === 'contract_preview_accessed' || entry.actionCode?.actionCode === 'contract_signed' || entry.actionCode?.actionCode === 'signed_contract_sent' || entry.actionCode?.actionCode === 'signed_contract_page_viewed' || entry.actionCode?.actionCode === 'contract_pdf_downloaded') && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          {entry.actionCode?.actionCode === 'contract_sent_for_signing' 
                            ? 'Contract Sending Details' 
                            : entry.actionCode?.actionCode === 'signing_page_viewed'
                            ? 'Signing Page Access Details'
                            : entry.actionCode?.actionCode === 'contract_preview_accessed'
                            ? 'Contract Preview Details'
                            : entry.actionCode?.actionCode === 'contract_signed'
                            ? 'Contract Signing Details'
                            : entry.actionCode?.actionCode === 'signed_contract_sent'
                            ? 'Signed Contract Sending Details'
                            : entry.actionCode?.actionCode === 'signed_contract_page_viewed'
                            ? 'Signed Contract Access Details'
                            : 'PDF Download Details'}
                        </h4>
                        <div className="grid grid-cols-1 gap-3 text-sm">
                          {entry.additionalData.signingUrl && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Signing URL:</span>
                                <div className="mt-1">
                                  <a 
                                    href={entry.additionalData.signingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-mono text-xs break-all underline"
                                  >
                                    {entry.additionalData.signingUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          {entry.additionalData.accessedUrl && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-orange-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Accessed URL:</span>
                                <div className="mt-1">
                                  <a 
                                    href={entry.additionalData.accessedUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-800 font-mono text-xs break-all underline"
                                  >
                                    {entry.additionalData.accessedUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          {entry.additionalData.signingToken && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">Signing Token:</span>
                              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{entry.additionalData.signingToken}</span>
                            </div>
                          )}
                          {entry.additionalData.recipientEmail && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-purple-500" />
                              <span className="text-gray-600">Recipient Email:</span>
                              <span className="font-mono text-xs">{entry.additionalData.recipientEmail}</span>
                            </div>
                          )}
                          {entry.additionalData.previewContext && (
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-purple-500" />
                              <span className="text-gray-600">Preview Context:</span>
                              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                {entry.additionalData.previewContext}
                              </span>
                            </div>
                          )}
                          {entry.additionalData.signedToken && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">Signed Contract Token:</span>
                              <span className="font-mono text-xs bg-green-50 text-green-600 px-2 py-1 rounded">{entry.additionalData.signedToken}</span>
                            </div>
                          )}
                          {entry.additionalData.signedContractUrl && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-green-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Signed Contract Link:</span>
                                <div className="mt-1">
                                  <a 
                                    href={entry.additionalData.signedContractUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-800 font-mono text-xs break-all underline"
                                  >
                                    {entry.additionalData.signedContractUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          {entry.additionalData.adminEmail && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-blue-500" />
                              <span className="text-gray-600">Administrator Email:</span>
                              <span className="font-mono text-xs">{entry.additionalData.adminEmail}</span>
                            </div>
                          )}
                          {entry.additionalData.downloadUrl && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-blue-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Download URL:</span>
                                <div className="mt-1">
                                  <a 
                                    href={entry.additionalData.downloadUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 font-mono text-xs break-all underline"
                                  >
                                    {entry.additionalData.downloadUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          {entry.additionalData.filename && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              <span className="text-gray-600">Filename:</span>
                              <span className="font-mono text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded">{entry.additionalData.filename}</span>
                            </div>
                          )}
                          {entry.additionalData.contractStatus && (
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">Contract Status:</span>
                              <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">{entry.additionalData.contractStatus}</span>
                            </div>
                          )}
                          {entry.additionalData.sourcePage && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-green-500" />
                              <span className="text-gray-600">Source Page:</span>
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">{entry.additionalData.sourcePage}</span>
                            </div>
                          )}
                          {entry.additionalData.refererUrl && entry.additionalData.refererUrl !== 'Direct Access' && (
                            <div className="flex items-start gap-2">
                              <Globe className="h-4 w-4 text-orange-500 mt-0.5" />
                              <div>
                                <span className="text-gray-600">Source Page URL:</span>
                                <div className="mt-1">
                                  <a 
                                    href={entry.additionalData.refererUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-800 font-mono text-xs break-all underline"
                                  >
                                    {entry.additionalData.refererUrl}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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