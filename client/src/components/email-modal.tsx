import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, X } from "lucide-react";
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
    if (contract) {
      setRecipient(contract.beneficiary.email);
      setSubject(`Contract ${contract.template.name} - ${contract.orderNumber}`);
      setMessage(`Bună ziua,

Vă transmitem în anexă contractul pentru semnare.

Vă rugăm să îl semnați și să ni-l returnați.

Mulțumim,
Echipa Contract Manager`);
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
        description: "Emailul a fost trimis cu succes!",
      });

      onSent();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "A apărut o eroare la trimiterea emailului.",
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
            <DialogTitle>Trimite Contract prin Email</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Către</Label>
            <Input
              id="recipient"
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="destinatar@email.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subiect</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subiectul emailului"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Mesaj</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Conținutul emailului..."
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attachPDF"
              checked={attachPDF}
              onCheckedChange={(checked) => setAttachPDF(checked as boolean)}
            />
            <Label htmlFor="attachPDF">Atașează contract în format PDF</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Anulează
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            <Send className="h-4 w-4 mr-1" />
            {isSending ? "Se trimite..." : "Trimite Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
