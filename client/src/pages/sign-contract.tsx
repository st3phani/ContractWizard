import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, CheckCircle2, AlertCircle, FileText, User, Building, Calendar, Euro, Eye } from "lucide-react";

const contractSigningSchema = z.object({
  signedBy: z.string().min(1, "Numele este obligatoriu pentru semnare"),
  agreed: z.boolean().refine(val => val === true, "Trebuie să fiți de acord cu termenii contractului"),
});

type ContractSigningData = z.infer<typeof contractSigningSchema>;

export default function SignContract() {
  const [, params] = useRoute("/sign-contract/:token");
  const token = params?.token;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const form = useForm<ContractSigningData>({
    resolver: zodResolver(contractSigningSchema),
    defaultValues: {
      signedBy: "",
      agreed: false
    }
  });

  // Fetch contract data
  const { data: contract, isLoading, error: fetchError } = useQuery({
    queryKey: ['/api/contracts/sign', token],
    queryFn: async () => {
      if (!token) throw new Error("Token missing");
      const response = await fetch(`/api/contracts/sign/${token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load contract");
      }
      return response.json();
    },
    enabled: !!token,
    retry: false
  });

  // Sign contract mutation
  const signMutation = useMutation({
    mutationFn: async (data: ContractSigningData) => {
      if (!token) throw new Error("Token missing");
      const response = await fetch(`/api/contracts/sign/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to sign contract");
      }

      return response.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
      setSuccess(false);
    }
  });

  const onSubmit = async (data: ContractSigningData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signMutation.mutateAsync(data);
    } catch (err) {
      // Error is handled in mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  // Pre-fill signedBy field based on beneficiary info
  useEffect(() => {
    if (contract?.beneficiary && !form.getValues('signedBy')) {
      let defaultName = contract.beneficiary.name;
      
      // If it's a company, use the legal representative
      if (contract.beneficiary.isCompany && contract.beneficiary.companyLegalRepresentative) {
        defaultName = contract.beneficiary.companyLegalRepresentative;
      }
      
      form.setValue('signedBy', defaultName);
    }
  }, [contract, form]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Link de semnare invalid. Vă rugăm să verificați link-ul primit prin email.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-gray-600">Se încarcă contractul...</span>
        </div>
      </div>
    );
  }

  if (fetchError || !contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchError instanceof Error ? fetchError.message : "Contract nu a fost găsit sau link-ul a expirat."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Contract Semnat cu Succes!</CardTitle>
            <CardDescription>
              Contractul a fost semnat și salvat în sistem. Veți primi o confirmare prin email.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Detalii Contract</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Numărul contractului:</strong> {contract.orderNumber}</p>
                <p><strong>Template:</strong> {contract.template?.name}</p>
                <p><strong>Semnat de:</strong> {form.getValues('signedBy')}</p>
                <p><strong>Data semnării:</strong> {new Date().toLocaleDateString('ro-RO')}</p>
                <p><strong>IP:</strong> {contract.signedIp || 'N/A'}</p>
                <p><strong>Token semnat:</strong> <span className="font-mono text-xs">{contract.signedToken || 'N/A'}</span></p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Puteți închide această pagină. Contractul semnat va fi procesat de echipa noastră.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Semnare Contract</h1>
          <p className="text-gray-600">Vă rugăm să verificați contractul și să-l semnați digital</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Detalii Contract
                </div>
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Previzualizare
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Previzualizare Contract</DialogTitle>
                      <DialogDescription>
                        Conținutul complet al contractului pentru semnare
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-6 bg-white border rounded-lg">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: contract.template?.content?.replace(/{{[^}]+}}/g, (match) => {
                            const field = match.slice(2, -2).trim();
                            switch (field) {
                              case 'orderNumber':
                                return contract.orderNumber?.toString() || '';
                              case 'currentDate':
                                return new Date().toLocaleDateString('ro-RO');
                              case 'beneficiary.name':
                                return contract.beneficiary?.name || '';
                              case 'beneficiary.address':
                                return contract.beneficiary?.address || '';
                              case 'beneficiary.cnp':
                                return contract.beneficiary?.cnp || '';
                              case 'beneficiary.companyName':
                                return contract.beneficiary?.companyName || '';
                              case 'beneficiary.companyCui':
                                return contract.beneficiary?.companyCui || '';
                              case 'contract.value':
                                return contract.value || '';
                              case 'contract.currency':
                                return contract.currency || '';
                              case 'contract.startDate':
                                return contract.startDate ? new Date(contract.startDate).toLocaleDateString('ro-RO') : '';
                              case 'contract.endDate':
                                return contract.endDate ? new Date(contract.endDate).toLocaleDateString('ro-RO') : '';
                              case 'contract.notes':
                                return contract.notes || '';
                              case 'provider.name':
                                return contract.provider?.name || '';
                              case 'provider.address':
                                return contract.provider?.address || '';
                              case 'provider.cui':
                                return contract.provider?.cui || '';
                              case 'provider.registrationNumber':
                                return contract.provider?.registrationNumber || '';
                              case 'provider.legalRepresentative':
                                return contract.provider?.legalRepresentative || '';
                              case 'provider.phone':
                                return contract.provider?.phone || '';
                              case 'provider.email':
                                return contract.provider?.email || '';
                              default:
                                return match;
                            }
                          }) || '' 
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Numărul contractului</Label>
                  <p className="text-lg font-semibold">{contract.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Data creării</Label>
                  <p className="text-lg">{contract.createdAt ? new Date(contract.createdAt).toLocaleDateString('ro-RO') : 'N/A'}</p>
                </div>
              </div>

              {contract.value && (
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Valoare</Label>
                    <p className="text-lg font-semibold">{contract.value} {contract.currency}</p>
                  </div>
                </div>
              )}

              {(contract.startDate || contract.endDate) && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Perioada</Label>
                    <p className="text-lg">
                      {contract.startDate && new Date(contract.startDate).toLocaleDateString('ro-RO')} - {' '}
                      {contract.endDate && new Date(contract.endDate).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
              )}

              {/* Beneficiary Information */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-3">
                  {contract.beneficiary?.isCompany ? (
                    <Building className="h-4 w-4 text-gray-500 mr-2" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                  )}
                  <Label className="text-sm font-medium text-gray-500">
                    {contract.beneficiary?.isCompany ? "Companie" : "Persoană Fizică"}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">{contract.beneficiary?.name}</p>
                  {contract.beneficiary?.email && (
                    <p className="text-sm text-gray-600">{contract.beneficiary.email}</p>
                  )}
                  {contract.beneficiary?.isCompany && contract.beneficiary.companyLegalRepresentative && (
                    <p className="text-sm text-gray-600">
                      <strong>Reprezentant legal:</strong> {contract.beneficiary.companyLegalRepresentative}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signing Form */}
          <Card>
            <CardHeader>
              <CardTitle>Semnare Digitală</CardTitle>
              <CardDescription>
                Completați informațiile de mai jos pentru a semna contractul
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="signedBy">Numele persoanei care semnează *</Label>
                  <Input
                    id="signedBy"
                    {...form.register("signedBy")}
                    placeholder="Introduceți numele complet"
                    className="mt-1"
                  />
                  {form.formState.errors.signedBy && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.signedBy.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {contract.beneficiary?.isCompany 
                      ? "Pentru companii, introduceți numele reprezentantului legal"
                      : "Introduceți numele dumneavoastră complet"
                    }
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="agreed"
                      checked={form.watch("agreed")}
                      onCheckedChange={(checked) => form.setValue("agreed", !!checked)}
                    />
                    <div>
                      <Label htmlFor="agreed" className="text-sm leading-5">
                        Confirm că am citit și înțeles termenii contractului și sunt de acord cu toate clauzele stipulate. 
                        Prin semnarea acestui contract, mă angajez să respect toate obligațiile prevăzute.
                      </Label>
                      {form.formState.errors.agreed && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.agreed.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !form.watch("agreed")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Se semnează contractul...
                    </>
                  ) : (
                    "Semnează Contractul"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}