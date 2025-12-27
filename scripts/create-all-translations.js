#!/usr/bin/env node
/**
 * Script to automatically copy English translation file to all language folders
 * This creates a base template that can be translated later
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../client/src/locales');
const enPath = path.join(localesDir, 'en/translation.json');

// Read English template
const enTranslations = fs.readFileSync(enPath, 'utf8');

// Languages to create (excluding English and Arabic which are already done)
const languages = [
  'fr', 'es', 'de', 'zh', 'ja', 'ko', 'ru', 'hi', 'ur',
  'tl', 'bn', 'ms', 'tr', 'pt', 'id'
];

console.log('🌍 Creating translation files for all languages...\n');

languages.forEach(lang => {
  const langDir = path.join(localesDir, lang);
  const langPath = path.join(langDir, 'translation.json');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  // Copy English file
  fs.writeFileSync(langPath, enTranslations);
  
  console.log(`✅ Created: ${lang}/translation.json`);
});

console.log(`\n🎉 Successfully created ${languages.length} translation files!`);
console.log('📝 Next step: Translate the values in each file to the target language');
console.log('💡 Keep the keys in English, only translate the values\n');
