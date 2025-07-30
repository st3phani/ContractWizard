import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, Download, FileText, User, Building, Calendar, MapPin, Phone, Mail, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useDateFormat } from "@/hooks/use-date-format";
import type { ContractWithDetails } from "@shared/schema";

export default function SignedContractPage() {
  const [match, params] = useRoute("/signed-contract/:token");
  const { token } = params || {};
  const { formatDate } = useDateFormat();

  const { data: contract, isLoading, error } = useQuery<ContractWithDetails>({
    queryKey: ["/api/contracts/signed", token],
    queryFn: async () => {
      if (!token) throw new Error("Token missing");
      const response = await fetch(`/api/contracts/signed/${token}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Contractul semnat nu a fost găsit sau token-ul este invalid");
        }
        throw new Error("Eroare la încărcarea contractului semnat");
      }
      return response.json();
    },
    enabled: !!token,
  });

  const downloadPDF = async () => {
    if (!contract) return;
    
    try {
      const response = await fetch(`/api/contracts/${contract.id}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Use the appropriate filename format for signed contracts
      let filename: string;
      if (contract.status?.statusCode === 'signed' && contract.signedToken) {
        filename = `CTR_${contract.orderNumber}_${contract.signedToken}.pdf`;
      } else {
        filename = `Contract-${contract.orderNumber}.pdf`;
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pagină invalidă. Vă rugăm să verificați link-ul.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă contractul semnat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Contractul nu a fost găsit.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contract Semnat</h1>
                <p className="text-gray-600">Contract #{contract.orderNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {contract.status?.statusLabel || "Semnat"}
              </Badge>
              <Button onClick={downloadPDF} className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="h-4 w-4 mr-2" />
                Descarcă PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contract Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalii Contract
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Număr Contract</p>
                  <p className="text-lg font-semibold">#{contract.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Template</p>
                  <p className="font-medium">{contract.template?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Valoare Contract</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(contract.value, contract.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Creării</p>
                  <p className="font-medium">{formatDate(contract.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Începerii</p>
                  <p className="font-medium">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data Încheierii</p>
                  <p className="font-medium">{formatDate(contract.endDate)}</p>
                </div>
              </div>

              {contract.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Observații</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-md">{contract.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beneficiary Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {contract.beneficiary.isCompany ? (
                  <Building className="h-5 w-5 mr-2" />
                ) : (
                  <User className="h-5 w-5 mr-2" />
                )}
                Beneficiar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Nume</p>
                <p className="text-lg font-semibold">{contract.beneficiary.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </p>
                  <p className="font-medium">{contract.beneficiary.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    Telefon
                  </p>
                  <p className="font-medium">{contract.beneficiary.phone || 'N/A'}</p>
                </div>
              </div>

              {contract.beneficiary.address && (
                <div>
                  <p className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Adresă
                  </p>
                  <p className="font-medium">{contract.beneficiary.address}</p>
                </div>
              )}

              {contract.beneficiary.isCompany ? (
                <div className="space-y-3">
                  <Separator />
                  <p className="text-sm font-medium text-gray-700">Detalii Companie</p>
                  {contract.beneficiary.companyName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Numele Companiei</p>
                      <p className="font-medium">{contract.beneficiary.companyName}</p>
                    </div>
                  )}
                  {contract.beneficiary.companyCui && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">CUI</p>
                      <p className="font-medium">{contract.beneficiary.companyCui}</p>
                    </div>
                  )}
                  {contract.beneficiary.companyLegalRepresentative && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reprezentant Legal</p>
                      <p className="font-medium">{contract.beneficiary.companyLegalRepresentative}</p>
                    </div>
                  )}
                </div>
              ) : (
                contract.beneficiary.cnp && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      CNP
                    </p>
                    <p className="font-medium">{contract.beneficiary.cnp}</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Signing Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                Detalii Semnare
              </CardTitle>
              <CardDescription>
                Informații despre procesul de semnare digitală
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-green-800 font-medium">
                    Contractul a fost semnat cu succes în data de{' '}
                    {contract.signedAt ? new Date(contract.signedAt).toLocaleDateString('ro-RO') : 'N/A'}{' '}
                    la ora{' '}
                    {contract.signedAt ? new Date(contract.signedAt).toLocaleTimeString('ro-RO') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Semnat de</p>
                  <p className="text-lg font-semibold">{contract.signedBy || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data și Ora</p>
                  <p className="font-medium">
                    {contract.signedAt ? (
                      <>
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(contract.signedAt).toLocaleDateString('ro-RO')} {' '}
                        {new Date(contract.signedAt).toLocaleTimeString('ro-RO')}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Adresa IP</p>
                  <p className="font-medium font-mono text-sm">{contract.signedIp || 'N/A'}</p>
                </div>
              </div>

              {contract.signedToken && (
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm font-medium text-gray-500 mb-2">Token Unic Contract Semnat</p>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="font-mono text-sm text-gray-700 break-all">{contract.signedToken}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Acest token unic confirmă autenticitatea contractului semnat și poate fi folosit pentru verificări ulterioare.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Details */}
          {contract.provider && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Prestator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Numele Companiei</p>
                      <p className="text-lg font-semibold">{contract.provider.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        Adresă
                      </p>
                      <p className="font-medium">{contract.provider.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Reprezentant Legal</p>
                      <p className="font-medium">{contract.provider.legalRepresentative}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          Telefon
                        </p>
                        <p className="font-medium">{contract.provider.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </p>
                        <p className="font-medium">{contract.provider.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">CUI</p>
                        <p className="font-medium">{contract.provider.cui}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nr. Înregistrare</p>
                        <p className="font-medium">{contract.provider.registrationNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Acest document a fost generat automat de sistemul Contract Manager.</p>
          <p>Pentru verificări suplimentare, contactați administratorul.</p>
        </div>
      </div>
    </div>
  );
}