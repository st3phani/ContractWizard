import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save, Mail, Phone, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { UserProfile, InsertUserProfile } from "@shared/schema";



export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user profile
  const { data: userProfile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile"],
  });

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "administrator",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Update local state when profile data is loaded
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        role: userProfile.role || "administrator",
      });
    }
  }, [userProfile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: InsertUserProfile) => {
      const response = await fetch("/api/user-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-profile"] });
      toast({
        title: "Succes",
        description: "Profilul a fost actualizat cu succes",
        className: "bg-green-600 text-white border-green-600",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "A apărut o eroare la actualizarea profilului",
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await fetch("/api/user-profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update password");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Succes",
        description: "Parola a fost actualizată cu succes",
        className: "bg-green-600 text-white border-green-600",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
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
      missingFields.push('Phone');
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
        description: `The following fields are required: ${missingFields.join(', ')}`,
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

    // Save profile to backend
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSave = () => {
    const missingFields = [];
    const fieldsToFocus = [];

    if (!passwordData.currentPassword) {
      missingFields.push('Current Password');
      fieldsToFocus.push('currentPassword');
    }
    if (!passwordData.newPassword) {
      missingFields.push('New Password');
      fieldsToFocus.push('newPassword');
    }
    if (!passwordData.confirmPassword) {
      missingFields.push('Password Confirmation');
      fieldsToFocus.push('confirmPassword');
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

      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      const confirmField = document.getElementById('confirmPassword');
      if (confirmField) {
        confirmField.classList.add('field-error');
        confirmField.focus();
      }
      toast({
        title: "Error",
        description: "New Password și confirmarea nu coincid",
        variant: "destructive",
      });
      return;
    }

    // Check password length
    if (passwordData.newPassword.length < 6) {
      const newPasswordField = document.getElementById('newPassword');
      if (newPasswordField) {
        newPasswordField.classList.add('field-error');
        newPasswordField.focus();
      }
      toast({
        title: "Error",
        description: "New Password trebuie să aibă cel puțin 6 caractere",
        variant: "destructive",
      });
      return;
    }

    // Remove error styling from all fields
    ['currentPassword', 'newPassword', 'confirmPassword'].forEach(fieldId => {
      const element = document.getElementById(fieldId);
      if (element) {
        element.classList.remove('field-error');
      }
    });

    // Save password to backend
    updatePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Administrator Profile</h2>
              <p className="text-gray-600 mt-1">Manage your personal information</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl">
            {/* Profile Information Card */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
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
                  <Label htmlFor="lastName">Last Name *</Label>
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
                <Label htmlFor="phone">Phone *</Label>
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
                <Label htmlFor="role">Role *</Label>
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
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrator">Administrator</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
                <Button 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                  title="Save profile information"
                  aria-label="Save profile information"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </div>
              </CardContent>
            </Card>

            {/* Password Section */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    title={showPasswords.current ? "Hide password" : "Show password"}
                    aria-label={showPasswords.current ? "Hide password" : "Show password"}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      if (e.target.value.length > 0) {
                        e.target.classList.remove('field-error');
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
                <Button 
                  onClick={handlePasswordSave}
                  disabled={updatePasswordMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                  title="Actualizează parola contului"
                  aria-label="Actualizează parola contului"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updatePasswordMutation.isPending ? "Se actualizează..." : "Update Password"}
                </Button>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </>
  );
}