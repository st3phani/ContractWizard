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
import { useDateFormat } from "@/hooks/use-date-format";

import RichTextEditor from "@/components/rich-text-editor";
import type { ContractTemplate, ContractTemplateWithUsage, InsertContractTemplate } from "@shared/schema";


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
  const { formatDate } = useDateFormat();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery<ContractTemplateWithUsage[]>({
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
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  const handleDuplicateTemplate = (template: ContractTemplate) => {
    const duplicatedData = {
      name: `${template.name} - Copy`,
      content: template.content,
      fields: template.fields,
    };
    
    createTemplateMutation.mutate(duplicatedData);
    
    toast({
      title: "Template duplicated",
      description: `Template "${template.name}" was duplicated successfully!`,
      duration: 3000,
    });
  };

  const handlePreviewTemplate = (template: ContractTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const addVariable = (variable: string) => {
    if (editorInstance) {
      // Use TipTap editor for direct insertion
      editorInstance.chain().focus().insertContent(' ' + variable).run();
      
      toast({
        title: "Variable added",
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
        title: "Variable added", 
        description: `${variable} a fost adăugat în template`,
        duration: 2000,
      });
    }
  };

  return (
    <>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Contract Templates</h2>
              <p className="text-gray-600 mt-1">Manage contract templates</p>
            </div>
            <Button 
              onClick={() => {
                setSelectedTemplate(null);
                setFormData({ name: "", content: "", fields: "[]" });
                setIsCreateModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
              title="Create new template"
              aria-label="Create new template"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Template List</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
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
                              className="hover:bg-blue-50"
                              title="Preview Template"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
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
                              className="hover:bg-green-50"
                              title="Edit template"
                              aria-label="Edit template"
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateTemplate(template)}
                              className="hover:bg-indigo-50"
                              title="Duplicate Template"
                            >
                              <Copy className="h-4 w-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => !template.isUsed ? handleDeleteTemplate(template.id) : undefined}
                              disabled={template.isUsed}
                              className={template.isUsed ? "opacity-30 cursor-not-allowed" : "hover:bg-red-50"}
                              title={template.isUsed ? "Cannot delete - template is used in contracts" : "Delete template"}
                              aria-label={template.isUsed ? "Cannot delete - template is used in contracts" : "Delete template"}
                            >
                              <Trash2 className={`h-4 w-4 ${template.isUsed ? "text-gray-400" : "text-red-600"}`} />
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
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Template name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contract Content *</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Contract content with placeholders (ex: {{beneficiary.name}})"
                className="min-h-[400px]"
                onEditorReady={(editor) => setEditorInstance(editor)}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">📋 Provider Variables</h4>
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
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">👤 Partner Variables</h4>
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
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-3">📋 Contract Variables</h4>
                <div className="space-y-1">
                  {[
                    '{{orderNumber}}',
                    '{{currentDate}}',
                    '{{contract.startDate}}',
                    '{{contract.endDate}}',
                    '{{contract.value}}',
                    '{{contract.currency}}',
                  ].map((variable) => (
                    <div key={variable} className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                      <code className="text-purple-700 text-xs">{variable}</code>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => addVariable(variable)}
                        className="text-xs h-6 px-2"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Examples & Conditions</h4>
                <div className="text-sm text-yellow-800 space-y-2">
                  <div>
                    <p><strong>Basic variables:</strong></p>
                    <p>{"{{provider.name}}"}, CIF {"{{provider.cui}}"}</p>
                    <p>{"{{beneficiary.name}}"}, {"{{beneficiary.email}}"}</p>
                  </div>
                  
                  <div className="border-t border-yellow-200 pt-2">
                    <p><strong>Conditions for partner type:</strong></p>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                        <code className="text-yellow-700 text-xs">
                          {"{{#if isCompany}}"}Content for companies{"{{/if}}"}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addVariable("{{#if isCompany}}Content for companies{{/if}}")}
                          className="text-xs h-6 px-2"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded border">
                        <code className="text-yellow-700 text-xs">
                          {"{{#if isIndividual}}"}Content for individuals{"{{/if}}"}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => addVariable("{{#if isIndividual}}Content for individuals{{/if}}")}
                          className="text-xs h-6 px-2"
                        >
                          Add
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
              Cancel
            </Button>
            <Button 
              onClick={handleSaveTemplate}
              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? "Saving..." : (selectedTemplate ? "Update" : "Create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-800 mb-2">ℹ️ Informații</h4>
              <p className="text-sm text-amber-700">
                This is a preview of the template with unpopulated variables. 
                In real contracts, variables like <code>{"{{beneficiary.name}}"}</code> will be replaced with actual data.
              </p>
            </div>
            
            <div className="border rounded-lg p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: previewTemplate?.content || '' }}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🔧 Variables used</h4>
              <div className="text-sm text-blue-700">
                <p className="mb-2">The template contains the following types of variables:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Beneficiary variables:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {previewTemplate?.content.includes('{{beneficiary.name}}') && <li>Beneficiary name</li>}
                      {previewTemplate?.content.includes('{{beneficiary.email}}') && <li>Beneficiary email</li>}
                      {previewTemplate?.content.includes('{{beneficiary.address}}') && <li>Beneficiary address</li>}
                      {previewTemplate?.content.includes('{{beneficiary.cnp}}') && <li>Beneficiary CNP</li>}
                      {previewTemplate?.content.includes('{{beneficiary.companyName}}') && <li>Company name</li>}
                      {previewTemplate?.content.includes('{{beneficiary.companyCui}}') && <li>Company CUI</li>}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Contract variables:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {previewTemplate?.content.includes('{{orderNumber}}') && <li>Contract number</li>}
                      {previewTemplate?.content.includes('{{currentDate}}') && <li>Current date</li>}
                      {previewTemplate?.content.includes('{{contract.value}}') && <li>Contract value</li>}
                      {previewTemplate?.content.includes('{{contract.startDate}}') && <li>Start date</li>}
                      {previewTemplate?.content.includes('{{contract.endDate}}') && <li>End date</li>}
                    </ul>
                  </div>
                </div>
                {(previewTemplate?.content.includes('{{#if isCompany}}') || previewTemplate?.content.includes('{{#if isIndividual}}')) && (
                  <div className="mt-3 p-2 bg-green-100 rounded">
                    <p className="font-medium text-green-800">✨ Conditional template</p>
                    <p className="text-xs text-green-700">This template contains conditional logic for displaying different content for individuals vs companies.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}