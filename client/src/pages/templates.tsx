import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";
import Sidebar from "@/components/sidebar";
import RichTextEditor from "@/components/rich-text-editor";
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

  const { data: templates = [], isLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  const createTemplateMutation = useMutation({
    mutationFn: (data: InsertContractTemplate) => 
      apiRequest("POST", "/api/contract-templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      setIsCreateModalOpen(false);
      setFormData({ name: "", content: "", fields: "[]" });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertContractTemplate> }) => 
      apiRequest("PATCH", `/api/contract-templates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
      setIsCreateModalOpen(false);
      setSelectedTemplate(null);
      setFormData({ name: "", content: "", fields: "[]" });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest("DELETE", `/api/contract-templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-templates"] });
    },
  });

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.content) {
      return;
    }

    if (selectedTemplate) {
      updateTemplateMutation.mutate({ 
        id: selectedTemplate.id, 
        data: formData 
      });
    } else {
      createTemplateMutation.mutate(formData);
    }
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (window.confirm("Sunteți sigur că doriți să ștergeți acest template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const addVariable = (variable: string) => {
    // Pentru Rich Text Editor, adaugăm variabila la sfârșitul conținutului curent
    const currentContent = formData.content || '<p></p>';
    const newContent = currentContent.replace(/<\/p>$/, ` ${variable}</p>`) || `${currentContent} ${variable}`;
    setFormData({ ...formData, content: newContent });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Template-uri Contract</CardTitle>
                <Button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setFormData({ name: "", content: "", fields: "[]" });
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Template Nou
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Se încarcă template-urile...</div>
              ) : templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nume Template</TableHead>
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
                          <div className="flex space-x-2">
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nu au fost găsite template-uri
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Numele template-ului"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Conținut Contract *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Conținutul contractului cu placeholder-uri (ex: {{beneficiary.name}})"
                className="min-h-[400px]"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Variabile Prestator</h4>
                <div className="space-y-1">
                  {[
                    '{{provider.name}}',
                    '{{provider.address}}',
                    '{{provider.cui}}',
                    '{{provider.registrationNumber}}',
                    '{{provider.legalRepresentative}}',
                    '{{provider.phone}}',
                    '{{provider.email}}'
                  ].map((variable) => (
                    <div key={variable} className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <code className="text-blue-700 text-xs">{variable}</code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addVariable(variable)}
                        className="text-xs h-6 px-2"
                      >
                        Adaugă
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">👤 Variabile Beneficiar</h4>
                <div className="space-y-1">
                  {[
                    '{{beneficiary.name}}',
                    '{{beneficiary.email}}',
                    '{{beneficiary.phone}}',
                    '{{beneficiary.address}}',
                    '{{beneficiary.cnp}}',
                    '{{beneficiary.companyName}}',
                    '{{beneficiary.companyCui}}'
                  ].map((variable) => (
                    <div key={variable} className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <code className="text-green-700 text-xs">{variable}</code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addVariable(variable)}
                        className="text-xs h-6 px-2"
                      >
                        Adaugă
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">📋 Variabile Contract</h4>
                <div className="space-y-1">
                  {[
                    '{{orderNumber}}',
                    '{{currentDate}}',
                    '{{contract.startDate}}',
                    '{{contract.endDate}}',
                    '{{contract.value}}',
                    '{{contract.currency}}',
                    '{{contract.notes}}'
                  ].map((variable) => (
                    <div key={variable} className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <code className="text-purple-700 text-xs">{variable}</code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addVariable(variable)}
                        className="text-xs h-6 px-2"
                      >
                        Adaugă
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Exemple & Condiții</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <div>
                    <p><strong>Variabile de bază:</strong></p>
                    <p>{"{{provider.name}}"}, CIF {"{{provider.cui}}"}</p>
                    <p>{"{{beneficiary.name}}"}, {"{{beneficiary.email}}"}</p>
                  </div>
                  
                  <div className="border-t border-yellow-200 pt-2">
                    <p><strong>Condiții pentru tip beneficiar:</strong></p>
                    <div className="mt-1 space-y-1">
                      <code className="block bg-white px-2 py-1 rounded text-xs">
                        {"{{#if isCompany}}"}Conținut pentru companii{"{{/if}}"}
                      </code>
                      <code className="block bg-white px-2 py-1 rounded text-xs">
                        {"{{#if isIndividual}}"}Conținut pentru PF{"{{/if}}"}
                      </code>
                    </div>
                  </div>
                  
                  <div className="border-t border-yellow-200 pt-2">
                    <p><strong>Exemplu complet:</strong></p>
                    <code className="block bg-white px-2 py-1 rounded text-xs">
                      {"{{#if isCompany}}"}{"{{beneficiary.companyName}}"}, CUI {"{{beneficiary.companyCui}}"}{"{{/if}}"}
                    </code>
                    <code className="block bg-white px-2 py-1 rounded text-xs">
                      {"{{#if isIndividual}}"}{"{{beneficiary.name}}"}, CNP {"{{beneficiary.cnp}}"}{"{{/if}}"}
                    </code>
                  </div>
                </div>
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
              {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? "Se salvează..." : (selectedTemplate ? "Actualizează" : "Creează")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}