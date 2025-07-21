import { useState } from "react";
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
import Sidebar from "@/components/sidebar";
import type { ContractTemplate, Beneficiary } from "@shared/schema";

const contractFormSchema = z.object({
  // Beneficiary data
  beneficiary: z.object({
    fullName: z.string().min(1, "Numele este obligatoriu"),
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
    templateId: z.number({ required_error: "Template-ul este obligatoriu" }).min(1, "Selectați un template"),
    value: z.string().optional(),
    currency: z.string().default("RON"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
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
  const [showNewBeneficiaryForm, setShowNewBeneficiaryForm] = useState(true);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      beneficiary: {
        fullName: "",
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

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: (data: ContractFormData) => {
      return apiRequest("POST", "/api/contracts", {
        beneficiaryData: data.beneficiary,
        contractData: {
          templateId: data.contract.templateId,
          value: data.contract.value ? parseFloat(data.contract.value) : null,
          currency: data.contract.currency,
          startDate: data.contract.startDate ? new Date(data.contract.startDate) : null,
          endDate: data.contract.endDate ? new Date(data.contract.endDate) : null,
          notes: data.contract.notes,
          status: "draft",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts/stats"] });
      toast({
        title: "Success",
        description: "Contractul a fost creat cu succes!",
      });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea contractului.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContractFormData) => {
    // Check for validation errors
    const errors = form.formState.errors;
    if (errors.beneficiary) {
      const firstErrorField = Object.keys(errors.beneficiary)[0];
      const element = document.querySelector(`[name="beneficiary.${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add red border
        element.classList.add('field-error');
      }
      return;
    }

    createContractMutation.mutate(data);
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setShowNewBeneficiaryForm(false);
    setBeneficiarySearchOpen(false);
    
    // Update form with selected beneficiary data
    form.setValue("beneficiary.fullName", beneficiary.fullName);
    form.setValue("beneficiary.email", beneficiary.email);
    form.setValue("beneficiary.phone", beneficiary.phone || "");
    form.setValue("beneficiary.address", beneficiary.address || "");
    form.setValue("beneficiary.cnp", beneficiary.cnp || "");
  };

  const handleNewBeneficiary = () => {
    setSelectedBeneficiary(null);
    setShowNewBeneficiaryForm(true);
    setBeneficiarySearchOpen(false);
    
    // Clear form
    form.setValue("beneficiary.fullName", "");
    form.setValue("beneficiary.email", "");
    form.setValue("beneficiary.phone", "");
    form.setValue("beneficiary.address", "");
    form.setValue("beneficiary.cnp", "");
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Creează Contract Nou</h2>
              <p className="text-gray-600 mt-1">Completați datele pentru generarea contractului</p>
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
                            >
                              {selectedBeneficiary ? (
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback className="text-xs">
                                      {selectedBeneficiary.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {selectedBeneficiary.fullName}
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
                                      value={`${beneficiary.fullName} ${beneficiary.email}`}
                                      onSelect={() => handleSelectBeneficiary(beneficiary)}
                                    >
                                      <div className="flex items-center w-full">
                                        <Avatar className="h-8 w-8 mr-3">
                                          <AvatarFallback className="text-xs">
                                            {beneficiary.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                          <div className="font-medium">{beneficiary.fullName}</div>
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
                            showNewBeneficiaryForm && "bg-blue-100 border-blue-300 text-blue-700"
                          )}
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
                                  {selectedBeneficiary.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{selectedBeneficiary.fullName}</div>
                                <div className="text-sm text-gray-500">{selectedBeneficiary.email}</div>
                                {selectedBeneficiary.phone && (
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

                    {/* Show form fields only when creating new beneficiary */}
                    {showNewBeneficiaryForm && (
                      <div className="space-y-4">
                        {/* Toggle between Individual/Company */}
                        <FormField
                          control={form.control}
                          name="beneficiary.isCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tip Beneficiar</FormLabel>
                              <FormControl>
                                <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selectează tipul" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="false">Persoană Fizică</SelectItem>
                                    <SelectItem value="true">Companie</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("beneficiary.isCompany") ? (
                          <>
                            {/* Company Fields */}
                            <FormField
                              control={form.control}
                              name="beneficiary.companyName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nume Companie *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Denumirea companiei" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="beneficiary.companyAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Adresa Companiei *</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Adresa completă a companiei" rows={3} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="beneficiary.companyCui"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CUI Companie *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="RO12345678" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="beneficiary.companyRegistrationNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nr. Înregistrare *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="J40/1234/2023" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="beneficiary.companyLegalRepresentative"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Reprezentant Legal *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Numele reprezentantului legal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="beneficiary.cnp"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CNP Reprezentant *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="CNP reprezentant legal" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Individual Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="beneficiary.fullName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nume Complet *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Numele complet al beneficiarului" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="beneficiary.cnp"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>CNP *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="1234567890123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name="beneficiary.address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Adresa *</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Adresa completă" rows={3} {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        {/* Common fields for both */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="beneficiary.email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email *</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="adresa@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="beneficiary.phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefon *</FormLabel>
                                <FormControl>
                                  <Input placeholder="+40 xxx xxx xxx" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
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
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
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
                          <FormLabel>Valoare Contract</FormLabel>
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      name="contract.startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data Începerii</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                          <FormLabel>Data Încheierii</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
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
                >
                  Anulează
                </Button>
                <Button 
                  type="submit" 
                  disabled={createContractMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createContractMutation.isPending ? "Se creează..." : "Generează Contract"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
}
