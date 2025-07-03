import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Mail, X } from "lucide-react";
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

  if (!contract) return null;

  // Generate preview content
  const generatePreview = () => {
    return contract.template.content
      .replace(/{{orderNumber}}/g, contract.orderNumber)
      .replace(/{{currentDate}}/g, formatDate(contract.createdAt))
      .replace(/{{beneficiary\.fullName}}/g, contract.beneficiary.fullName)
      .replace(/{{beneficiary\.address}}/g, contract.beneficiary.address || "")
      .replace(/{{beneficiary\.cnp}}/g, contract.beneficiary.cnp || "")
      .replace(/{{contract\.value}}/g, contract.value?.toString() || "")
      .replace(/{{contract\.currency}}/g, contract.currency)
      .replace(/{{contract\.startDate}}/g, formatDate(contract.startDate))
      .replace(/{{contract\.endDate}}/g, formatDate(contract.endDate))
      .replace(/{{contract\.notes}}/g, contract.notes || "");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Previzualizare Contract</DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(contract)}
              >
                <Download className="h-4 w-4 mr-1" />
                Descarcă PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEmail(contract)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Trimite Email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8 min-h-96">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">{contract.template.name.toUpperCase()}</h2>
            <p className="text-sm text-gray-600 mt-2">
              Nr. {contract.orderNumber} din {formatDate(contract.createdAt)}
            </p>
          </div>
          
          <div className="space-y-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {generatePreview()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
