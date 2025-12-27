import { createRoot } from "react-dom/client";
import 'react-dom'; // Ensure react-dom evaluated early (defensive)
import App from "./App";
import "./index.css";
import { initGlobalErrorReporting } from "./lib/errorHooks";
import { initClientMonitoring } from "./lib/monitoring";
import { probeReact } from "./lib/reactProbe";
import { BUILD_INFO } from "./build-info";

// Initialize optional monitoring first (no-op if not configured)
initClientMonitoring();
// Initialize global error reporting as early as possible
initGlobalErrorReporting();

// Probe React identity/version early
probeReact('main.tsx start (pre-render)');

// Capture dispatcher state immediately before render
const beforeRenderMark = performance.now();

const rootEl = document.getElementById("root");
if (!rootEl) {
	throw new Error('Root element #root not found');
}

const root = createRoot(rootEl);
root.render(<App />);

// Use microtask + raf to inspect dispatcher after React commits
queueMicrotask(() => {
	probeReact('main.tsx microtask after render');
	requestAnimationFrame(() => {
		probeReact('main.tsx RAF after render');
	});
});
