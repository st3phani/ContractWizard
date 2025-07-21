import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import type { ContractTemplate, InsertContractTemplate } from "@shared/schema";

export default function Templates() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [formData, setFormData] = useState<InsertContractTemplate>({
    name: "",
    content: "",
    fields: "[]",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: InsertContractTemplate) => 
      apiRequest("POST", "/api/contract-templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({
        title: "Success",
        description: "Template-ul a fost creat cu succes!",
      });
      setIsCreateModalOpen(false);
      setFormData({ name: "", content: "", fields: "[]" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la crearea template-ului.",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertContractTemplate> }) => 
      apiRequest("PATCH", `/api/contract-templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({
        title: "Success",
        description: "Template-ul a fost actualizat cu succes!",
      });
      setIsCreateModalOpen(false);
      setSelectedTemplate(null);
      setFormData({ name: "", content: "", fields: "[]" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la actualizarea template-ului.",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/contract-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      toast({
        title: "Success",
        description: "Template-ul a fost șters cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la ștergerea template-ului.",
        variant: "destructive",
      });
    },
  });

  const handleSaveTemplate = () => {
    const missingFields = [];
    const fieldsToFocus = [];

    if (!formData.name) {
      missingFields.push('Nume Template');
      fieldsToFocus.push('templateName');
    }
    if (!formData.content) {
      missingFields.push('Conținut Template');
      fieldsToFocus.push('templateContent');
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

      toast({
        title: "Error",
        description: `Următoarele câmpuri sunt obligatorii: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Remove red borders on successful validation
    const allFields = ['templateName', 'templateContent'];
    allFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    if (selectedTemplate) {
      // Edit existing template
      updateTemplateMutation.mutate({ 
        id: selectedTemplate.id, 
        data: formData 
      });
    } else {
      // Create new template
      createTemplateMutation.mutate(formData);
    }
  };

  const handlePreview = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Template-uri Contracte</h2>
              <p className="text-gray-600 mt-1">Gestionați template-urile pentru contracte</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setFormData({ name: "", content: "", fields: "[]" });
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Template Nou
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Template-uri Disponibile</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Se încarcă...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nume</TableHead>
                      <TableHead>Data Creării</TableHead>
                      <TableHead>Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{formatDate(template.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedTemplate(template);
                                setFormData({
                                  name: template.name,
                                  content: template.content,
                                  fields: template.fields,
                                });
                                setIsCreateModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
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
              
              {templates.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  Nu au fost găsite template-uri
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create/Edit Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Editează Template" : "Creează Template Nou"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Nume Template *</Label>
              <Input
                id="templateName"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Remove error styling when user starts typing
                  if (e.target.value.length > 0) {
                    e.target.classList.remove('field-error');
                  }
                }}
                placeholder="Numele template-ului"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateContent">Conținut Contract *</Label>
              <Textarea
                id="templateContent"
                value={formData.content}
                onChange={(e) => {
                  setFormData({ ...formData, content: e.target.value });
                  // Remove error styling when user starts typing
                  if (e.target.value.length > 0) {
                    e.target.classList.remove('field-error');
                  }
                }}
                rows={15}
                placeholder="Conținutul contractului cu placeholder-uri (ex: {{beneficiary.name}})"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Variabile Prestator (Companie)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.name}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.name}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 17, cursorPos + 17);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.address}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.address}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 20, cursorPos + 20);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.cui}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.cui}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 16, cursorPos + 16);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.registrationNumber}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.registrationNumber}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 30, cursorPos + 30);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.legalRepresentative}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.legalRepresentative}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 32, cursorPos + 32);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.phone}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.phone}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 18, cursorPos + 18);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-blue-700">{"{{provider.email}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{provider.email}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 18, cursorPos + 18);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">👤 Variabile Beneficiar & Contract</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{beneficiary.name}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{beneficiary.name}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          // Update cursor position after insertion
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 23, cursorPos + 23);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{beneficiary.email}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{beneficiary.email}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 21, cursorPos + 21);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{beneficiary.phone}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{beneficiary.phone}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 21, cursorPos + 21);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{beneficiary.address}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{beneficiary.address}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 23, cursorPos + 23);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{beneficiary.cnp}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{beneficiary.cnp}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 19, cursorPos + 19);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{contract.value}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{contract.value}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 18, cursorPos + 18);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{contract.currency}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{contract.currency}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 21, cursorPos + 21);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{contract.startDate}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{contract.startDate}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 22, cursorPos + 22);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{contract.endDate}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{contract.endDate}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 20, cursorPos + 20);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{contract.notes}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{contract.notes}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 18, cursorPos + 18);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{orderNumber}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{orderNumber}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 15, cursorPos + 15);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                  <div className="flex items-center justify-between bg-white p-2 rounded border">
                    <code className="text-green-700">{"{{currentDate}}"}</code>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        const textarea = document.getElementById('content') as HTMLTextAreaElement;
                        if (textarea) {
                          const cursorPos = textarea.selectionStart;
                          const textBefore = textarea.value.substring(0, cursorPos);
                          const textAfter = textarea.value.substring(cursorPos);
                          const newValue = textBefore + '{{currentDate}}' + textAfter;
                          setFormData({ ...formData, content: newValue });
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(cursorPos + 15, cursorPos + 15);
                          }, 0);
                        }
                      }}
                      className="text-xs"
                    >
                      Adaugă
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">💡 Exemple de utilizare</h4>
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Pentru Prestator:</strong> PRESTATOR: {"{{provider.name}}"}, cu sediul în {"{{provider.address}}"}, CIF {"{{provider.cui}}"}</p>
                <p><strong>Pentru Beneficiar:</strong> BENEFICIAR: {"{{beneficiary.name}}"}, email: {"{{beneficiary.email}}"}</p>
                <p><strong>Pentru Detalii:</strong> Contract nr. {"{{orderNumber}}"} din {"{{currentDate}}"}, valoare: {"{{contract.value}}"} RON</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setSelectedTemplate(null);
                setFormData({ name: "", content: "", fields: "[]" });
              }}
            >
              Anulează
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? "Se salvează..." : (selectedTemplate ? "Actualizează Template" : "Salvează Template")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previzualizare Template</DialogTitle>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="bg-white border border-gray-200 rounded-lg p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.name}</h3>
              </div>
              
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedTemplate.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
