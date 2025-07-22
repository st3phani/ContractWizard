import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Mail, Phone, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/sidebar";

export default function Profile() {
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: "Administrator",
    lastName: "System",
    email: "admin@contractmanager.ro",
    phone: "+40 21 123 4567",
    role: "administrator",
  });

  const handleSave = () => {
    const missingFields = [];
    const fieldsToFocus = [];

    if (!profileData.firstName) {
      missingFields.push('Prenume');
      fieldsToFocus.push('firstName');
    }
    if (!profileData.lastName) {
      missingFields.push('Nume');
      fieldsToFocus.push('lastName');
    }
    if (!profileData.email) {
      missingFields.push('Email');
      fieldsToFocus.push('email');
    }
    if (!profileData.phone) {
      missingFields.push('Telefon');
      fieldsToFocus.push('phone');
    }
    if (!profileData.role) {
      missingFields.push('Rol');
      fieldsToFocus.push('role');
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

    // Remove error styling from all fields
    ['firstName', 'lastName', 'email', 'phone', 'role'].forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    toast({
      title: "Success",
      description: "Profilul a fost salvat cu succes!",
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
              <h2 className="text-2xl font-semibold text-gray-900">Profil Administrator</h2>
              <p className="text-gray-600 mt-1">Gestionați informațiile dvs. personale</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informații Personale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prenume *</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => {
                      setProfileData({ ...profileData, firstName: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nume *</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => {
                      setProfileData({ ...profileData, lastName: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => {
                      setProfileData({ ...profileData, email: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => {
                      setProfileData({ ...profileData, phone: e.target.value });
                      // Remove error styling when user starts typing
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rol *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                  <Select 
                    value={profileData.role} 
                    onValueChange={(value) => {
                      setProfileData({ ...profileData, role: value });
                      // Remove error styling when user selects
                      const element = document.getElementById('role');
                      if (element) {
                        element.classList.remove('field-error');
                      }
                    }}
                  >
                    <SelectTrigger id="role" className="pl-10">
                      <SelectValue placeholder="Selectează rolul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">Utilizator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvează Profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}