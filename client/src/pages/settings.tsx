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
import { Building, Mail, Phone, MapPin, Save, Database, Shield, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import type { CompanySettings, ContractStatus } from "@shared/schema";
import EmailTest from "@/components/email-test";



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

  // Fetch system settings
  const { data: existingSystemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
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

  // Update system settings when data is loaded
  useEffect(() => {
    if (existingSystemSettings && typeof existingSystemSettings === 'object') {
      setSystemSettings({
        language: (existingSystemSettings as any).language || "ro",
        currency: (existingSystemSettings as any).currency || "RON",
        dateFormat: (existingSystemSettings as any).dateFormat || "dd/mm/yyyy",
        autoBackup: (existingSystemSettings as any).autoBackup ?? true,
      });
    }
  }, [existingSystemSettings]);

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
        description: "Company settings have been saved successfully!",
        className: "bg-green-600 text-white border-green-600",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while saving settings.",
        variant: "destructive",
      });
    },
  });

  const handleSaveCompanySettings = () => {
    const missingFields = [];
    const fieldsToFocus = [];

    if (!companySettings.name) {
      missingFields.push('Company Name');
      fieldsToFocus.push('companyName');
    }
    if (!companySettings.address) {
      missingFields.push('Address');
      fieldsToFocus.push('companyAddress');
    }
    if (!companySettings.phone) {
      missingFields.push('Phone');
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
      missingFields.push('Registration Number');
      fieldsToFocus.push('companyRegistrationNumber');
    }
    if (!companySettings.legalRepresentative) {
      missingFields.push('Legal Representative');
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
        description: `The following fields are required: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Remove red borders on successful validation
    const allFieldIds = ['company-name', 'company-address', 'company-phone', 'company-email', 'company-cui', 'company-registration', 'company-legal'];
    allFieldIds.forEach((fieldId: string) => {
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
        description: "System settings have been saved successfully!",
        className: "bg-green-600 text-white border-green-600",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while saving system settings.",
        variant: "destructive",
      });
    },
  });

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
    <>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Configure the application according to your needs.</p>
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
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
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
                  <Label htmlFor="companyRegistrationNumber">Trade Registry No. *</Label>
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
                  <Input
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
                <Label htmlFor="companyAddress">Address *</Label>
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
                  <Label htmlFor="companyPhone">Phone *</Label>
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
                  {saveCompanySettingsMutation.isPending ? "Saving..." : "Save Company Information"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={systemSettings.language} onValueChange={(value) => 
                    setSystemSettings({ ...systemSettings, language: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Romanian</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
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
                  <Label htmlFor="dateFormat">Date Format</Label>
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



              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveSystemSettings} 
                  disabled={saveSystemSettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Save system settings"
                  aria-label="Save system settings"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveSystemSettingsMutation.isPending ? "Saving..." : "Save System Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contract Statuses Management */}
          <ContractStatusesSection />

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backup</Label>
                  <p className="text-sm text-gray-500">Perform automatic daily data backup</p>
                </div>
                <Switch
                  checked={systemSettings.autoBackup}
                  onCheckedChange={(checked) => 
                    setSystemSettings({ ...systemSettings, autoBackup: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={handleExportData} 
                  variant="outline"
                  title="Export all application data"
                  aria-label="Export all application data"
                >
                  Export Data
                </Button>
                <Button 
                  onClick={handleImportData} 
                  variant="outline"
                  title="Import data into application"
                  aria-label="Import data into application"
                >
                  Import Data
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Export/import operations may take several minutes depending on the amount of data.
                </p>
              </div>

              {/* Email Testing Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <TestTube className="h-4 w-4 mr-2" />
                    <span className="font-medium">Email System Test</span>
                  </div>
                  <EmailTest />
                </div>
                <p className="text-sm text-gray-600">
                  Test email sending functionality using MailHog for development.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  );
}

function ContractStatusesSection() {
  // Fetch contract statuses
  const { data: statuses, isLoading } = useQuery<ContractStatus[]>({
    queryKey: ["/api/contract-statuses"],
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Contract Statuses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading statuses...</div>
        ) : (
          <div className="space-y-2">
            {statuses?.map((status) => (
              <div key={status.id} className="p-3 border rounded-lg">
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

              </div>
            ))}
          </div>
        )}
        

      </CardContent>
    </Card>
  );
}