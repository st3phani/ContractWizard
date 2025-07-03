import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Mail, Phone, MapPin, Save, Database, Bell, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

export default function Settings() {
  const { toast } = useToast();
  
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

  const handleSaveCompanySettings = () => {
    // In a real implementation, this would save to the database
    toast({
      title: "Success",
      description: "Setările companiei au fost salvate cu succes!",
    });
  };

  const handleSaveNotificationSettings = () => {
    toast({
      title: "Success", 
      description: "Setările de notificări au fost salvate cu succes!",
    });
  };

  const handleSaveSystemSettings = () => {
    toast({
      title: "Success",
      description: "Setările de sistem au fost salvate cu succes!",
    });
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
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 p-6">
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
                  <Label htmlFor="companyName">Nume Companie</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cui">CUI</Label>
                  <Input
                    id="cui"
                    value={companySettings.cui}
                    onChange={(e) => setCompanySettings({ ...companySettings, cui: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Nr. Registrul Comerțului</Label>
                  <Input
                    id="registrationNumber"
                    value={companySettings.registrationNumber}
                    onChange={(e) => setCompanySettings({ ...companySettings, registrationNumber: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="legalRepresentative">Reprezentant Legal</Label>
                  <Input
                    id="legalRepresentative"
                    value={companySettings.legalRepresentative}
                    onChange={(e) => setCompanySettings({ ...companySettings, legalRepresentative: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresa</Label>
                <Textarea
                  id="companyAddress"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefon</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveCompanySettings} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvează Informații Companie
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
                <Button onClick={handleSaveNotificationSettings} className="bg-blue-600 hover:bg-blue-700">
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
                <Button onClick={handleSaveSystemSettings} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvează Setări Sistem
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
                <Button onClick={handleExportData} variant="outline">
                  Export Date
                </Button>
                <Button onClick={handleImportData} variant="outline">
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
        </div>
      </main>
    </div>
  );
}