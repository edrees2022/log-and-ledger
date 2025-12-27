import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full border rounded-lg overflow-hidden">
        <AppSidebar />
        <div className="flex-1 p-4 bg-background">
          <h3 className="font-semibold mb-2">App Sidebar</h3>
          <p className="text-muted-foreground text-sm">
            Collapsible sidebar with company switcher, navigation menu, and sync status
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}
