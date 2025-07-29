import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, PenTool, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ContractWithDetails } from "@shared/schema";

interface ContractModalProps {
  contract: ContractWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (contract: ContractWithDetails) => void;
  onEmail: (contract: ContractWithDetails) => void;
}

export default function ContractModal({ contract, isOpen, onClose, onDownload, onEmail }: ContractModalProps) {
  const [previewContent, setPreviewContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const canSendContract = (contract: ContractWithDetails) => {
    return contract.status?.statusCode !== "reserved" && 
           contract.status?.statusCode !== "signed" && 
           contract.status?.statusCode !== "completed";
  };

  // Fetch preview from backend API when modal opens
  useEffect(() => {
    if (contract && isOpen) {
      setIsLoading(true);
      fetch(`/api/contracts/${contract.id}/preview`)
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`HTTP ${res.status}: ${errorData.message || 'Server error'}`);
          }
          return res.json();
        })
        .then(data => {
          if (data.content) {
            setPreviewContent(data.content);
          } else {
            setPreviewContent("Nu s-a putut încărca conținutul contractului.");
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to load preview:', error);
          setPreviewContent(`Eroare la încărcarea contractului: ${error.message}`);
          setIsLoading(false);
        });
    }
  }, [contract, isOpen]);

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:right-2 [&>button]:top-2">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Previzualizare Contract</DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(contract)}
                title="Descarcă contractul ca PDF"
                aria-label="Descarcă contractul ca PDF"
              >
                <Download className="h-4 w-4 mr-1" />
                Descarcă PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => canSendContract(contract) ? onEmail(contract) : undefined}
                disabled={!canSendContract(contract)}
                className={!canSendContract(contract) ? "opacity-30 cursor-not-allowed" : ""}
                title="Trimite la semnat"
                aria-label="Trimite la semnat"
              >
                <PenTool className="h-4 w-4 mr-1" />
                Trimite la Semnat
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-96">
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            {isLoading ? (
              <div className="text-center py-8">Se încarcă contractul...</div>
            ) : (
              <div 
                dangerouslySetInnerHTML={{ __html: previewContent }}
                className="prose prose-sm max-w-none"
                style={{ fontFamily: 'Arial, sans-serif' }}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
