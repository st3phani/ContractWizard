import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PenTool, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ContractWithDetails } from "@shared/schema";

interface EmailModalProps {
  contract: ContractWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export default function EmailModal({ contract, isOpen, onClose, onSent }: EmailModalProps) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachPDF, setAttachPDF] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Initialize form when contract changes
  useEffect(() => {
    if (contract && contract.beneficiary && contract.template) {
      setRecipient(contract.beneficiary.email);
      setSubject(`Contract ${contract.template.name} - ${contract.orderNumber}`);
      setMessage(`Hello,

We are sending you the contract for signing as an attachment.

Please sign it and return it to us.

Thank you,
Contract Manager Team`);
    }
  }, [contract?.id]);

  const handleSend = async () => {
    if (!contract) return;

    setIsSending(true);
    try {
      await apiRequest("POST", `/api/contracts/${contract.id}/email`, {
        recipient,
        subject,
        message,
        attachPDF,
      });

      toast({
        title: "Success",
        description: "Email sent successfully!",
        className: "bg-green-600 text-white border-green-600",
      });

      onSent();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the email.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Send for Signing</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              title="Close"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">To</Label>
            <Input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="recipient@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Email content..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachPDF"
              checked={attachPDF}
              onCheckedChange={(checked) => setAttachPDF(checked as boolean)}
            />
            <Label htmlFor="attachPDF">Attach contract in PDF format</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            title="Cancel sending"
            aria-label="Cancel sending"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={isSending}
            title="Send for signing"
            aria-label="Send for signing"
          >
            <PenTool className="h-4 w-4 mr-1" />
            {isSending ? "Sending..." : "Send for Signing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
