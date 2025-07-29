import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Mail, Phone, MapPin, Save, Database, Bell, Shield, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import type { CompanySettings, ContractStatus } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Company Settings
  const [companySettings, setCompanySettings] = useState({
    name: "Compania Mea SRL",
    address: "Str. Principală nr. 123, București, România",
    phone: "+40 21 123 4567",
    email: "contact@compania-mea.ro",
    cui: "RO12345678",
    registrationNumber: "J40/1234/2023",
    legalRepresentative: "Ion Popescu",
  });

  // Fetch company settings
  const { data: existingSettings } = useQuery<CompanySettings>({
    queryKey: ["/api/company-settings"],
  });

  // Update form when data is loaded
  useEffect(() => {
    if (existingSettings) {
      setCompanySettings({
        name: existingSettings.name,
        address: existingSettings.address,
        phone: existingSettings.phone,
        email: existingSettings.email,
        cui: existingSettings.cui,
        registrationNumber: existingSettings.registrationNumber,
        legalRepresentative: existingSettings.legalRepresentative,
      });
    }
  }, [existingSettings]);

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    contractCreated: true,
    contractSent: true,
    contractSigned: false,
    dailyReports: false,
  });

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    language: "ro",
    currency: "RON",
    dateFormat: "dd/mm/yyyy",
    autoBackup: true,
  });

  // Save company settings mutation
  const saveCompanySettingsMutation = useMutation({
    mutationFn: (data: typeof companySettings) => {
      return apiRequest("PUT", "/api/company-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-settings"] });
      toast({
        title: "Success",
        description: "Setările companiei au fost salvate cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la salvarea setărilor.",
        variant: "destructive",
      });
    },
  });

  const handleSaveCompanySettings = () => {
    const missingFields = [];
    const fieldsToFocus = [];

    if (!companySettings.name) {
      missingFields.push('Nume Companie');
      fieldsToFocus.push('companyName');
    }
    if (!companySettings.address) {
      missingFields.push('Adresa');
      fieldsToFocus.push('companyAddress');
    }
    if (!companySettings.phone) {
      missingFields.push('Telefon');
      fieldsToFocus.push('companyPhone');
    }
    if (!companySettings.email) {
      missingFields.push('Email');
      fieldsToFocus.push('companyEmail');
    }
    if (!companySettings.cui) {
      missingFields.push('CUI');
      fieldsToFocus.push('companyCui');
    }
    if (!companySettings.registrationNumber) {
      missingFields.push('Număr Înregistrare');
      fieldsToFocus.push('companyRegistrationNumber');
    }
    if (!companySettings.legalRepresentative) {
      missingFields.push('Reprezentant Legal');
      fieldsToFocus.push('companyLegalRepresentative');
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
    const allFields = ['companyName', 'companyAddress', 'companyPhone', 'companyEmail', 'companyCui', 'companyRegistrationNumber', 'companyLegalRepresentative'];
    allFields.forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    saveCompanySettingsMutation.mutate(companySettings);
  };

  // Save system settings mutation
  const saveSystemSettingsMutation = useMutation({
    mutationFn: (data: typeof systemSettings) => {
      return apiRequest("PUT", "/api/system-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Success",
        description: "Setările de sistem au fost salvate cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la salvarea setărilor de sistem.",
        variant: "destructive",
      });
    },
  });

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Success", 
      description: "Setările de notificări au fost salvate cu succes!",
    });
  };

  const handleSaveSystemSettings = () => {
    saveSystemSettingsMutation.mutate(systemSettings);
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Exportul datelor a fost inițiat. Veți primi un email când va fi gata.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import",
      description: "Funcționalitatea de import va fi disponibilă în curând.",
    });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="header-sticky p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Setări</h2>
              <p className="text-gray-600 mt-1">Configurați aplicația conform nevoilor dvs.</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Company Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Informații Companie
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nume Companie *</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, name: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyCui">CUI *</Label>
                  <Input
                    id="companyCui"
                    value={companySettings.cui}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, cui: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyRegistrationNumber">Nr. Registrul Comerțului *</Label>
                  <Input
                    id="companyRegistrationNumber"
                    value={companySettings.registrationNumber}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, registrationNumber: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyLegalRepresentative">Reprezentant Legal *</Label>
                  <Input
                    id="companyLegalRepresentative"
                    value={companySettings.legalRepresentative}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, legalRepresentative: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresa *</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => {
                    setCompanySettings({ ...companySettings, address: e.target.value });
                    // Remove error styling when user starts typing
                    if (e.target.value.length > 0) {
                      e.target.classList.remove('field-error');
                    }
                  }}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefon *</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, phone: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => {
                      setCompanySettings({ ...companySettings, email: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveCompanySettings} 
                  disabled={saveCompanySettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveCompanySettingsMutation.isPending ? "Se salvează..." : "Salvează Informații Companie"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Setări Notificări
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificări Email</Label>
                  <p className="text-sm text-gray-500">Primiți notificări prin email pentru activități importante</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Contract Creat</Label>
                  <Switch
                    checked={notificationSettings.contractCreated}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, contractCreated: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Contract Trimis</Label>
                  <Switch
                    checked={notificationSettings.contractSent}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, contractSent: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Contract Semnat</Label>
                  <Switch
                    checked={notificationSettings.contractSigned}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, contractSigned: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Rapoarte Zilnice</Label>
                  <Switch
                    checked={notificationSettings.dailyReports}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({ ...notificationSettings, dailyReports: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotificationSettings} 
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Salvează setările de notificări"
                  aria-label="Salvează setările de notificări"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvează Setări Notificări
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Setări Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Limbă</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => 
                    setSystemSettings({ ...systemSettings, language: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Română</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda Implicită</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => 
                    setSystemSettings({ ...systemSettings, currency: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RON">RON</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format Dată</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => 
                    setSystemSettings({ ...systemSettings, dateFormat: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automat</Label>
                  <p className="text-sm text-gray-500">Efectuează backup automat al datelor zilnic</p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSystemSettings({ ...systemSettings, autoBackup: checked })
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSystemSettings} 
                  disabled={saveSystemSettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Salvează setările de sistem"
                  aria-label="Salvează setările de sistem"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveSystemSettingsMutation.isPending ? "Se salvează..." : "Salvează Setări Sistem"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Gestionare Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData} 
                  variant="outline"
                  title="Exportă toate datele aplicației"
                  aria-label="Exportă toate datele aplicației"
                >
                  Export Date
                </Button>
                <Button 
                  onClick={handleImportData} 
                  variant="outline"
                  title="Importă date în aplicație"
                  aria-label="Importă date în aplicație"
                >
                  Import Date
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenție:</strong> Operațiunile de export/import pot dura câteva minute în funcție de cantitatea de date.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contract Statuses Management */}
          <ContractStatusesSection />
        </div>
      </main>
    </div>
  );
}

function ContractStatusesSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<ContractStatus | null>(null);
  const [formData, setFormData] = useState({
    statusCode: '',
    statusLabel: '',
    description: ''
  });

  // Fetch contract statuses
  const { data: statuses, isLoading } = useQuery<ContractStatus[]>({
    queryKey: ["/api/contract-statuses"],
  });

  // Update mutation (only for editing existing statuses)
  const saveStatusMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      return apiRequest("PUT", `/api/contract-statuses/${editingStatus!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-statuses"] });
      setIsDialogOpen(false);
      setEditingStatus(null);
      setFormData({ statusCode: '', statusLabel: '', description: '' });
      toast({
        title: "Success",
        description: "Status actualizat cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la salvarea statusului.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteStatusMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contract-statuses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-statuses"] });
      toast({
        title: "Success",
        description: "Status șters cu succes!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la ștergerea statusului.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (status: ContractStatus) => {
    setEditingStatus(status);
    setFormData({
      statusCode: status.statusCode,
      statusLabel: status.statusLabel,
      description: status.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.statusCode || !formData.statusLabel) {
      toast({
        title: "Error",
        description: "Codul și eticheta statusului sunt obligatorii.",
        variant: "destructive",
      });
      return;
    }
    saveStatusMutation.mutate(formData);
  };

  const handleDelete = (status: ContractStatus) => {
    if (confirm(`Sigur doriți să ștergeți statusul "${status.statusLabel}"?`)) {
      deleteStatusMutation.mutate(status.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Statusuri Contracte
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Se încarcă statusurile...</div>
        ) : (
          <div className="space-y-2">
            {statuses?.map((status) => (
              <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                      {status.statusCode}
                    </span>
                    <span className="font-medium">{status.statusLabel}</span>
                  </div>
                  {status.description && (
                    <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(status)}
                    title="Editează statusul"
                    aria-label={`Editează statusul ${status.statusLabel}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(status)}
                    disabled={deleteStatusMutation.isPending}
                    className="text-red-600 hover:text-red-700"
                    title="Șterge statusul"
                    aria-label={`Șterge statusul ${status.statusLabel}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Edit Status Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editează Status</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="statusCode">Cod Status *</Label>
                <Input
                  id="statusCode"
                  value={formData.statusCode}
                  onChange={(e) => setFormData({ ...formData, statusCode: e.target.value })}
                  placeholder="ex: draft, signed, completed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusLabel">Etichetă Status *</Label>
                <Input
                  id="statusLabel"
                  value={formData.statusLabel}
                  onChange={(e) => setFormData({ ...formData, statusLabel: e.target.value })}
                  placeholder="ex: Ciornă, Semnat, Finalizat"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statusDescription">Descriere</Label>
                <Textarea
                  id="statusDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrierea statusului..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  title="Anulează operația"
                  aria-label="Anulează editarea statusului"
                >
                  Anulează
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={saveStatusMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Salvează statusul"
                  aria-label="Salvează statusul de contract"
                >
                  {saveStatusMutation.isPending ? "Se salvează..." : "Salvează"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}