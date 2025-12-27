import { ThemeProvider } from '../ThemeProvider';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-4 rounded-lg bg-background border">
        <h3 className="font-semibold mb-2">Theme Provider</h3>
        <p className="text-muted-foreground text-sm">
          Manages light/dark theme state with system preference detection
        </p>
      </div>
    </ThemeProvider>
  );
}
