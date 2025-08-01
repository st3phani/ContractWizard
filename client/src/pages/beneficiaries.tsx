import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Mail, Phone, Building, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { getInitials, getAvatarColor } from "@/lib/utils";
import { useDateFormat } from "@/hooks/use-date-format";

import { BeneficiaryFormFields } from "@/components/beneficiary-form-fields";
import type { Beneficiary, InsertBeneficiary } from "@shared/schema";
import { paginateItems, type PaginationConfig } from "@/utils/paginationUtils";

export default function Partners() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
    isCompany: false,
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { formatDate } = useDateFormat();

  // Fetch beneficiaries
  const { data: beneficiaries = [], isLoading } = useQuery<Beneficiary[]>({
    queryKey: ["/api/partners"],
  });

  console.log("Beneficiaries data:", beneficiaries);
  console.log("Is loading:", isLoading);
  console.log("Total items:", beneficiaries.length);

  // Filter and sort beneficiaries based on search query and ID descending
  const filteredBeneficiaries = beneficiaries
    .filter(beneficiary =>
      beneficiary.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      beneficiary.cnp?.includes(searchQuery) ||
      beneficiary.companyCui?.includes(searchQuery)
    )
    .sort((a, b) => b.id - a.id); // Sort by ID descending

  // Apply pagination using utils
  const paginationConfig: PaginationConfig = { currentPage, itemsPerPage };
  const paginationResult = paginateItems(filteredBeneficiaries, paginationConfig);
  
  const {
    items: paginatedBeneficiaries,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage
  } = paginationResult;

  // Reset to page 1 when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Create beneficiary mutation
  const createBeneficiaryMutation = useMutation({
    mutationFn: (data: InsertBeneficiary) => {
      console.log("Sending to API:", data);
      return apiRequest("POST", "/api/partners", data);
    },
    onSuccess: (result) => {
      console.log("API Response:", result);
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", isCompany: false });
      setSelectedBeneficiary(null);
    },
    onError: (error) => {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea beneficiaryului.",
        variant: "destructive",
      });
    },
  });

  // Update beneficiary mutation
  const updateBeneficiaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertBeneficiary> }) => 
      apiRequest("PUT", `/api/partners/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", isCompany: false });
      setSelectedBeneficiary(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while updating the partner.",
        variant: "destructive",
      });
    },
  });

  // Delete beneficiary mutation
  const deleteBeneficiaryMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while deleting the partner.",
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
        missingFields.push('Company Name');
        fieldsToFocus.push('companyName');
      }
      if (!formData.companyAddress) {
        missingFields.push('Company Address');
        fieldsToFocus.push('companyAddress');
      }
      if (!formData.companyCui) {
        missingFields.push('Company CUI');
        fieldsToFocus.push('companyCui');
      }
      if (!formData.companyRegistrationNumber) {
        missingFields.push('Registration Number');
        fieldsToFocus.push('companyRegistrationNumber');
      }

      if (!formData.cnp) {
        missingFields.push('Representative CNP');
        fieldsToFocus.push('cnp');
      }
    } else {
      // Required fields for individuals
      if (!formData.cnp) {
        missingFields.push('CNP');
        fieldsToFocus.push('cnp');
      }
      if (!formData.address) {
        missingFields.push('Address');
        fieldsToFocus.push('address');
      }
    }

    // Check common required fields
    if (!formData.name) {
      missingFields.push('Full Name');
      fieldsToFocus.push('name');
    }
    if (!formData.email) {
      missingFields.push('Email');
      fieldsToFocus.push('email');
    }
    if (!formData.phone) {
      missingFields.push('Phone');
      fieldsToFocus.push('phone');
    }

    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      console.log("Current form data:", formData);
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
    const allFields = ['name', 'email', 'phone', 'address', 'cnp', 'companyName', 'companyAddress', 'companyCui', 'companyRegistrationNumber'];
    allFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    console.log("Form data before mutation:", JSON.stringify(formData, null, 2));
    
    if (selectedBeneficiary) {
      // Update existing beneficiary
      updateBeneficiaryMutation.mutate({ id: selectedBeneficiary.id, data: formData });
    } else {
      // Create new beneficiary
      createBeneficiaryMutation.mutate(formData);
    }
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
      isCompany: beneficiary.isCompany ?? false,
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = (beneficiary: Beneficiary) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      deleteBeneficiaryMutation.mutate(beneficiary.id);
    }
  };

  const resetForm = () => {
    setIsCreateModalOpen(false);
    setSelectedBeneficiary(null);
    setFormData({ name: "", email: "", phone: "", address: "", cnp: "", companyName: "", companyAddress: "", companyCui: "", companyRegistrationNumber: "", isCompany: false });
  };

  return (
    <>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Partners</h2>
              <p className="text-gray-600 mt-1">Manage the list of partners for contracts</p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title="Add a new partner"
              aria-label="Add a new partner"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Partner
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Partners List</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <>
                  {paginatedBeneficiaries.length > 0 ? (
                    <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>CNP/CUI</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBeneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell className="font-mono text-sm text-gray-500">
                          #{beneficiary.id}
                        </TableCell>
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
                              className="hover:bg-green-50"
                              title="Edit partner"
                              aria-label="Edit partner"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(beneficiary)}
                              className="hover:bg-red-50"
                              title="Delete partner"
                              aria-label="Delete partner"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    </TableBody>
                  </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery ? "Nu au fost găsiți parteneri care să corespundă căutării" : "Nu au fost găsiți parteneri"}
                    </div>
                  )}
                </>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Afișare:</span>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-700">
                      din {totalItems} {totalItems === 1 ? 'partener' : 'parteneri'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!hasPreviousPage}
                      title="Pagina anterioară"
                      aria-label="Pagina anterioară"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                          title={`Mergi la pagina ${pageNum}`}
                          aria-label={`Mergi la pagina ${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!hasNextPage}
                      title="Pagina următoare"
                      aria-label="Pagina următoare"
                    >
                      Următor
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Create/Edit Beneficiary Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={resetForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedBeneficiary ? "Edit Partner" : "Add New Partner"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Toggle between Individual/Company */}
            <div className="space-y-2">
              <Label>Tip Partener</Label>
              <Select 
                value={formData.isCompany ? "true" : "false"}
                onValueChange={(value) => setFormData({ ...formData, isCompany: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Individual</SelectItem>
                  <SelectItem value="true">Company</SelectItem>
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
                    <Label htmlFor="name">Legal Representative *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Numele reprezentantului legal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnp">Representative CNP *</Label>
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
                      placeholder="Numele complet al beneficiaryului"
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
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBeneficiary}
              disabled={createBeneficiaryMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createBeneficiaryMutation.isPending 
                ? "Se salvează..." 
                : selectedBeneficiary ? "Actualizează" : "Adaugă Partener"
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}