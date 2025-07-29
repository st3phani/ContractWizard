import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Eye, Trash2, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function EmailTest() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: emailStatus, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/email/test"],
    enabled: isOpen,
  });

  const { data: emailLogs, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/email/logs"],
    enabled: isOpen,
  });

  const clearLogsMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", "/api/email/logs"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/logs"] });
      toast({
        title: "Success",
        description: "Log-urile de email au fost șterse!",
      });
    },
  });

  const handleTest = async () => {
    setIsOpen(true);
    const result = await refetchStatus();
    
    if (result.data?.status === 'ready') {
      toast({
        title: "Success",
        description: "Sistemul de email funcționează corect!",
      });
    } else {
      toast({
        title: "Warning", 
        description: "Sistemul de email are probleme.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchLogs();
  };

  if (!isOpen) {
    return (
      <Button onClick={handleTest} variant="outline" size="sm">
        <Mail className="h-4 w-4 mr-2" />
        Test Email
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Status Email System
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status sistem:</span>
          <Badge variant={emailStatus?.status === 'ready' ? 'default' : 'destructive'}>
            {emailStatus?.status === 'ready' ? 'Funcțional' : 'Eroare'}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {emailStatus?.message || 'Se testează conexiunea...'}
          </p>
          
          {emailStatus?.testingMode && (
            <div className="bg-blue-50 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-800">Mod Dezvoltare Activ:</p>
              <ul className="mt-1 text-blue-700 list-disc list-inside space-y-1">
                <li>Email-urile sunt logged în consolă</li>
                <li>Verifică console-ul pentru detalii complete</li>  
                <li>Log-urile sunt salvate în fișier pentru istoric</li>
              </ul>
            </div>
          )}
        </div>

        {emailLogs?.logs && emailLogs.logs.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Email-uri Trimise ({emailLogs.total})</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearLogsMutation.mutate()}
                disabled={clearLogsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Șterge Log-uri
              </Button>
            </div>
            
            <ScrollArea className="h-64 border rounded-lg p-2">
              <div className="space-y-2">
                {emailLogs.logs.map((log: any, index: number) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{log.subject}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('ro-RO')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Către: {log.to}</p>
                      {log.contract && (
                        <p>Contract: #{log.contract.orderNumber} - {log.contract.template}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">
          Închide
        </Button>
      </CardContent>
    </Card>
  );
}