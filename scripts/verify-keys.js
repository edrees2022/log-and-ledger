#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ar = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/src/locales/ar/translation.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(__dirname, '../client/src/locales/en/translation.json'), 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? prefix + '.' + key : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const arKeys = getKeys(ar).sort();
const enKeys = getKeys(en).sort();

console.log('📊 Key Statistics:');
console.log('Arabic keys:', arKeys.length);
console.log('English keys:', enKeys.length);
console.log('Match:', arKeys.length === enKeys.length ? '✅ Perfect match!' : '❌ Mismatch');

if (arKeys.length !== enKeys.length) {
  const missingInEn = arKeys.filter(k => !enKeys.includes(k));
  const missingInAr = enKeys.filter(k => !arKeys.includes(k));
  
  if (missingInEn.length > 0) {
    console.log('\n⚠️  Missing in English:', missingInEn.slice(0, 10));
  }
  if (missingInAr.length > 0) {
    console.log('\n⚠️  Missing in Arabic:', missingInAr.slice(0, 10));
  }
}
