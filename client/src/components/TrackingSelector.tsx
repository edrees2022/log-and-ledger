import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, Hash, Calendar, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TrackingSelectorProps {
  mode: 'sales' | 'purchases';
  itemId: string;
  warehouseId?: string;
  trackingType: 'serial' | 'batch';
  quantity: number;
  // For sales - selected items
  selectedSerials?: string[];
  selectedBatchId?: string;
  // For purchases - new items
  newSerialNumbers?: string[];
  newBatchInfo?: { batchNumber?: string; expiryDate?: string };
  // Callbacks
  onSerialsChange?: (serials: string[]) => void;
  onBatchChange?: (batchId: string) => void;
  onNewSerialsChange?: (serials: string[]) => void;
  onNewBatchChange?: (info: { batchNumber: string; expiryDate?: string }) => void;
}

export function TrackingSelector({
  mode,
  itemId,
  warehouseId,
  trackingType,
  quantity,
  selectedSerials = [],
  selectedBatchId,
  newSerialNumbers = [],
  newBatchInfo,
  onSerialsChange,
  onBatchChange,
  onNewSerialsChange,
  onNewBatchChange,
}: TrackingSelectorProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempSerials, setTempSerials] = useState<string[]>([]);
  const [tempBatchId, setTempBatchId] = useState<string>("");
  const [newSerialsText, setNewSerialsText] = useState("");
  const [newBatchNumber, setNewBatchNumber] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("");

  // Fetch available serials for sales
  const { data: availableSerials = [] } = useQuery({
    queryKey: ["/api/inventory/serials", itemId, warehouseId],
    queryFn: async () => {
      const url = warehouseId 
        ? `/api/inventory/serials/${itemId}?warehouse_id=${warehouseId}`
        : `/api/inventory/serials/${itemId}`;
      const res = await apiRequest("GET", url);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: mode === 'sales' && trackingType === 'serial' && !!itemId,
  });

  // Fetch available batches for sales
  const { data: availableBatches = [] } = useQuery({
    queryKey: ["/api/inventory/batches", itemId, warehouseId],
    queryFn: async () => {
      const url = warehouseId 
        ? `/api/inventory/batches/${itemId}?warehouse_id=${warehouseId}`
        : `/api/inventory/batches/${itemId}`;
      const res = await apiRequest("GET", url);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: mode === 'sales' && trackingType === 'batch' && !!itemId,
  });

  useEffect(() => {
    setTempSerials(selectedSerials);
    setTempBatchId(selectedBatchId || "");
  }, [selectedSerials, selectedBatchId]);

  useEffect(() => {
    if (newBatchInfo) {
      setNewBatchNumber(newBatchInfo.batchNumber || "");
      setNewExpiryDate(newBatchInfo.expiryDate || "");
    }
  }, [newBatchInfo]);

  const handleOpenDialog = () => {
    if (mode === 'sales') {
      setTempSerials(selectedSerials);
      setTempBatchId(selectedBatchId || "");
    } else {
      setNewSerialsText(newSerialNumbers.join('\n'));
      setNewBatchNumber(newBatchInfo?.batchNumber || "");
      setNewExpiryDate(newBatchInfo?.expiryDate || "");
    }
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (mode === 'sales') {
      if (trackingType === 'serial') {
        onSerialsChange?.(tempSerials);
      } else {
        onBatchChange?.(tempBatchId);
      }
    } else {
      if (trackingType === 'serial') {
        const serials = newSerialsText.split('\n').map(s => s.trim()).filter(s => s);
        onNewSerialsChange?.(serials);
      } else {
        onNewBatchChange?.({ batchNumber: newBatchNumber, expiryDate: newExpiryDate || undefined });
      }
    }
    setDialogOpen(false);
  };

  const toggleSerial = (serialId: string) => {
    if (tempSerials.includes(serialId)) {
      setTempSerials(tempSerials.filter(s => s !== serialId));
    } else if (tempSerials.length < quantity) {
      setTempSerials([...tempSerials, serialId]);
    }
  };

  // Display summary
  const getSummary = () => {
    if (mode === 'sales') {
      if (trackingType === 'serial') {
        if (selectedSerials.length === 0) {
          return <span className="text-muted-foreground text-xs">{t('inventory.selectSerials', { defaultValue: 'اختر الأرقام التسلسلية' })}</span>;
        }
        return <span className="text-xs">{selectedSerials.length} / {quantity} {t('inventory.selected', { defaultValue: 'محدد' })}</span>;
      } else {
        const batch = availableBatches.find((b: any) => b.id === selectedBatchId);
        if (!batch) {
          return <span className="text-muted-foreground text-xs">{t('inventory.selectBatch', { defaultValue: 'اختر الدفعة' })}</span>;
        }
        return <span className="text-xs">{batch.batch_number}</span>;
      }
    } else {
      if (trackingType === 'serial') {
        if (newSerialNumbers.length === 0) {
          return <span className="text-muted-foreground text-xs">{t('inventory.enterSerials', { defaultValue: 'أدخل الأرقام التسلسلية' })}</span>;
        }
        return <span className="text-xs">{newSerialNumbers.length} {t('inventory.serialsEntered', { defaultValue: 'أرقام مدخلة' })}</span>;
      } else {
        if (!newBatchInfo?.batchNumber) {
          return <span className="text-muted-foreground text-xs">{t('inventory.enterBatch', { defaultValue: 'أدخل بيانات الدفعة' })}</span>;
        }
        return <span className="text-xs">{newBatchInfo.batchNumber}</span>;
      }
    }
  };

  const isValid = () => {
    if (mode === 'sales') {
      if (trackingType === 'serial') {
        return selectedSerials.length === quantity;
      }
      return !!selectedBatchId;
    } else {
      if (trackingType === 'serial') {
        return newSerialNumbers.length === quantity;
      }
      return !!newBatchInfo?.batchNumber;
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={isValid() ? "outline" : "destructive"}
        size="sm"
        onClick={handleOpenDialog}
        className="w-full h-8 text-xs justify-start gap-2"
      >
        {trackingType === 'serial' ? <Hash className="h-3 w-3" /> : <Package className="h-3 w-3" />}
        {getSummary()}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {trackingType === 'serial' ? <Hash className="h-5 w-5" /> : <Package className="h-5 w-5" />}
              {trackingType === 'serial' 
                ? t('inventory.serialNumbers', { defaultValue: 'الأرقام التسلسلية' })
                : t('inventory.batchInfo', { defaultValue: 'بيانات الدفعة' })
              }
            </DialogTitle>
          </DialogHeader>

          {mode === 'sales' && trackingType === 'serial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>{t('inventory.requiredQuantity', { defaultValue: 'الكمية المطلوبة' })}: {quantity}</span>
                <Badge variant={tempSerials.length === quantity ? "default" : "secondary"}>
                  {tempSerials.length} / {quantity}
                </Badge>
              </div>
              
              {availableSerials.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('inventory.noSerialsAvailable', { defaultValue: 'لا توجد أرقام تسلسلية متوفرة لهذا المنتج' })}
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {availableSerials.map((serial: any) => (
                      <div 
                        key={serial.id} 
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => toggleSerial(serial.id)}
                      >
                        <Checkbox 
                          checked={tempSerials.includes(serial.id)}
                          disabled={!tempSerials.includes(serial.id) && tempSerials.length >= quantity}
                        />
                        <span className="font-mono text-sm">{serial.serial_number}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {mode === 'sales' && trackingType === 'batch' && (
            <div className="space-y-4">
              {availableBatches.length === 0 ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('inventory.noBatchesAvailable', { defaultValue: 'لا توجد دفعات متوفرة لهذا المنتج' })}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  <Label>{t('inventory.selectBatch', { defaultValue: 'اختر الدفعة' })}</Label>
                  <Select value={tempBatchId} onValueChange={setTempBatchId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('inventory.selectBatch')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((batch: any) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center gap-2">
                            <span>{batch.batch_number}</span>
                            <Badge variant="outline" className="text-xs">
                              {t('inventory.qty', { defaultValue: 'كمية' })}: {batch.quantity}
                            </Badge>
                            {batch.expiry_date && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(batch.expiry_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {mode === 'purchases' && trackingType === 'serial' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>{t('inventory.requiredQuantity', { defaultValue: 'الكمية المطلوبة' })}: {quantity}</span>
                <Badge variant={newSerialsText.split('\n').filter(s => s.trim()).length === quantity ? "default" : "secondary"}>
                  {newSerialsText.split('\n').filter(s => s.trim()).length} / {quantity}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label>{t('inventory.enterSerialNumbers', { defaultValue: 'أدخل الأرقام التسلسلية (رقم واحد في كل سطر)' })}</Label>
                <textarea
                  className="w-full h-32 p-2 border rounded-md font-mono text-sm resize-none"
                  value={newSerialsText}
                  onChange={(e) => setNewSerialsText(e.target.value)}
                  placeholder="SN-001&#10;SN-002&#10;SN-003"
                />
              </div>

              {newSerialsText.split('\n').filter(s => s.trim()).length !== quantity && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('inventory.serialCountMismatch', { 
                      defaultValue: `يجب إدخال ${quantity} أرقام تسلسلية`,
                      count: quantity
                    })}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {mode === 'purchases' && trackingType === 'batch' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('inventory.batchNumber', { defaultValue: 'رقم الدفعة' })}</Label>
                <Input
                  value={newBatchNumber}
                  onChange={(e) => setNewBatchNumber(e.target.value)}
                  placeholder="BATCH-001"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('inventory.expiryDate', { defaultValue: 'تاريخ الانتهاء' })} ({t('common.optional')})</Label>
                <Input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirm}>
              {t('common.confirm', { defaultValue: 'تأكيد' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
