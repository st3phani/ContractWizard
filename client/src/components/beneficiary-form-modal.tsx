import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BeneficiaryFormFields } from "./beneficiary-form-fields";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBeneficiary, Beneficiary } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface BeneficiaryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiary?: Beneficiary | null;
  onSuccess?: (beneficiary: Beneficiary) => void;
}

export function BeneficiaryFormModal({ isOpen, onClose, beneficiary, onSuccess }: BeneficiaryFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertBeneficiary>({
    defaultValues: {
      name: beneficiary?.name || "",
      email: beneficiary?.email || "",
      phone: beneficiary?.phone || "",
      address: beneficiary?.address || "",
      cnp: beneficiary?.cnp || "",
      companyName: beneficiary?.companyName || "",
      companyAddress: beneficiary?.companyAddress || "",
      companyCui: beneficiary?.companyCui || "",
      companyRegistrationNumber: beneficiary?.companyRegistrationNumber || "",
      isCompany: beneficiary?.isCompany || false,
    },
  });

  const createBeneficiaryMutation = useMutation({
    mutationFn: async (data: InsertBeneficiary) => {
      const response = await apiRequest("POST", "/api/partners", data);
      return response.json();
    },
    onSuccess: (newBeneficiary: Beneficiary) => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess(newBeneficiary);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea beneficiaryului.",
        variant: "destructive",
      });
    },
  });

  const updateBeneficiaryMutation = useMutation({
    mutationFn: async (data: InsertBeneficiary) => {
      const response = await apiRequest("PATCH", `/api/partners/${beneficiary!.id}`, data);
      return response.json();
    },
    onSuccess: (updatedBeneficiary: Beneficiary) => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      onClose();
      form.reset();
      if (onSuccess) {
        onSuccess(updatedBeneficiary);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la actualizarea beneficiaryului.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBeneficiary) => {
    if (beneficiary) {
      updateBeneficiaryMutation.mutate(data);
    } else {
      createBeneficiaryMutation.mutate(data);
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
            {beneficiary ? "Editează Partener" : "Adaugă Partener Nou"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BeneficiaryFormFields
              control={form.control}
              watch={form.watch}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={createBeneficiaryMutation.isPending || updateBeneficiaryMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {(createBeneficiaryMutation.isPending || updateBeneficiaryMutation.isPending) ? 
                  "Se salvează..." : 
                  (beneficiary ? "Actualizează Partener" : "Adaugă Partener")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}