import re

file_path = 'client/src/pages/reports/InventoryPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

replacements = [
    (r"Unique SKUs", "{t('inventory.uniqueSkus')}"),
    (r"Units in stock", "{t('inventory.unitsInStock')}"),
    (r"Items need reorder", "{t('inventory.itemsNeedReorder')}"),
    (r">All Categories<", ">{t('common.all')}<"),
    (r">Electronics<", ">{t('categories.electronics')}<"),
    (r">Accessories<", ">{t('categories.accessories')}<"),
    (r">Services<", ">{t('categories.services')}<"),
    (r"data-label=\"Location\"", "data-label={t('inventory.location')}"),
    (r">Reorder<", ">{t('inventory.reorder')}<"),
    (r"data-label=\"Items\"", "data-label={t('common.items')}"),
    (r"data-label=\"Percentage\"", "data-label={t('common.percentage')}"),
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open(file_path, 'w') as f:
    f.write(content)
