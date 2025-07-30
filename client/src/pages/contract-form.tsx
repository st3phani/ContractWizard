import { useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Search, Check, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, parseDate, getDateInputFormat, type DateFormat } from "@/lib/dateUtils";
import { useDateFormat } from "@/hooks/use-date-format";

import type { ContractTemplate, Beneficiary, InsertBeneficiary } from "@shared/schema";
import { insertBeneficiarySchema } from "@shared/schema";
import { Label } from "@/components/ui/label";


const contractFormSchema = z.object({
  // Beneficiary data
  beneficiary: z.object({
    name: z.string().min(1, "Numele este obligatoriu"),
    email: z.string().email("Email invalid").min(1, "Email-ul este obligatoriu"),
    phone: z.string().min(1, "Telefonul este obligatoriu"),
    address: z.string().optional(),
    cnp: z.string().min(1, "CNP este obligatoriu"),
    // Company fields
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    companyCui: z.string().optional(),
    companyRegistrationNumber: z.string().optional(),
    companyLegalRepresentative: z.string().optional(),
    isCompany: z.boolean().default(false),
  }).superRefine((data, ctx) => {
    if (data.isCompany) {
      if (!data.companyName) {
        ctx.addIssue({
          code: "custom",
          message: "Numele companiei este obligatoriu",
          path: ["companyName"]
        });
      }
      if (!data.companyAddress) {
        ctx.addIssue({
          code: "custom",
          message: "Adresa companiei este obligatorie",
          path: ["companyAddress"]
        });
      }
      if (!data.companyCui) {
        ctx.addIssue({
          code: "custom",
          message: "CUI-ul companiei este obligatoriu",
          path: ["companyCui"]
        });
      }
      if (!data.companyRegistrationNumber) {
        ctx.addIssue({
          code: "custom",
          message: "Numărul de înregistrare este obligatoriu",
          path: ["companyRegistrationNumber"]
        });
      }
      if (!data.companyLegalRepresentative) {
        ctx.addIssue({
          code: "custom",
          message: "Reprezentantul legal este obligatoriu",
          path: ["companyLegalRepresentative"]
        });
      }
    } else {
      if (!data.address) {
        ctx.addIssue({
          code: "custom",
          message: "Adresa este obligatorie",
          path: ["address"]
        });
      }
    }
  }),
  // Contract data
  contract: z.object({
    templateId: z.number({
      required_error: "Template-ul este obligatoriu",
      invalid_type_error: "Template-ul este obligatoriu",
    }).min(1, "Template-ul este obligatoriu"),
    value: z.string().min(1, "Valoarea contractului este obligatorie"),
    currency: z.string(),
    createdDate: z.string().optional(),
    startDate: z.string().min(1, "Data începerii este obligatorie"),
    endDate: z.string().min(1, "Data încheierii este obligatorie"),
    notes: z.string().optional(),
  }),
});

type ContractFormData = z.infer<typeof contractFormSchema>;

