#!/usr/bin/env node
/**
 * Script to sync all language translation files with the Arabic master file
 * This ensures all languages have the same keys structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const localesDir = path.join(__dirname, '../client/src/locales');
const arPath = path.join(localesDir, 'ar/translation.json');

// Read Arabic master file
const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf8'));

// All languages including English
const languages = [
  'en', 'fr', 'es', 'de', 'zh', 'ja', 'ko', 'ru', 'hi', 'ur',
  'tl', 'bn', 'ms', 'tr', 'pt', 'id'
];

console.log('🔄 Syncing all language files with Arabic master...\n');

// Function to recursively merge keys, keeping existing translations
function mergeTranslations(target, source, langCode) {
  const result = {};
  
  // Add all keys from source (Arabic)
  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Nested object - recurse
      result[key] = mergeTranslations(
        target[key] || {},
        source[key],
        langCode
      );
    } else {
      // Keep existing translation or use English key name as placeholder
      if (target && target[key]) {
        result[key] = target[key];
      } else {
        // For new keys, use the key name as placeholder
        result[key] = key;
      }
    }
  }
  
  return result;
}

let totalUpdated = 0;

languages.forEach(lang => {
  const langPath = path.join(localesDir, lang, 'translation.json');
  
  let existingTranslations = {};
  if (fs.existsSync(langPath)) {
    existingTranslations = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  }
  
  // Merge: keep existing translations, add new keys with key name as value
  const merged = mergeTranslations(existingTranslations, arTranslations, lang);
  
  // Write back
  fs.writeFileSync(langPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  
  // Count new keys added
  const oldKeys = JSON.stringify(existingTranslations).length;
  const newKeys = JSON.stringify(merged).length;
  
  if (newKeys > oldKeys) {
    console.log(`✅ Updated: ${lang}/translation.json (added ${Math.round((newKeys - oldKeys) / oldKeys * 100)}% more content)`);
    totalUpdated++;
  } else {
    console.log(`✓ ${lang}/translation.json (already up to date)`);
  }
});

console.log(`\n🎉 Successfully synced ${totalUpdated} translation files!`);
console.log('📝 All languages now have the same key structure as Arabic');
console.log('💡 New keys use key names as placeholders - ready for translation\n');
