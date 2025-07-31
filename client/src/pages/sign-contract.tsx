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
import { useDateFormat } from "@/hooks/use-date-format";

const contractSigningSchema = z.object({
  signedBy: z.string().min(1, "Name is required for signing"),
  agreed: z.boolean().refine(val => val === true, "You must agree to the contract terms"),
});

type ContractSigningData = z.infer<typeof contractSigningSchema>;

export default function SignContract() {
  const [, params] = useRoute("/sign-contract/:token");
  const token = params?.token;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signedContract, setSignedContract] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { formatDate } = useDateFormat();

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

  // Function to log contract preview access
  const logPreviewAccess = async () => {
    if (!contract?.id || !token) return;
    
    try {
      await fetch(`/api/contracts/${contract.id}/log-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signingToken: token,
          previewContext: 'Contract Signing Page'
        }),
      });
    } catch (error) {
      console.error('Failed to log preview access:', error);
    }
  };

  // Handle preview open with logging
  const handlePreviewOpen = (open: boolean) => {
    setPreviewOpen(open);
    if (open) {
      logPreviewAccess();
    }
  };

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
    onSuccess: (data) => {
      setSignedContract(data.contract);
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
      if (contract.beneficiary.isCompany && contract.beneficiary.name) {
        defaultName = contract.beneficiary.name;
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
            Invalid signing link. Please check the link received via email.
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
          <span className="text-gray-600">Loading contract...</span>
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
            {fetchError instanceof Error ? fetchError.message : "Contract not found or link has expired."}
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
            <CardTitle className="text-2xl text-green-700">Contract Signed Successfully!</CardTitle>
            <CardDescription>
              The contract has been signed and saved in the system. You will receive an email confirmation.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Contract Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Contract Number:</strong> {(signedContract || contract).orderNumber}</p>
                <p><strong>Template:</strong> {(signedContract || contract).template?.name}</p>
                <p><strong>Signed by:</strong> {(signedContract || contract).signedBy || form.getValues('signedBy')}</p>
                <p><strong>Signing Date:</strong> {formatDate((signedContract || contract).signedAt || new Date())}</p>
                <p><strong>IP:</strong> {(signedContract || contract).signedIp || 'Processing...'}</p>
                <p><strong>Signed Token:</strong> <span className="font-mono text-xs">{(signedContract || contract).signedToken || 'Processing...'}</span></p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              You can close this page. The signed contract will be processed by our team.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Signing</h1>
          <p className="text-gray-600">Please review the contract and sign it digitally</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Contract Details
                </div>
                <Dialog open={previewOpen} onOpenChange={handlePreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Contract Preview</DialogTitle>
                      <DialogDescription>
                        Complete contract content for signing
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-6 bg-white border rounded-lg">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: contract.template?.content?.replace(/{{[^}]+}}/g, (match: string) => {
                            const field = match.slice(2, -2).trim();
                            switch (field) {
                              case 'orderNumber':
                                return contract.orderNumber?.toString() || '';
                              case 'currentDate':
                                return formatDate(new Date());
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
                                return contract.startDate ? formatDate(contract.startDate) : '';
                              case 'contract.endDate':
                                return contract.endDate ? formatDate(contract.endDate) : '';
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
                  <Label className="text-sm font-medium text-gray-500">Contract Number</Label>
                  <p className="text-lg font-semibold">{contract.orderNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Creation Date</Label>
                  <p className="text-lg">{formatDate(contract.createdAt) || 'N/A'}</p>
                </div>
              </div>

              {contract.value && (
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Value</Label>
                    <p className="text-lg font-semibold">{contract.value} {contract.currency}</p>
                  </div>
                </div>
              )}

              {(contract.startDate || contract.endDate) && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Period</Label>
                    <p className="text-lg">
                      {contract.startDate && formatDate(contract.startDate)} - {' '}
                      {contract.endDate && formatDate(contract.endDate)}
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
                    {contract.beneficiary?.isCompany ? "Company" : "Individual"}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">{contract.beneficiary?.name}</p>
                  {contract.beneficiary?.email && (
                    <p className="text-sm text-gray-600">{contract.beneficiary.email}</p>
                  )}
                  {contract.beneficiary?.isCompany && contract.beneficiary.name && (
                    <p className="text-sm text-gray-600">
                      <strong>Legal Representative:</strong> {contract.beneficiary.name}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signing Form */}
          <Card>
            <CardHeader>
              <CardTitle>Digital Signature</CardTitle>
              <CardDescription>
                Complete the information below to sign the contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="signedBy">Name of the person signing *</Label>
                  <Input
                    id="signedBy"
                    {...form.register("signedBy")}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                  {form.formState.errors.signedBy && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.signedBy.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {contract.beneficiary?.isCompany 
                      ? "For companies, enter the name of the legal representative"
                      : "Enter your full name"
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
                        I confirm that I have read and understood the contract terms and agree with all stipulated clauses. 
                        By signing this contract, I commit to comply with all provided obligations.
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
                      Signing contract...
                    </>
                  ) : (
                    "Sign Contract"
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