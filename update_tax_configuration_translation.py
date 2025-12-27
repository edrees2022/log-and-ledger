import json
import os

def deep_merge(source, destination):
    for key, value in source.items():
        if isinstance(value, dict):
            node = destination.setdefault(key, {})
            deep_merge(value, node)
        else:
            destination[key] = value
    return destination

def update_translation():
    file_path = "/Users/omar.matouki/TibrCode Apps/log_and_ledger_main/client/src/locales/en/translation.json"
    
    new_keys = {
        "taxes": {
            "vat": "VAT",
            "salesTax": "Sales Tax",
            "corporateTax": "Corporate Tax",
            "withholding": "Withholding",
            "custom": "Custom"
        }
    }
    
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        deep_merge(new_keys, data)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2)
            
        print(f"Updated {file_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_translation()
