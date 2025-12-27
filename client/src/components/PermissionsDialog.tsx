import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Shield, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Permission {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
}

// Available modules in the system
const MODULES = [
  { id: 'dashboard', nameKey: 'common.dashboard' },
  { id: 'accounts', nameKey: 'common.accounts' },
  { id: 'contacts', nameKey: 'common.contacts' },
  { id: 'items', nameKey: 'common.items' },
  { id: 'sales', nameKey: 'common.sales' },
  { id: 'purchases', nameKey: 'common.purchases' },
  { id: 'banking', nameKey: 'common.banking' },
  { id: 'reports', nameKey: 'common.reports' },
  { id: 'settings', nameKey: 'common.settings' },
  { id: 'users', nameKey: 'common.users' },
];

export function PermissionsDialog({ open, onOpenChange, userId, userName }: PermissionsDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [permissions, setPermissions] = useState<Permission[]>([]);

  // Fetch user permissions
  const { data: fetchedPermissions, isLoading } = useQuery<Permission[]>({
    queryKey: [`/api/users/${userId}/permissions`],
    enabled: open && !!userId,
  });

  // Initialize permissions when data is fetched
  useEffect(() => {
    if (fetchedPermissions && Array.isArray(fetchedPermissions)) {
      setPermissions(fetchedPermissions);
    } else if (open) {
      // Initialize with default empty permissions
      setPermissions(
        MODULES.map(module => ({
          module: module.id,
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
        }))
      );
    }
  }, [fetchedPermissions, open]);

  // Update permissions mutation
  const updatePermissionsMutation = useMutation({
    mutationFn: async (permissions: Permission[]) => {
      return await apiRequest('PUT', `/api/users/${userId}/permissions`, { permissions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/permissions`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: t('users.permissionsUpdated'),
        description: t('users.permissionsUpdatedDesc'),
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('users.permissionsUpdateError'),
        variant: 'destructive',
      });
    },
  });

  const handlePermissionChange = (moduleId: string, field: keyof Omit<Permission, 'module'>, value: boolean) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.module === moduleId);
      if (existing) {
        return prev.map(p => 
          p.module === moduleId ? { ...p, [field]: value } : p
        );
      } else {
        return [...prev, { module: moduleId, can_view: false, can_create: false, can_edit: false, can_delete: false, [field]: value }];
      }
    });
  };

  const handleSave = () => {
    updatePermissionsMutation.mutate(permissions);
  };

  const getPermission = (moduleId: string) => {
    return permissions.find(p => p.module === moduleId) || {
      module: moduleId,
      can_view: false,
      can_create: false,
      can_edit: false,
      can_delete: false,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('users.managePermissions')} - {userName}
          </DialogTitle>
          <DialogDescription>
            {t('users.customizeUserPermissions')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('common.loading')}...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t('users.module')}</TableHead>
                  <TableHead className="text-center">{t('users.canView')}</TableHead>
                  <TableHead className="text-center">{t('users.canCreate')}</TableHead>
                  <TableHead className="text-center">{t('users.canEdit')}</TableHead>
                  <TableHead className="text-center">{t('users.canDelete')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODULES.map(module => {
                  const perm = getPermission(module.id);
                  return (
                    <TableRow key={module.id}>
                      <TableCell className="font-medium">{t(module.nameKey)}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.can_view}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.id, 'can_view', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.can_create}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.id, 'can_create', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.can_edit}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.id, 'can_edit', checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perm.can_delete}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(module.id, 'can_delete', checked as boolean)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={updatePermissionsMutation.isPending}>
            <Save className="h-4 w-4 me-2" />
            {t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
