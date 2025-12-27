import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4 rounded-lg bg-background border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Theme Toggle</h3>
            <p className="text-muted-foreground text-sm">
              Switch between light, dark, and system themes
            </p>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}
