import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ParteneryFormFields } from "./partenery-form-fields";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBeneficiaryy, Partenery } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ParteneryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  partenery?: Partenery | null;
  onSuccess?: (partenery: Partenery) => void;
}

export function ParteneryFormModal({ isOpen, onClose, partenery, onSuccess }: ParteneryFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBeneficiaryy>({
    defaultValues: {
      name: partenery?.name || "",
      email: partenery?.email || "",
      phone: partenery?.phone || "",
      address: partenery?.address || "",
      cnp: partenery?.cnp || "",
      companyName: partenery?.companyName || "",
      companyAddress: partenery?.companyAddress || "",
      companyCui: partenery?.companyCui || "",
      companyRegistrationNumber: partenery?.companyRegistrationNumber || "",
      isCompany: partenery?.isCompany || false,
    },
  });

  const createParteneryMutation = useMutation({
    mutationFn: async (data: InsertBeneficiaryy) => {
      const response = await apiRequest("POST", "/api/parteneries", data);
      return response.json();
    },
    onSuccess: (newPartenery: Partenery) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parteneries"] });
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess(newPartenery);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea partenerului.",
        variant: "destructive",
      });
    },
  });

  const updateParteneryMutation = useMutation({
    mutationFn: async (data: InsertBeneficiaryy) => {
      const response = await apiRequest("PATCH", `/api/parteneries/${partenery!.id}`, data);
      return response.json();
    },
    onSuccess: (updatedPartenery: Partenery) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parteneries"] });
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess(updatedPartenery);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la actualizarea partenerului.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBeneficiaryy) => {
    if (partenery) {
      updateParteneryMutation.mutate(data);
    } else {
      createParteneryMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {partenery ? "Editează Partener" : "Adaugă Partener Nou"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ParteneryFormFields
              control={form.control}
              watch={form.watch}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={createParteneryMutation.isPending || updateParteneryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(createParteneryMutation.isPending || updateParteneryMutation.isPending) ? 
                  "Se salvează..." : 
                  (partenery ? "Actualizează Partener" : "Adaugă Partener")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}