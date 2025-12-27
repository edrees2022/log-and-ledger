import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const transferSchema = z.object({
  transfer_number: z.string().min(1, "Transfer number is required"),
  from_warehouse_id: z.string().min(1, "Source warehouse is required"),
  to_warehouse_id: z.string().min(1, "Destination warehouse is required"),
  date: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    item_id: z.string().min(1, "Item is required"),
    quantity: z.coerce.number().min(0.0001, "Quantity must be greater than 0"),
    batch_id: z.string().optional(),
  })).min(1, "At least one item is required"),
});

type TransferFormValues = z.infer<typeof transferSchema>;

function TransferItemRow({ index, form, remove, items }: { index: number, form: any, remove: any, items: any[] }) {
  const { t } = useTranslation();
  const itemId = form.watch(`items.${index}.item_id`);
  const selectedItem = items?.find((i: any) => i.id === itemId);
  
  const { data: batches } = useQuery<any[]>({
    queryKey: ["/api/inventory/batches", itemId],
    enabled: !!itemId && selectedItem?.tracking_type === 'batch',
  });

  return (
    <div className="flex gap-4 items-end">
      <FormField
        control={form.control}
        name={`items.${index}.item_id`}
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>{t("items.item", "Item")}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("inventory.selectItem", "Select item")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {items?.map((item: any) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.sku})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedItem?.tracking_type === 'batch' && (
        <FormField
          control={form.control}
          name={`items.${index}.batch_id`}
          render={({ field }) => (
            <FormItem className="w-48">
              <FormLabel>{t("inventory.batch", "Batch")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("inventory.selectBatch", "Select batch")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {batches?.map((batch: any) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.batch_number} ({t("inventory.exp", "Exp")}: {batch.expiry_date ? new Date(batch.expiry_date).toLocaleDateString() : t("common.na", "N/A")})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <FormField
        control={form.control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormItem className="w-32">
            <FormLabel>{t("common.quantity", "Quantity")}</FormLabel>
            <FormControl>
              <Input type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
        className="mb-2"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export default function StockTransferEdit() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/inventory/transfers/edit/:id");
  const transferId = params?.id;
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transfer, isLoading: transferLoading } = useQuery<any>({
    queryKey: [`/api/inventory/transfers/${transferId}`],
    enabled: !!transferId,
  });

  const { data: warehouses } = useQuery<any[]>({
    queryKey: ["/api/inventory/warehouses"],
  });

  const { data: items } = useQuery<any[]>({
    queryKey: ["/api/items"],
  });

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transfer_number: "",
      from_warehouse_id: "",
      to_warehouse_id: "",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      items: [{ item_id: "", quantity: 1 }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load transfer data into form when available
  useEffect(() => {
    if (transfer) {
      form.reset({
        transfer_number: transfer.transfer_number,
        from_warehouse_id: transfer.from_warehouse_id,
        to_warehouse_id: transfer.to_warehouse_id,
        date: new Date(transfer.date).toISOString().split('T')[0],
        notes: transfer.notes || "",
        items: transfer.items.map((item: any) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          batch_id: item.batch_id || undefined,
        })),
      });
    }
  }, [transfer, form]);

  const updateTransfer = useMutation({
    mutationFn: async (data: TransferFormValues) => {
      const res = await apiRequest("PUT", `/api/inventory/transfers/${transferId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/transfers"] });
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/transfers/${transferId}`] });
      toast({
        title: t("inventory.transferUpdated", "Transfer Updated"),
        description: t("inventory.transferUpdatedDescription", "Stock transfer has been updated successfully."),
      });
      setLocation("/inventory/transfers");
    },
    onError: (error: any) => {
      toast({
        title: t("common.error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TransferFormValues) => {
    if (data.from_warehouse_id === data.to_warehouse_id) {
      form.setError("to_warehouse_id", {
        type: "manual",
        message: "Source and destination warehouses must be different",
      });
      return;
    }
    updateTransfer.mutate(data);
  };

  if (transferLoading) {
    return <div className="p-8">{t("common.loading", "Loading...")}</div>;
  }

  if (!transfer) {
    return <div className="p-8">{t("common.notFound", "Transfer not found")}</div>;
  }

  if (transfer.status !== 'draft') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("inventory.cannotEdit", "Cannot Edit")}</h2>
        <p className="text-muted-foreground mb-4">
          {t("inventory.onlyDraftEditable", "Only draft transfers can be edited.")}
        </p>
        <Button onClick={() => setLocation("/inventory/transfers")}>
          {t("common.back", "Back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8 py-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("inventory.editTransfer", "Edit Stock Transfer")}</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          {t("inventory.editTransferDescription", "Modify the stock transfer details")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t("inventory.transferDetails", "Transfer Details")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="transfer_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.transferNumber", "Transfer Number")}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.date", "Date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="from_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.fromWarehouse", "From Warehouse")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("inventory.selectSource", "Select source")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="to_warehouse_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("inventory.toWarehouse", "To Warehouse")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("inventory.selectDestination", "Select destination")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehouses?.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.notes", "Notes")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("common.items", "Items")}</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ item_id: "", quantity: 1 })}
              >
                <Plus className="me-2 h-4 w-4" />
                {t("common.addItem", "Add Item")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <TransferItemRow
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  items={items || []}
                />
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/inventory/transfers")}
              className="w-full sm:w-auto"
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button type="submit" disabled={updateTransfer.isPending} className="w-full sm:w-auto">
              {updateTransfer.isPending ? t("common.saving", "Saving...") : t("common.save", "Save Changes")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
