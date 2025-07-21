import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from "lucide-react";
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
import { formatDate } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import type { Beneficiary, InsertBeneficiary } from "@shared/schema";

export default function Beneficiaries() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [formData, setFormData] = useState<InsertBeneficiary>({
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
      toast({
        title: "Success",
        description: "Beneficiarul a fost creat cu succes!",
      });
      setIsCreateModalOpen(false);
      setFormData({ fullName: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", companyLegalRepresentative: "", isCompany: false });
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
      toast({
        title: "Success",
        description: "Beneficiarul a fost șters cu succes!",
      });
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
    if (!formData.fullName || !formData.email) {
      toast({
        title: "Error",
        description: "Numele și email-ul sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }

    createBeneficiaryMutation.mutate(formData);
  };

  const handleEdit = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setFormData({
      fullName: beneficiary.fullName,
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
    setFormData({ fullName: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", companyLegalRepresentative: "", isCompany: false });
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
                              <AvatarFallback>
                                {beneficiary.fullName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{beneficiary.fullName}</div>
                              {beneficiary.address && (
                                <div className="text-sm text-gray-500 flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {beneficiary.address}
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
                        <TableCell>{beneficiary.cnp || "—"}</TableCell>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="companyCui">CUI Companie</Label>
                    <Input
                      id="companyCui"
                      value={formData.companyCui || ""}
                      onChange={(e) => setFormData({ ...formData, companyCui: e.target.value })}
                      placeholder="RO12345678"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Adresa Companiei</Label>
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
                    <Label htmlFor="companyRegistrationNumber">Nr. Înregistrare</Label>
                    <Input
                      id="companyRegistrationNumber"
                      value={formData.companyRegistrationNumber || ""}
                      onChange={(e) => setFormData({ ...formData, companyRegistrationNumber: e.target.value })}
                      placeholder="J40/1234/2023"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyLegalRepresentative">Reprezentant Legal</Label>
                    <Input
                      id="companyLegalRepresentative"
                      value={formData.companyLegalRepresentative || ""}
                      onChange={(e) => setFormData({ ...formData, companyLegalRepresentative: e.target.value })}
                      placeholder="Numele reprezentantului legal"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Persoană de Contact *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Numele persoanei de contact"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Individual Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nume Complet *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Numele complet al beneficiarului"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">CNP</Label>
                    <Input
                      id="cnp"
                      value={formData.cnp || ""}
                      onChange={(e) => setFormData({ ...formData, cnp: e.target.value })}
                      placeholder="1234567890123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresa</Label>
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
                <Label htmlFor="phone">Telefon</Label>
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