export default function ContractForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [beneficiarySearchOpen, setBeneficiarySearchOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [showNewBeneficiaryModal, setShowNewBeneficiaryModal] = useState(false);
  
  // Check if we're editing - get contractId from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const editContractId = urlParams.get('edit');
  const isEditing = Boolean(editContractId);

  // Use date format hook for consistent formatting
  const { dateFormat, systemSettings } = useDateFormat();

  // Beneficiary form data for modal (same as in Beneficiaries page)
  const [formData, setFormData] = useState<InsertBeneficiary>({
    name: "",
    email: "",
    phone: "",
    address: "",
    cnp: "",
    companyName: "",
    companyAddress: "",
    companyCui: "",
    companyRegistrationNumber: "",
    companyLegalRepresentative: "",
    isCompany: false,
  });

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      beneficiary: {
        name: "",
        email: "",
        phone: "",
        address: "",
        cnp: "",
        companyName: "",
        companyAddress: "",
        companyCui: "",
        companyRegistrationNumber: "",
        companyLegalRepresentative: "",
        isCompany: false,
      },
      contract: {
        templateId: undefined as any,
        value: "",
        currency: "RON",
        createdDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        startDate: "",
        endDate: "",
        notes: "",
      },
    },
  });

  // Fetch templates
  const { data: templates = [] } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  // Fetch beneficiaries for search
  const { data: beneficiaries = [] } = useQuery<Beneficiary[]>({
    queryKey: ["/api/beneficiaries"],
  });

  // Fetch contract data for editing
  const { data: editContract } = useQuery({
    queryKey: ["/api/contracts", editContractId],
    queryFn: () => editContractId ? fetch(`/api/contracts/${editContractId}`).then(res => res.json()) : null,
    enabled: isEditing && Boolean(editContractId),
  });

  // Reset form with system settings when they load
  React.useEffect(() => {
    if (systemSettings && !isEditing && !editContract) {
      console.log('System settings loaded - setting currency to:', systemSettings.currency);
      form.setValue('contract.currency', systemSettings.currency || 'RON');
    }
  }, [systemSettings, isEditing, form, editContract]);

  // Update form when editing contract data is loaded
  React.useEffect(() => {
    if (editContract && isEditing) {
      const contractData = editContract;
      console.log("Setting form with contract data:", contractData);
      console.log("Template ID from contract:", contractData.templateId);
      setSelectedBeneficiary(contractData.beneficiary);
      
      // Format dates for form inputs
      const createdDate = contractData.createdAt ? new Date(contractData.createdAt).toISOString().split('T')[0] : '';
      const startDate = contractData.startDate ? new Date(contractData.startDate).toISOString().split('T')[0] : '';
      const endDate = contractData.endDate ? new Date(contractData.endDate).toISOString().split('T')[0] : '';
      
      const formValues = {
        beneficiary: {
          name: contractData.beneficiary.name || "",
          email: contractData.beneficiary.email || "",
          phone: contractData.beneficiary.phone || "",
          address: contractData.beneficiary.address || "",
          cnp: contractData.beneficiary.cnp || "",
          companyName: contractData.beneficiary.companyName || "",
          companyAddress: contractData.beneficiary.companyAddress || "",
          companyCui: contractData.beneficiary.companyCui || "",
          companyRegistrationNumber: contractData.beneficiary.companyRegistrationNumber || "",
          companyLegalRepresentative: contractData.beneficiary.companyLegalRepresentative || "",
          isCompany: contractData.beneficiary.isCompany || false,
        },
        contract: {
          templateId: contractData.templateId,
          value: contractData.value?.toString() || "",
          currency: contractData.currency || systemSettings?.currency || "RON",
          createdDate,
          startDate,
          endDate,
          notes: contractData.notes || "",
        },
      };
      
      console.log("Form values being set:", formValues);
      form.reset(formValues);
    }
  }, [editContract, isEditing, form]);

  // Create or update contract mutation
  const contractMutation = useMutation({
    mutationFn: (data: ContractFormData) => {
      console.log("=== MUTATION DEBUG ===");
      console.log("Frontend mutation called with:", JSON.stringify(data, null, 2));
      console.log("Is editing:", isEditing, "Edit contract ID:", editContractId);
      
      if (isEditing && editContractId) {
        // Update existing contract
        const updatePayload = {
          beneficiaryData: data.beneficiary,
          contractData: {
            templateId: data.contract.templateId,
            value: data.contract.value ? parseFloat(data.contract.value) : null,
            currency: data.contract.currency,
            createdDate: data.contract.createdDate || null,
            startDate: data.contract.startDate || null,
            endDate: data.contract.endDate || null,
            notes: data.contract.notes,
          },
        };
        console.log("UPDATE payload being sent:", JSON.stringify(updatePayload, null, 2));
        console.log("Making PUT request to:", `/api/contracts/${editContractId}`);
        return apiRequest("PUT", `/api/contracts/${editContractId}`, updatePayload);
      } else {
        // Create new contract
        return apiRequest("POST", "/api/contracts", {
          beneficiaryData: data.beneficiary,
          contractData: {
            templateId: data.contract.templateId,
            value: data.contract.value ? parseFloat(data.contract.value) : null,
            currency: data.contract.currency,
            createdDate: data.contract.createdDate || null,
            startDate: data.contract.startDate || null,
            endDate: data.contract.endDate || null,
            notes: data.contract.notes,
            status: "draft",
          },
        });
      }
    },
    onSuccess: (result) => {
      console.log("=== MUTATION SUCCESS ===");
      console.log("Mutation result:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
      toast({
        title: "Success",
        description: isEditing ? "Contractul a fost actualizat cu succes!" : "Contractul a fost creat cu succes!",
        className: "bg-green-600 text-white border-green-600",
      });
      setLocation("/contracts");
    },
    onError: (error) => {
      console.log("=== MUTATION ERROR ===");
      console.log("Mutation error:", error);
      toast({
        title: "Error",
        description: isEditing ? "A apărut o eroare la actualizarea contractului." : "A apărut o eroare la crearea contractului.",
        variant: "destructive",
      });
    },
  });

  const reserveContractMutation = useMutation({
    mutationFn: (data: ContractFormData) => {
      return apiRequest("POST", "/api/contracts/reserve", {
        beneficiaryData: data.beneficiary,
        contractData: {
          templateId: data.contract.templateId,
          value: data.contract.value ? parseFloat(data.contract.value) : null,
          currency: data.contract.currency,
          createdDate: data.contract.createdDate || null,
          startDate: data.contract.startDate ? parseDate(data.contract.startDate, dateFormat) || new Date(data.contract.startDate) : null,
          endDate: data.contract.endDate ? parseDate(data.contract.endDate, dateFormat) || new Date(data.contract.endDate) : null,
          notes: data.contract.notes,
          status: "reserved",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
      toast({
        title: "Success",
        description: "Contractul a fost rezervat cu succes!",
        className: "bg-green-600 text-white border-green-600",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la rezervarea contractului.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContractFormData) => {
    console.log("=== onSubmit DEBUG ===");
    console.log("onSubmit called with data:", JSON.stringify(data, null, 2));
    console.log("Form errors before submit:", JSON.stringify(form.formState.errors, null, 2));
    console.log("Is editing mode:", isEditing);
    console.log("Edit contract ID:", editContractId);
    console.log("Contract mutation pending:", contractMutation.isPending);
    
    // In edit mode, skip strict validation to allow updates
    if (isEditing) {
      console.log("Edit mode - proceeding with mutation without strict validation");
      console.log("About to call contractMutation.mutate with:", JSON.stringify(data, null, 2));
      contractMutation.mutate(data);
      return;
    }
    
    // Force validation and trigger errors for new contracts
    form.trigger();
    
    // Check for validation errors
    const errors = form.formState.errors;
    console.log("Form errors after trigger:", JSON.stringify(errors, null, 2));
    
    if (Object.keys(errors).length > 0) {
      console.log("Form has validation errors, not submitting");
      // Find the first error field
      let firstErrorField = null;
      
      if (errors.beneficiary) {
        const beneficiaryError = Object.keys(errors.beneficiary)[0];
        firstErrorField = `beneficiary.${beneficiaryError}`;
      } else if (errors.contract) {
        const contractError = Object.keys(errors.contract)[0];
        firstErrorField = `contract.${contractError}`;
      }

      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return;
    }

    console.log("No validation errors, proceeding with mutation");
    contractMutation.mutate(data);
  };

  const onReserve = () => {
    // Get current form data without validation
    const formData = form.getValues();
    
    // Create minimal contract data for reservation
    const reservationData: ContractFormData = {
      beneficiary: {
        name: formData.beneficiary?.name || "-",
        email: formData.beneficiary?.email || "rezervat@temp.com",
        phone: formData.beneficiary?.phone || "-",
        address: formData.beneficiary?.address || "-",
        cnp: formData.beneficiary?.cnp || "-",
        companyName: formData.beneficiary?.companyName || "-",
        companyAddress: formData.beneficiary?.companyAddress || "-",
        companyCui: formData.beneficiary?.companyCui || "-",
        companyRegistrationNumber: formData.beneficiary?.companyRegistrationNumber || "-",
        companyLegalRepresentative: formData.beneficiary?.companyLegalRepresentative || "-",
        isCompany: formData.beneficiary?.isCompany || false,
      },
      contract: {
        templateId: formData.contract?.templateId || 1,
        value: formData.contract?.value || "-",
        currency: formData.contract?.currency || "RON",
        createdDate: formData.contract?.createdDate || "",
        startDate: formData.contract?.startDate || "-",
        endDate: formData.contract?.endDate || "-",
        notes: formData.contract?.notes || "-",
      }
    };

    reserveContractMutation.mutate(reservationData);
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowNewBeneficiaryModal(false);
    setBeneficiarySearchOpen(false);
    
    // Update form with selected beneficiary data
    form.setValue("beneficiary.name", beneficiary.name);
    form.setValue("beneficiary.email", beneficiary.email);
    form.setValue("beneficiary.phone", beneficiary.phone || "");
    form.setValue("beneficiary.address", beneficiary.address || "");
    form.setValue("beneficiary.cnp", beneficiary.cnp || "");
  };

  const handleNewBeneficiary = () => {
    setSelectedBeneficiary(null);
    setShowNewBeneficiaryModal(true);
    setBeneficiarySearchOpen(false);
  };

  // Create beneficiary mutation for modal
  const createBeneficiaryMutation = useMutation({
    mutationFn: async (data: InsertBeneficiary) => {
      const response = await fetch("/api/beneficiaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create beneficiary");
      }
      
      return response.json();
    },
    onSuccess: (newBeneficiary: Beneficiary) => {
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] });
      
      // Auto-select the newly created beneficiary
      setSelectedBeneficiary(newBeneficiary);
      setShowNewBeneficiaryModal(false);
      
      // Update contract form with new beneficiary data
      form.setValue("beneficiary.name", newBeneficiary.name);
      form.setValue("beneficiary.email", newBeneficiary.email);
      form.setValue("beneficiary.phone", newBeneficiary.phone || "");
      form.setValue("beneficiary.address", newBeneficiary.address || "");
      form.setValue("beneficiary.cnp", newBeneficiary.cnp || "");
      form.setValue("beneficiary.companyName", newBeneficiary.companyName || "");
      form.setValue("beneficiary.companyAddress", newBeneficiary.companyAddress || "");
      form.setValue("beneficiary.companyCui", newBeneficiary.companyCui || "");
      form.setValue("beneficiary.companyRegistrationNumber", newBeneficiary.companyRegistrationNumber || "");
      form.setValue("beneficiary.companyLegalRepresentative", newBeneficiary.companyLegalRepresentative || "");
      form.setValue("beneficiary.isCompany", newBeneficiary.isCompany);
      
      // Reset modal form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        cnp: "",
        companyName: "",
        companyAddress: "",
        companyCui: "",
        companyRegistrationNumber: "",
        companyLegalRepresentative: "",
        isCompany: false,
      });
      
      // Clear validation errors
      setValidationErrors({});
      
      // Remove success toast as per user preference
    },
    onError: (error) => {
      // Only handle validation errors in form, no toast notifications as per user preference
      console.error("Error creating beneficiary:", error);
    },
  });

  // State to track validation errors
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});

  const handleCreateBeneficiary = () => {
    console.log("handleCreateBeneficiary called with formData:", formData);
    
    // For companies, set name to the legal representative name
    const dataToSend = { ...formData };
    if (formData.isCompany && formData.companyLegalRepresentative?.trim()) {
      dataToSend.name = formData.companyLegalRepresentative;
    }
    
    // Validate required fields manually (same validation as in Beneficiaries page)
    const errors: { [key: string]: boolean } = {};

    if (!dataToSend.email.trim()) errors.email = true;
    if (!dataToSend.phone?.trim()) errors.phone = true;

    if (dataToSend.isCompany) {
      if (!dataToSend.companyName?.trim()) errors.companyName = true;
      if (!dataToSend.companyAddress?.trim()) errors.companyAddress = true;
      if (!dataToSend.companyCui?.trim()) errors.companyCui = true;
      if (!dataToSend.companyRegistrationNumber?.trim()) errors.companyRegistrationNumber = true;
      if (!dataToSend.companyLegalRepresentative?.trim()) errors.companyLegalRepresentative = true;
      if (!dataToSend.cnp?.trim()) errors.cnp = true;
    } else {
      if (!dataToSend.name.trim()) errors.name = true;
      if (!dataToSend.address?.trim()) errors.address = true;
      if (!dataToSend.cnp?.trim()) errors.cnp = true;
    }

    console.log("Validation errors:", errors);
    
    // Update validation errors state
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.log("Validation failed, focusing on first error field");
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      const element = document.querySelector(`[id="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    console.log("Validation passed, calling mutation with data:", dataToSend);
    createBeneficiaryMutation.mutate(dataToSend);
  };

  // Clear specific validation error when user starts typing
  const handleFieldChange = (fieldName: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (validationErrors[fieldName] && value.trim()) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  return (
    <>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {isEditing ? "Editează Contract" : "Creează Contract Nou"}
              </h2>
              <p className="text-gray-600 mt-1">
                {isEditing ? "Modifică datele contractului existent" : "Completați datele pentru generarea contractului"}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Beneficiary Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Date Beneficiar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Beneficiary Search Section */}
                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-900">Selectează Beneficiarul</h4>
                          <p className="text-sm text-blue-700">Caută un beneficiar existent sau creează unul nou</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-stretch">
                        <Popover open={beneficiarySearchOpen} onOpenChange={setBeneficiarySearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={beneficiarySearchOpen}
                              className="flex-1 justify-start min-w-0"
                              title="Caută beneficiar existent"
                              aria-label="Caută beneficiar existent"
                            >
                              {selectedBeneficiary ? (
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="text-xs">
                                      {selectedBeneficiary?.name ? selectedBeneficiary.name.split(' ').map(n => n[0]).join('').toUpperCase() : "B"}
                                    </AvatarFallback>
                                  </Avatar>
                                  {selectedBeneficiary?.name || "Beneficiar fără nume"}
                                </div>
                              ) : (
                                <>
                                  <Search className="mr-2 h-4 w-4" />
                                  Caută beneficiar existent...
                                </>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Caută după nume sau email..." />
                              <CommandList>
                                <CommandEmpty>Nu s-au găsit beneficiari.</CommandEmpty>
                                <CommandGroup>
                                  {beneficiaries.map((beneficiary) => (
                                    <CommandItem
                                      key={beneficiary.id}
                                      value={`${beneficiary.name} ${beneficiary.email}`}
                                      onSelect={() => handleSelectBeneficiary(beneficiary)}
                                    >
                                      <div className="flex items-center w-full">
                                        <Avatar className="h-8 w-8 mr-3">
                                          <AvatarFallback className="text-xs">
                                            {beneficiary.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="font-medium">{beneficiary.name}</div>
                                          <div className="text-sm text-gray-500">{beneficiary.email}</div>
                                        </div>
                                        {selectedBeneficiary?.id === beneficiary.id && (
                                          <Check className="h-4 w-4" />
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleNewBeneficiary}
                          className={cn(
                            "shrink-0 whitespace-nowrap",
                            false && "bg-blue-100 border-blue-300 text-blue-700"
                          )}
                          title="Creează beneficiar nou"
                          aria-label="Creează beneficiar nou"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Beneficiar Nou
                        </Button>
                      </div>

                      {selectedBeneficiary && (
                        <div className="p-3 bg-white rounded border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarFallback>
                                  {selectedBeneficiary?.name ? selectedBeneficiary.name.split(' ').map(n => n[0]).join('').toUpperCase() : "B"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{selectedBeneficiary?.name || "Beneficiar fără nume"}</div>
                                <div className="text-sm text-gray-500">{selectedBeneficiary?.email}</div>
                                {selectedBeneficiary?.phone && (
                                  <div className="text-sm text-gray-500">{selectedBeneficiary.phone}</div>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleNewBeneficiary}
                              className="text-blue-600 hover:text-blue-700 whitespace-nowrap shrink-0"
                            >
                              <User className="h-4 w-4 mr-1" />
                              Schimbă
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>


                  </CardContent>
                </Card>

                {/* Contract Data */}
                <Card>
                  <CardHeader>
                    <CardTitle>Detalii Contract</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="contract.templateId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Contract</FormLabel>
                          <Select 
                            value={field.value?.toString() || ""} 
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selectează template" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {templates.map((template) => (
                                <SelectItem key={template.id} value={template.id.toString()}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valoare Contract *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="RON">RON</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.createdDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Creării</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field}
                              placeholder={getDateInputFormat(dateFormat)}
                              onBlur={(e) => {
                                // Validate date format on blur
                                const parsedDate = parseDate(e.target.value, dateFormat);
                                if (e.target.value && !parsedDate) {
                                  form.setError('contract.createdDate', {
                                    type: 'manual',
                                    message: `Format invalid. Folosește ${getDateInputFormat(dateFormat)}`
                                  });
                                } else {
                                  form.clearErrors('contract.createdDate');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Începerii *</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field}
                              placeholder={getDateInputFormat(dateFormat)}
                              onBlur={(e) => {
                                // Validate date format on blur
                                const parsedDate = parseDate(e.target.value, dateFormat);
                                if (e.target.value && !parsedDate) {
                                  form.setError('contract.startDate', {
                                    type: 'manual',
                                    message: `Format invalid. Folosește ${getDateInputFormat(dateFormat)}`
                                  });
                                } else {
                                  form.clearErrors('contract.startDate');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Încheierii *</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              {...field}
                              placeholder={getDateInputFormat(dateFormat)}
                              onBlur={(e) => {
                                // Validate date format on blur
                                const parsedDate = parseDate(e.target.value, dateFormat);
                                if (e.target.value && !parsedDate) {
                                  form.setError('contract.endDate', {
                                    type: 'manual',
                                    message: `Format invalid. Folosește ${getDateInputFormat(dateFormat)}`
                                  });
                                } else {
                                  form.clearErrors('contract.endDate');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contract.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observații</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Observații suplimentare" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>


              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  title="Anulează crearea contractului"
                  aria-label="Anulează crearea contractului"
                >
                  Anulează
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={onReserve}
                  disabled={reserveContractMutation.isPending}
                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                  title="Rezervă numărul contractului"
                  aria-label="Rezervă numărul contractului"
                >
                  {reserveContractMutation.isPending ? "Se rezervă..." : "Rezervă Contract"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={contractMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  title={isEditing ? "Actualizează contractul" : "Generează contractul"}
                  aria-label={isEditing ? "Actualizează contractul" : "Generează contractul"}
                >
                  {contractMutation.isPending ? 
                    (isEditing ? "Se actualizează..." : "Se creează...") : 
                    (isEditing ? "Actualizează Contract" : "Generează Contract")
                  }
                </Button>
              </div>
            </form>
          </Form>
        </div>

      {/* Beneficiary Modal - Same as in Beneficiaries page */}
      <Dialog open={showNewBeneficiaryModal} onOpenChange={(open) => {
        if (!open) {
          setShowNewBeneficiaryModal(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adaugă Beneficiar Nou</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Toggle between Individual/Company */}
            <div className="space-y-2">
              <Label>Tip Beneficiar</Label>
              <Select 
                value={formData.isCompany ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, isCompany: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează tipul" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Persoană Fizică</SelectItem>
                  <SelectItem value="true">Companie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.isCompany ? (
              <>
                {/* Company Fields */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nume Companie *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ""}
                    onChange={(e) => handleFieldChange('companyName', e.target.value, (value) => setFormData({ ...formData, companyName: value }))}
                    placeholder="Denumirea companiei"
                    className={validationErrors.companyName ? "border-red-500 bg-pink-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresa Companiei *</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress || ""}
                    onChange={(e) => handleFieldChange('companyAddress', e.target.value, (value) => setFormData({ ...formData, companyAddress: value }))}
                    rows={3}
                    placeholder="Adresa completă a companiei"
                    className={validationErrors.companyAddress ? "border-red-500 bg-pink-50" : ""}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyCui">CUI Companie *</Label>
                    <Input
                      id="companyCui"
                      value={formData.companyCui || ""}
                      onChange={(e) => handleFieldChange('companyCui', e.target.value, (value) => setFormData({ ...formData, companyCui: value }))}
                      placeholder="RO12345678"
                      className={validationErrors.companyCui ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">Nr. Înregistrare *</Label>
                    <Input
                      id="companyRegistrationNumber"
                      value={formData.companyRegistrationNumber || ""}
                      onChange={(e) => handleFieldChange('companyRegistrationNumber', e.target.value, (value) => setFormData({ ...formData, companyRegistrationNumber: value }))}
                      placeholder="J40/1234/2023"
                      className={validationErrors.companyRegistrationNumber ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyLegalRepresentative">Reprezentant Legal *</Label>
                    <Input
                      id="companyLegalRepresentative"
                      value={formData.companyLegalRepresentative || ""}
                      onChange={(e) => handleFieldChange('companyLegalRepresentative', e.target.value, (value) => setFormData({ ...formData, companyLegalRepresentative: value }))}
                      placeholder="Numele reprezentantului legal"
                      className={validationErrors.companyLegalRepresentative ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP Reprezentant *</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp || ""}
                      onChange={(e) => handleFieldChange('cnp', e.target.value, (value) => setFormData({ ...formData, cnp: value }))}
                      placeholder="CNP reprezentant legal"
                      className={validationErrors.cnp ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Individual Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nume Complet *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value, (value) => setFormData({ ...formData, name: value }))}
                      placeholder="Numele complet al beneficiarului"
                      className={validationErrors.name ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP *</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp || ""}
                      onChange={(e) => handleFieldChange('cnp', e.target.value, (value) => setFormData({ ...formData, cnp: value }))}
                      placeholder="1234567890123"
                      className={validationErrors.cnp ? "border-red-500 bg-pink-50" : ""}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa *</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => handleFieldChange('address', e.target.value, (value) => setFormData({ ...formData, address: value }))}
                    rows={3}
                    placeholder="Adresa completă"
                    className={validationErrors.address ? "border-red-500 bg-pink-50" : ""}
                  />
                </div>
              </>
            )}

            {/* Common fields for both */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value, (value) => setFormData({ ...formData, email: value }))}
                  placeholder="adresa@email.com"
                  className={validationErrors.email ? "border-red-500 bg-pink-50" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleFieldChange('phone', e.target.value, (value) => setFormData({ ...formData, phone: value }))}
                  placeholder="+40 xxx xxx xxx"
                  className={validationErrors.phone ? "border-red-500 bg-pink-50" : ""}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowNewBeneficiaryModal(false)}>
              Anulează
            </Button>
            <Button 
              onClick={handleCreateBeneficiary}
              disabled={createBeneficiaryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createBeneficiaryMutation.isPending ? "Se salvează..." : "Adaugă Beneficiar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
