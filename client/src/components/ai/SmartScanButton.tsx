import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ScanLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTranslation } from "react-i18next";

interface SmartScanButtonProps {
  onScanComplete: (data: any) => void;
  documentType: 'invoice' | 'bill' | 'receipt' | 'check' | 'contact' | 'item';
  className?: string;
}

export function SmartScanButton({ onScanComplete, documentType, className }: SmartScanButtonProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        
        // Call the generic AI extraction endpoint
        const res = await apiRequest("POST", "/api/ai/extract/document", { 
          image: base64,
          type: documentType
        });
        
        const responseData = await res.json();
        
        if (responseData.ok && responseData.data) {
          onScanComplete(responseData.data);
          toast({
            title: t("common.success"),
            description: t("ai.scanSuccess", "Document scanned successfully"),
          });
        } else {
          throw new Error(responseData.error || "Failed to extract data");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message || t("ai.scanError", "Failed to scan document"),
      });
    } finally {
      setIsScanning(false);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*,.pdf"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        onChange={handleFileUpload}
        disabled={isScanning}
        title={t("ai.scanTooltip", "Upload Image or PDF to Scan")}
      />
      <Button variant="outline" disabled={isScanning} className="w-full">
        {isScanning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <ScanLine className="mr-2 h-4 w-4" />
        )}
        {isScanning ? t("common.scanning", "Scanning...") : t("ai.smartScan", "Smart Scan (AI)")}
      </Button>
    </div>
  );
}
