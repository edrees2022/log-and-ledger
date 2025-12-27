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
        "ai": {
            "provideTextOrImage": "Please paste text or upload an image.",
            "fileTooLarge": "File is too large (>10MB).",
            "invoiceText": "Invoice text",
            "pasteHere": "Paste recognized text here...",
            "trySample": "Try sample",
            "provider": "AI Provider (optional)",
            "selectProvider": "Select provider",
            "model": "Model (optional)",
            "selectModel": "Select model",
            "enterModel": "Enter model (optional)",
            "plannedMode": "Planned mode",
            "steps": "Steps",
            "providerShort": "Provider",
            "dragDrop": "Drag & drop an image or PDF here, or click to select",
            "selectedFile": "Selected",
            "pages": "Pages (optional)",
            "pagesPlaceholder": "e.g., 1-2,4",
            "pagesHelp": "Specify pages to parse (1-indexed). Ranges and commas supported.",
            "customPrompt": "Custom prompt (optional)",
            "promptPlaceholder": "Guide the extraction with extra instructions",
            "refineWithLLM": "Use LLM refinement for text/PDF",
            "consentNotice": "By enabling AI extraction you agree to send the provided text/image to the selected provider for processing. Redaction is applied to sensitive tokens before LLM refinement. Enable consent to proceed.",
            "consentAgree": "I understand and consent to AI processing.",
            "extractFields": "Extract fields",
            "scanDisclaimer": "Paste text, or upload an image or PDF for AI extraction."
        },
        "common": {
            "hide": "Hide",
            "advanced": "Advanced",
            "unknown": "Unknown"
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
