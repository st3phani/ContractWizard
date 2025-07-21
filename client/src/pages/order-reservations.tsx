import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Calendar, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";

interface ReservedOrderNumber {
  id: number;
  orderNumber: number;
  reservedAt: string;
  isUsed: boolean;
  contractId?: number;
}

export default function OrderReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderNumber, setOrderNumber] = useState<string>("");

  // Fetch reserved order numbers
  const { data: reservedNumbers = [], isLoading } = useQuery({
    queryKey: ["/api/reserved-order-numbers"],
  });

  // Fetch next available order number
  const { data: nextAvailable } = useQuery({
    queryKey: ["/api/next-available-order-number"],
  });

  // Reserve order number mutation
  const reserveNumberMutation = useMutation({
    mutationFn: (data: { orderNumber: number }) =>
      apiRequest("/api/reserved-order-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reserved-order-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/next-available-order-number"] });
      setOrderNumber("");
      toast({
        description: "Numărul de ordine a fost rezervat cu succes",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        description: error.message || "Eroare la rezervarea numărului",
      });
    },
  });

  const handleReserveNumber = () => {
    const num = parseInt(orderNumber);
    if (!num || num <= 0) {
      toast({
        variant: "destructive",
        description: "Introduceți un număr valid mai mare ca 0",
      });
      return;
    }

    reserveNumberMutation.mutate({ orderNumber: num });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Rezervare Numere Ordine</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Rezervați numere de ordine pentru contracte viitoare
                </p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Reserve new order number */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Rezervă Număr Nou
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Numărul de Ordine</Label>
                    <Input
                      id="orderNumber"
                      type="number"
                      placeholder="Introduceți numărul de ordine"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      min="1"
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Următorul număr disponibil:</strong> {nextAvailable?.orderNumber || "Se încarcă..."}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Numerele rezervate vor fi sărite automat la crearea contractelor
                    </p>
                  </div>

                  <Button 
                    onClick={handleReserveNumber}
                    disabled={reserveNumberMutation.isPending || !orderNumber}
                    className="w-full"
                  >
                    {reserveNumberMutation.isPending ? "Se rezervă..." : "Rezervă Numărul"}
                  </Button>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistici Rezervare</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total rezervate:</span>
                      <Badge variant="secondary">{reservedNumbers.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Utilizate:</span>
                      <Badge variant="default">
                        {reservedNumbers.filter((r: ReservedOrderNumber) => r.isUsed).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disponibile:</span>
                      <Badge variant="outline">
                        {reservedNumbers.filter((r: ReservedOrderNumber) => !r.isUsed).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reserved numbers table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Numere Rezervate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Se încarcă...</div>
                ) : reservedNumbers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nu există numere rezervate
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Număr Ordine</TableHead>
                        <TableHead>Data Rezervării</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Contract ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservedNumbers.map((reserved: ReservedOrderNumber) => (
                        <TableRow key={reserved.id}>
                          <TableCell className="font-medium">#{reserved.orderNumber}</TableCell>
                          <TableCell>{formatDate(reserved.reservedAt)}</TableCell>
                          <TableCell>
                            {reserved.isUsed ? (
                              <Badge variant="default" className="flex items-center gap-1 w-fit">
                                <CheckCircle className="h-3 w-3" />
                                Utilizat
                              </Badge>
                            ) : (
                              <Badge variant="outline">Rezervat</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {reserved.contractId ? `#${reserved.contractId}` : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}