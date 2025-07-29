import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

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
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
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

  const handleDuplicateTemplate = (template: ContractTemplate) => {
    const duplicatedData = {
      name: `${template.name} - Copie`,
      content: template.content,
      fields: template.fields,
    };
    
    createTemplateMutation.mutate(duplicatedData);
    
    toast({
      title: "Template duplicat",
      description: `Template-ul "${template.name}" a fost duplicat cu succes!`,
      duration: 3000,
    });
  };

  const handlePreviewTemplate = (template: ContractTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const addVariable = (variable: string) => {
    if (editorInstance) {
      // Utilizează editorul TipTap pentru inserare directă
      editorInstance.chain().focus().insertContent(' ' + variable).run();
      
      toast({
        title: "Variabilă adăugată",
        description: `${variable} a fost adăugat în template`,
        duration: 2000,
      });
    } else {
      // Fallback dacă editorul nu este disponibil
      const currentContent = formData.content || '<p></p>';
      let newContent;
      
      if (currentContent.trim() === '<p></p>' || currentContent.trim() === '') {
        newContent = `<p>${variable}</p>`;
      } else if (currentContent.includes('</p>')) {
        const lastPIndex = currentContent.lastIndexOf('</p>');
        if (lastPIndex !== -1) {
          const beforeClosing = currentContent.substring(0, lastPIndex);
          const afterClosing = currentContent.substring(lastPIndex);
          newContent = beforeClosing + ' ' + variable + afterClosing;
        } else {
          newContent = currentContent + ' ' + variable;
        }
      } else {
        newContent = currentContent + ' ' + variable;
      }
      
      setFormData({ ...formData, content: newContent });
      
      toast({
        title: "Variabilă adăugată", 
        description: `${variable} a fost adăugat în template`,
        duration: 2000,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <main className="flex-1 main-container">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Template-uri Contract</h2>
              <p className="text-gray-600 mt-1">Gestionați template-urile pentru contracte</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setFormData({ name: "", content: "", fields: "[]" });
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              title="Creează un template nou"
              aria-label="Creează un template nou"
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
              <CardTitle>Lista Template-uri</CardTitle>
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
                      <TableHead className="text-center">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{formatDate(template.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreviewTemplate(template)}
                              title="Previzualizare Template"
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
                              title="Editează template-ul"
                              aria-label="Editează template-ul"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateTemplate(template)}
                              title="Duplicare Template"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Șterge template-ul"
                              aria-label="Șterge template-ul"
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
                onEditorReady={(editor) => setEditorInstance(editor)}
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
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                        <code className="text-yellow-700 text-xs">
                          {"{{#if isCompany}}"}Conținut pentru companii{"{{/if}}"}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addVariable("{{#if isCompany}}Conținut pentru companii{{/if}}")}
                          className="text-xs h-6 px-2"
                        >
                          Adaugă
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                        <code className="text-yellow-700 text-xs">
                          {"{{#if isIndividual}}"}Conținut pentru PF{"{{/if}}"}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addVariable("{{#if isIndividual}}Conținut pentru PF{{/if}}")}
                          className="text-xs h-6 px-2"
                        >
                          Adaugă
                        </Button>
                      </div>
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

      {/* Template Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Previzualizare Template: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">ℹ️ Informații</h4>
              <p className="text-sm text-amber-700">
                Aceasta este o previzualizare a template-ului cu variabilele nepopulate. 
                În contractele reale, variabilele precum <code>{"{{beneficiary.name}}"}</code> vor fi înlocuite cu datele actuale.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewTemplate?.content || '' }}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🔧 Variabile utilizate</h4>
              <div className="text-sm text-blue-700">
                <p className="mb-2">Template-ul conține următoarele tipuri de variabile:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Variabile beneficiar:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {previewTemplate?.content.includes('{{beneficiary.name}}') && <li>Nume beneficiar</li>}
                      {previewTemplate?.content.includes('{{beneficiary.email}}') && <li>Email beneficiar</li>}
                      {previewTemplate?.content.includes('{{beneficiary.address}}') && <li>Adresă beneficiar</li>}
                      {previewTemplate?.content.includes('{{beneficiary.cnp}}') && <li>CNP beneficiar</li>}
                      {previewTemplate?.content.includes('{{beneficiary.companyName}}') && <li>Nume companie</li>}
                      {previewTemplate?.content.includes('{{beneficiary.companyCui}}') && <li>CUI companie</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Variabile contract:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {previewTemplate?.content.includes('{{orderNumber}}') && <li>Număr contract</li>}
                      {previewTemplate?.content.includes('{{currentDate}}') && <li>Data curentă</li>}
                      {previewTemplate?.content.includes('{{contract.value}}') && <li>Valoare contract</li>}
                      {previewTemplate?.content.includes('{{contract.startDate}}') && <li>Data început</li>}
                      {previewTemplate?.content.includes('{{contract.endDate}}') && <li>Data sfârșit</li>}
                      {previewTemplate?.content.includes('{{contract.notes}}') && <li>Observații</li>}
                    </ul>
                  </div>
                </div>
                {(previewTemplate?.content.includes('{{#if isCompany}}') || previewTemplate?.content.includes('{{#if isIndividual}}')) && (
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="font-medium text-green-800">✨ Template condițional</p>
                    <p className="text-xs text-green-700">Acest template conține logică condițională pentru afișarea diferită a conținutului pentru persoane fizice vs companii.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Închide
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
}