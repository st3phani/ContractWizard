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

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.content) {
      toast({
        title: "Error",
        description: "Numele și conținutul sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }

    createTemplateMutation.mutate(formData);
  };

  const handlePreview = (template: ContractTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewModalOpen(true);
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
              onClick={() => setIsCreateModalOpen(true)}
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
                              onClick={() => {
                                if (window.confirm("Sunteți sigur că doriți să ștergeți acest template?")) {
                                  // Delete functionality would go here
                                }
                              }}
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
              <Label htmlFor="name">Nume Template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Numele template-ului"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Conținut Contract</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                placeholder="Conținutul contractului cu placeholder-uri (ex: {{beneficiary.fullName}})"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p><strong>Placeholder-uri disponibile:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{"{{orderNumber}}"} - Numărul de ordine</li>
                <li>{"{{currentDate}}"} - Data curentă</li>
                <li>{"{{beneficiary.fullName}}"} - Numele beneficiarului</li>
                <li>{"{{beneficiary.email}}"} - Email-ul beneficiarului</li>
                <li>{"{{beneficiary.address}}"} - Adresa beneficiarului</li>
                <li>{"{{beneficiary.cnp}}"} - CNP/CUI beneficiarului</li>
                <li>{"{{contract.value}}"} - Valoarea contractului</li>
                <li>{"{{contract.currency}}"} - Moneda</li>
                <li>{"{{contract.startDate}}"} - Data începerii</li>
                <li>{"{{contract.endDate}}"} - Data încheierii</li>
                <li>{"{{contract.notes}}"} - Observații</li>
              </ul>
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
              onClick={handleCreateTemplate}
              disabled={createTemplateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createTemplateMutation.isPending ? "Se salvează..." : "Salvează Template"}
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
