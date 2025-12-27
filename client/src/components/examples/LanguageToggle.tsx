import { LanguageToggle } from '../LanguageToggle';

export default function LanguageToggleExample() {
  return (
    <div className="p-4 rounded-lg bg-background border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold mb-2">Language Toggle</h3>
          <p className="text-muted-foreground text-sm">
            Switch between 15 supported languages with RTL support
          </p>
        </div>
        <LanguageToggle />
      </div>
    </div>
  );
}
