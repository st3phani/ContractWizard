import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate, getInitials, getAvatarColor } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import { BeneficiaryFormFields } from "@/components/beneficiary-form-fields";
import type { Beneficiary, InsertBeneficiary } from "@shared/schema";

export default function Beneficiaries() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
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
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch beneficiaries
  const { data: beneficiaries = [], isLoading } = useQuery<Beneficiary[]>({
    queryKey: ["/api/beneficiaries"],
  });

  // Create beneficiary mutation
  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: InsertBeneficiary) => 
      apiRequest("POST", "/api/beneficiaries", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", companyLegalRepresentative: "", isCompany: false });
      setSelectedBeneficiary(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea beneficiarului.",
        variant: "destructive",
      });
    },
  });

  // Delete beneficiary mutation
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/beneficiaries/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/beneficiaries"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la ștergerea beneficiarului.",
        variant: "destructive",
      });
    },
  });

  const handleCreateBeneficiary = () => {
    // Validation for required fields
    const missingFields = [];
    const fieldsToFocus = [];

    if (formData.isCompany) {
      // Additional required fields for companies
      if (!formData.companyName) {
        missingFields.push('Nume Companie');
        fieldsToFocus.push('companyName');
      }
      if (!formData.companyAddress) {
        missingFields.push('Adresa Companiei');
        fieldsToFocus.push('companyAddress');
      }
      if (!formData.companyCui) {
        missingFields.push('CUI Companie');
        fieldsToFocus.push('companyCui');
      }
      if (!formData.companyRegistrationNumber) {
        missingFields.push('Nr. Înregistrare');
        fieldsToFocus.push('companyRegistrationNumber');
      }
      if (!formData.companyLegalRepresentative) {
        missingFields.push('Reprezentant Legal');
        fieldsToFocus.push('companyLegalRepresentative');
      }
      if (!formData.cnp) {
        missingFields.push('CNP Reprezentant');
        fieldsToFocus.push('cnp');
      }
    } else {
      // Required fields for individuals
      if (!formData.cnp) {
        missingFields.push('CNP');
        fieldsToFocus.push('cnp');
      }
      if (!formData.address) {
        missingFields.push('Adresa');
        fieldsToFocus.push('address');
      }
    }

    // Check common required fields
    if (!formData.name) {
      missingFields.push('Nume Complet');
      fieldsToFocus.push('name');
    }
    if (!formData.email) {
      missingFields.push('Email');
      fieldsToFocus.push('email');
    }
    if (!formData.phone) {
      missingFields.push('Telefon');
      fieldsToFocus.push('phone');
    }

    if (missingFields.length > 0) {
      // Add red border to missing fields
      fieldsToFocus.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
          element.classList.add('field-error');
        }
      });

      // Focus on first missing field
      if (fieldsToFocus.length > 0) {
        const firstField = document.getElementById(fieldsToFocus[0]);
        if (firstField) {
          firstField.focus();
          firstField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      return;
    }

    // Remove red borders on successful validation
    const allFields = ['name', 'email', 'phone', 'address', 'cnp', 'companyName', 'companyAddress', 'companyCui', 'companyRegistrationNumber', 'companyLegalRepresentative'];
    allFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    createBeneficiaryMutation.mutate(formData);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setFormData({
      name: beneficiary.name,
      email: beneficiary.email,
      phone: beneficiary.phone ?? "",
      address: beneficiary.address ?? "",
      cnp: beneficiary.cnp ?? "",
      companyName: beneficiary.companyName ?? "",
      companyAddress: beneficiary.companyAddress ?? "",
      companyCui: beneficiary.companyCui ?? "",
      companyRegistrationNumber: beneficiary.companyRegistrationNumber ?? "",
      companyLegalRepresentative: beneficiary.companyLegalRepresentative ?? "",
      isCompany: beneficiary.isCompany ?? false,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (beneficiary: Beneficiary) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest beneficiar?")) {
      deleteBeneficiaryMutation.mutate(beneficiary.id);
    }
  };

  const resetForm = () => {
    setIsCreateModalOpen(false);
    setSelectedBeneficiary(null);
    setFormData({ name: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", companyLegalRepresentative: "", isCompany: false });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Beneficiari</h2>
              <p className="text-gray-600 mt-1">Gestionați lista de beneficiari pentru contracte</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Beneficiar Nou
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista Beneficiari</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Se încarcă...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Beneficiar</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>CNP/CUI</TableHead>
                      <TableHead>Data Creării</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback className={`${getAvatarColor(beneficiary.name || "")} text-white`}>
                                {getInitials(beneficiary.name || "")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{beneficiary.name}</div>
                              {beneficiary.companyName && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <Building className="h-3 w-3 mr-1" />
                                  {beneficiary.companyName}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {beneficiary.email}
                            </div>
                            {beneficiary.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {beneficiary.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {beneficiary.cnp && (
                              <div className="text-sm">
                                <span className="text-xs text-gray-400">CNP:</span> {beneficiary.cnp}
                              </div>
                            )}
                            {beneficiary.companyCui && (
                              <div className="text-sm">
                                <span className="text-xs text-gray-400">CUI:</span> {beneficiary.companyCui}
                              </div>
                            )}
                            {!beneficiary.cnp && !beneficiary.companyCui && "—"}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(beneficiary.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(beneficiary)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(beneficiary)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              {beneficiaries.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Nu au fost găsiți beneficiari
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Beneficiary Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBeneficiary ? "Editează Beneficiar" : "Adaugă Beneficiar Nou"}
            </DialogTitle>
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
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Denumirea companiei"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresa Companiei *</Label>
                  <Textarea
                    id="companyAddress"
                    value={formData.companyAddress || ""}
                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                    rows={3}
                    placeholder="Adresa completă a companiei"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyCui">CUI Companie *</Label>
                    <Input
                      id="companyCui"
                      value={formData.companyCui || ""}
                      onChange={(e) => setFormData({ ...formData, companyCui: e.target.value })}
                      placeholder="RO12345678"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyRegistrationNumber">Nr. Înregistrare *</Label>
                    <Input
                      id="companyRegistrationNumber"
                      value={formData.companyRegistrationNumber || ""}
                      onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                      placeholder="J40/1234/2023"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyLegalRepresentative">Reprezentant Legal *</Label>
                    <Input
                      id="companyLegalRepresentative"
                      value={formData.companyLegalRepresentative || ""}
                      onChange={(e) => setFormData({ ...formData, companyLegalRepresentative: e.target.value })}
                      placeholder="Numele reprezentantului legal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP Reprezentant *</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp || ""}
                      onChange={(e) => setFormData({ ...formData, cnp: e.target.value })}
                      placeholder="CNP reprezentant legal"
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Numele complet al beneficiarului"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP *</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp || ""}
                      onChange={(e) => setFormData({ ...formData, cnp: e.target.value })}
                      placeholder="1234567890123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa *</Label>
                  <Textarea
                    id="address"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="Adresa completă"
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="adresa@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+40 xxx xxx xxx"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={resetForm}>
              Anulează
            </Button>
            <Button 
              onClick={handleCreateBeneficiary}
              disabled={createBeneficiaryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createBeneficiaryMutation.isPending 
                ? "Se salvează..." 
                : selectedBeneficiary ? "Actualizează" : "Adaugă Beneficiar"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}