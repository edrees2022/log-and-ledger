import re

file_path = 'client/src/pages/reports/InventoryPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Replace the static schema with base schema (for type inference)
old_schema_pattern = r"const inventoryItemSchema = z\.object\(\{[\s\S]*?\}\);"
new_base_schema = """const inventoryItemSchemaBase = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.string(),
  reorderPoint: z.string(),
  reorderQuantity: z.string(),
  unitCost: z.string(),
  unitPrice: z.string(),
  location: z.string().optional(),
});"""

content = re.sub(old_schema_pattern, new_base_schema, content)

# 2. Update type definition
content = content.replace("type InventoryItemForm = z.infer<typeof inventoryItemSchema>;", "type InventoryItemForm = z.infer<typeof inventoryItemSchemaBase>;")

# 3. Insert dynamic schema inside component
# Find "const { t } = useTranslation();"
# Insert schema after it.

dynamic_schema = """
  const inventoryItemSchema = z.object({
    sku: z.string().min(1, t('validation.skuRequired')),
    name: z.string().min(2, t('validation.nameMin')),
    category: z.string().min(1, t('validation.categoryRequired')),
    quantity: z.string().min(1, t('validation.quantityRequired')),
    reorderPoint: z.string().min(1, t('validation.reorderPointRequired')),
    reorderQuantity: z.string().min(1, t('validation.reorderQuantityRequired')),
    unitCost: z.string().min(1, t('validation.unitCostRequired')),
    unitPrice: z.string().min(1, t('validation.unitPriceRequired')),
    location: z.string().optional(),
  });
"""

content = content.replace("const { t } = useTranslation();", "const { t } = useTranslation();" + dynamic_schema)

# 4. Other replacements
replacements = [
    (r"title: 'Error'", "title: t('common.error')"),
    (r"description: error.message \|\| 'Failed to add inventory item'", "description: error.message || t('inventory.failedToAddItem')"),
    (r">Inventory Report<", ">{t('inventory.inventoryReport')}<"),
    (r"Stock levels as of", "{t('inventory.stockLevelsAsOf')}"),
    (r">Export<", ">{t('common.export')}<"), 
    (r">Print<", ">{t('common.print')}<"), 
    (r">Add Item<", ">{t('inventory.addItem')}<"), 
    (r">Location \(Optional\)<", ">{t('inventory.locationOptional')}<"),
    (r">Current Quantity<", ">{t('inventory.currentQuantity')}<"),
    (r">Reorder Point<", ">{t('inventory.reorderPoint')}<"),
    (r">Reorder Quantity<", ">{t('inventory.reorderQuantity')}<"),
    (r">Unit Cost<", ">{t('inventory.unitCost')}<"),
    (r">Low Stock Alert<", ">{t('inventory.lowStockAlert')}<"),
    (r">Items need reorder<", ">{t('inventory.itemsNeedReorder')}<"),
    (r">Unique SKUs<", ">{t('inventory.uniqueSkus')}<"),
    (r">Units in stock<", ">{t('inventory.unitsInStock')}<"),
    (r">Overview<", ">{t('common.overview')}<"),
    (r">Stock Movements<", ">{t('inventory.stockMovements')}<"),
    (r">Valuation<", ">{t('inventory.valuation')}<"),
    (r">Recent Stock Movements<", ">{t('inventory.recentStockMovements')}<"),
    (r">Inventory Valuation Method<", ">{t('inventory.inventoryValuationMethod')}<"),
    (r">First In, First Out<", ">{t('inventory.fifo')}<"),
    (r">Change Method<", ">{t('inventory.changeMethod')}<"),
    (r">Valuation by Category<", ">{t('inventory.valuationByCategory')}<"),
    (r">Items<", ">{t('common.items')}<"),
    (r">Percentage<", ">{t('common.percentage')}<"),
    (r">Total<", ">{t('common.total')}<"),
    (r">Reorder<", ">{t('inventory.reorder')}<"),
    (r">Location<", ">{t('inventory.location')}<"), 
    (r">Quantity<", ">{t('common.quantity')}<"), 
    (r">Total Value<", ">{t('inventory.totalValue')}<"), 
    (r">Actions<", ">{t('common.actions')}<"), 
    (r">Date<", ">{t('common.date')}<"), 
    (r">Type<", ">{t('common.type')}<"), 
    (r">Reference<", ">{t('common.reference')}<"),
    (r"placeholder=\"PRD-001\"", "placeholder={t('inventory.skuPlaceholder') || \"PRD-001\"}"),
    (r"placeholder=\"Enter product name\"", "placeholder={t('inventory.productNamePlaceholder') || \"Enter product name\"}"),
    (r"placeholder={t\('inventory.selectCategory'\)}", "placeholder={t('inventory.selectCategory')}"), # Already correct
    (r"placeholder={t\('inventory.warehousePlaceholder'\)}", "placeholder={t('inventory.warehousePlaceholder')}"), # Already correct
    (r"placeholder=\"0\"", "placeholder=\"0\""), # Numbers are fine
    (r"placeholder=\"50\"", "placeholder=\"50\""),
    (r"placeholder=\"100\"", "placeholder=\"100\""),
    (r"placeholder=\"0.00\"", "placeholder=\"0.00\""),
    (r"{createMutation.isPending \? t\('inventory.addingItem'\) : t\('inventory.addItem'\)}", "{createMutation.isPending ? t('inventory.addingItem') : t('inventory.addItem')}"), # Already correct
]

# Handling statusConfig
status_config_replacement = """const getStatusBadge = (status: string) => {
    const statusConfig = {
      in_stock: { label: t('inventory.inStock'), icon: CheckCircle, color: 'success' },
      low_stock: { label: t('inventory.lowStock'), icon: AlertTriangle, color: 'warning' },
      critical: { label: t('inventory.critical'), icon: AlertTriangle, color: 'destructive' },
      out_of_stock: { label: t('inventory.outOfStock'), icon: AlertTriangle, color: 'destructive' },
      service: { label: t('categories.services'), icon: Package, color: 'secondary' },
    };
"""

content = re.sub(r"const statusConfig = \{[\s\S]*?\};", "", content) # Remove global definition
content = content.replace("const getStatusBadge = (status: string) => {", status_config_replacement)

# Apply replacements
for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w') as f:
    f.write(content)
