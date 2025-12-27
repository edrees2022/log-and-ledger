
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to recursively find files
function findFiles(dir: string, extension: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        findFiles(filePath, extension, fileList);
      }
    } else {
      if (filePath.endsWith(extension)) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

// 1. Scan Frontend for API Calls
console.log("🔍 Scanning Frontend for API calls...");
const clientFiles = findFiles(path.join(rootDir, 'client', 'src'), '.tsx');
clientFiles.push(...findFiles(path.join(rootDir, 'client', 'src'), '.ts'));

const apiCalls: { method: string, url: string, file: string }[] = [];
const apiCallRegex = /apiRequest\s*\(\s*["'](GET|POST|PUT|PATCH|DELETE)["']\s*,\s*["']([^"']+)["']/g;
// Also catch template literals if simple
const apiCallRegexTemplate = /apiRequest\s*\(\s*["'](GET|POST|PUT|PATCH|DELETE)["']\s*,\s*`([^`]+)`/g;

clientFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = apiCallRegex.exec(content)) !== null) {
    apiCalls.push({ method: match[1], url: match[2], file: path.relative(rootDir, file) });
  }
  while ((match = apiCallRegexTemplate.exec(content)) !== null) {
    // For template literals, we just take the static part before ${
    const url = match[2].split('${')[0]; 
    apiCalls.push({ method: match[1], url: url + '*', file: path.relative(rootDir, file) });
  }
});

console.log(`✅ Found ${apiCalls.length} API calls in frontend.`);

// 2. Scan Backend for Routes
console.log("🔍 Scanning Backend for Routes...");
const serverFiles = findFiles(path.join(rootDir, 'server', 'routes'), '.ts');

const definedRoutes: { method: string, url: string, file: string }[] = [];
// Regex to find router.get("/path", ...
const routeRegex = /router\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/g;

serverFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  // Determine base path from filename (heuristic)
  // e.g. server/routes/invoices.ts -> /api/invoices
  const baseName = path.basename(file, '.ts');
  const basePath = baseName === 'index' ? '/api' : `/api/${baseName}`;

  let match;
  while ((match = routeRegex.exec(content)) !== null) {
    let routePath = match[2];
    if (routePath === '/') routePath = '';
    const fullPath = `${basePath}${routePath}`;
    definedRoutes.push({ method: match[1].toUpperCase(), url: fullPath, file: path.relative(rootDir, file) });
  }
});

console.log(`✅ Found ${definedRoutes.length} defined routes in backend.`);

// 3. Compare
console.log("\n📊 Analysis Results:");
console.log("--------------------------------------------------");

const missingRoutes: any[] = [];

apiCalls.forEach(call => {
  // Simple matching logic
  const isMatch = definedRoutes.some(route => {
    if (call.method !== route.method) return false;
    
    // Handle wildcards from template literals
    if (call.url.endsWith('*')) {
      const staticPart = call.url.slice(0, -1);
      return route.url.startsWith(staticPart);
    }

    // Handle route params in definition (e.g. /:id)
    // If call is /api/invoices/123 and route is /api/invoices/:id
    const routeParts = route.url.split('/');
    const callParts = call.url.split('/');
    
    if (routeParts.length !== callParts.length) return false;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) continue; // Wildcard match
      if (routeParts[i] !== callParts[i]) return false;
    }
    return true;
  });

  if (!isMatch) {
    missingRoutes.push(call);
  }
});

if (missingRoutes.length === 0) {
  console.log("🎉 SUCCESS: All frontend API calls have matching backend routes!");
} else {
  console.log(`⚠️ WARNING: ${missingRoutes.length} frontend API calls might be missing backend routes:`);
  missingRoutes.forEach(m => {
    console.log(`  - ${m.method} ${m.url} (in ${m.file})`);
  });
}

console.log("\n--------------------------------------------------");
console.log("💡 Note: This is a static analysis. Dynamic URLs might report false positives.");
