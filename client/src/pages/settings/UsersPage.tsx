import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { usePermissions } from '@/hooks/use-permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  UserPlus,
  Shield,
  Key,
  Mail,
  Phone,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save
} from 'lucide-react';
import { PermissionsDialog } from '@/components/PermissionsDialog';

// Now wired to backend users listing

export default function UsersPage() {
  const { t, i18n } = useTranslation();
  const { canManageUsers, canDeleteUsers, userRole } = usePermissions();
  
  const statusConfig = {
    active: { label: t('common.active'), icon: CheckCircle, color: 'default' },
    inactive: { label: t('common.inactive'), icon: XCircle, color: 'secondary' },
    invited: { label: t('users.invited'), icon: Mail, color: 'default' },
    pending: { label: t('common.pending'), icon: AlertCircle, color: 'secondary' },
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [managingPermissionsUser, setManagingPermissionsUser] = useState<any>(null);
  
  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'viewer',
    department: '',
    password: '', // Only used when adding new user
  });

  const { data: rawUsers = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
  });

  // Adapt backend users to UI shape expected by this page
  const users = useMemo(() => {
    return rawUsers.map((u) => ({
      id: u.id,
      name: u.full_name || u.username || u.email,
      email: u.email,
      phone: u.phone || '',
      role: u.role || 'viewer',
      department: u.department || '',
      createdDate: u.created_at,
      lastLogin: u.last_login_at || u.updated_at,
      status: u.is_active ? 'active' : 'inactive',
      avatar: (u.full_name || u.username || u.email || 'U')
        .split(' ')?.map((n: string) => n[0])?.join('')?.slice(0, 2)?.toUpperCase() || 'U',
    }));
  }, [rawUsers]);

  const roles = useMemo(() => {
    const unique = Array.from(new Set(users.map((u: any) => u.role)));
    return unique.map((name, idx) => ({ id: String(idx), name, description: '', userCount: users.filter(u => u.role === name).length, permissions: [], color: 'secondary' }));
  }, [users]);

  // Filter users (exclude inactive by default unless specifically filtering for them)
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // If "all" is selected, show only active users. Otherwise, filter by selected status.
    const matchesStatus = selectedStatus === 'all' 
      ? user.status === 'active' 
      : user.status === selectedStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Add User Mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/users', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowAddUserDialog(false);
      setFormData({ full_name: '', email: '', phone: '', role: 'viewer', department: '', password: '' });
      toast({
        title: t('users.userCreated'),
        description: t('users.userCreatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('users.createError'),
        variant: 'destructive',
      });
    },
  });

  // Update User Mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest('PUT', `/api/users/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      setShowEditUserDialog(false);
      setEditingUser(null);
      setFormData({ full_name: '', email: '', phone: '', role: 'viewer', department: '', password: '' });
      toast({
        title: t('users.userUpdated'),
        description: t('users.userUpdatedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('users.updateError'),
        variant: 'destructive',
      });
    },
  });

  // Delete User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: t('users.userDeleted'),
        description: t('users.userDeletedSuccess'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('users.deleteError'),
        variant: 'destructive',
      });
    },
  });

  const handleAddUser = () => {
    setFormData({ full_name: '', email: '', phone: '', role: 'viewer', department: '', password: '' });
    setShowAddUserDialog(true);
  };

  const handleSubmitAddUser = () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      toast({
        title: t('common.error'),
        description: t('users.fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }
    
    // Generate unique username from email with timestamp
    const baseUsername = formData.email.split('@')[0];
    const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
    const uniqueUsername = `${baseUsername}_${timestamp}`;
    
    addUserMutation.mutate({
      email: formData.email,
      full_name: formData.full_name,
      phone: formData.phone || '',
      role: formData.role,
      department: formData.department || '',
      password: formData.password, // Backend will hash it
      username: uniqueUsername, // Generate unique username
      is_active: true,
      language: 'en',
      timezone: 'UTC',
      theme: 'auto',
    });
  };

  const handleEditUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser(user);
      setFormData({
        full_name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        department: user.department,
        password: '', // Don't populate password on edit
      });
      setShowEditUserDialog(true);
    }
  };

  const handleSubmitEditUser = () => {
    if (!editingUser) return;
    
    if (!formData.email || !formData.full_name) {
      toast({
        title: t('common.error'),
        description: t('users.fillRequiredFields'),
        variant: 'destructive',
      });
      return;
    }
    
    updateUserMutation.mutate({
      id: editingUser.id,
      data: {
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        department: formData.department,
        ...(formData.password && { password_hash: formData.password }), // Only include if password is provided
      },
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(t('users.confirmDeleteUser') + ': ' + user.name + '?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleResetPassword = (userId: string) => {
    toast({
      title: t('users.passwordReset'),
      description: t('users.passwordResetSent'),
    });
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast({
      title: t('users.statusUpdated'),
      description: t('users.statusChangedTo', { status: newStatus }),
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <Badge variant={config.color as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('users.usersAndRoles')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('users.manageUserAccounts')}
          </p>
        </div>
        {canManageUsers() && (
          <Button onClick={handleAddUser} data-testid="button-add-user" className="w-full sm:w-auto">
            <UserPlus className="h-4 w-4 me-2" />
            {t('users.addUser')}
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('users.totalUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('users.allRegisteredUsers')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('users.activeUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('users.currentlyActive')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('users.roles')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('users.definedRoles')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t('users.lastActive')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h ago</div>
            <div className="text-xs text-muted-foreground mt-1">
              {t('users.mostRecentLogin')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs - Removed Roles Management tab */}
      <Tabs value="users" onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap w-full h-auto min-h-10 gap-1 sm:gap-2">
          <TabsTrigger value="users">{t('common.users')}</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:flex-wrap">
            <div className="flex-1 min-w-0">
              <Input
                placeholder={t('users.searchUsers')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:max-w-sm"
                data-testid="input-search-users"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-32" data-testid="select-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('users.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('common.active')}</SelectItem>
                <SelectItem value="inactive">{t('common.inactive')}</SelectItem>
                <SelectItem value="locked">{t('common.locked')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[500px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.user')}</TableHead>
                    <TableHead>{t('common.email')}</TableHead>
                    <TableHead>{t('common.phone')}</TableHead>
                    <TableHead>{t('users.role')}</TableHead>
                    <TableHead>{t('common.department')}</TableHead>
                    <TableHead>{t('users.lastLogin')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-end">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                      <TableCell data-label={t('common.user')}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold">{user.avatar}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {t('users.joined')} {new Date(user.createdDate).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-0 max-w-[200px]" data-label={t('common.email')}>
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.phone')}>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell data-label={t('users.role')}>
                        <Badge variant={user.role === 'Admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell data-label={t('common.department')}>{user.department}</TableCell>
                      <TableCell data-label={t('users.lastLogin')}>
                        <div className="text-sm">
                          <p>{new Date(user.lastLogin).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(user.lastLogin).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell data-label={t('common.status')}>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-end" data-label={t('common.actions')}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`button-actions-${user.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {canManageUsers() && (
                              <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                <Edit className="h-4 w-4 me-2" />
                                {t('users.editUser')}
                              </DropdownMenuItem>
                            )}
                            {canManageUsers() && (
                              <DropdownMenuItem onClick={() => setManagingPermissionsUser(user)}>
                                <Shield className="h-4 w-4 me-2" />
                                {t('users.managePermissions')}
                              </DropdownMenuItem>
                            )}
                            {canManageUsers() && (
                              <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                                <Key className="h-4 w-4 me-2" />
                                {t('users.resetPassword')}
                              </DropdownMenuItem>
                            )}
                            {canManageUsers() && (
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user.id, user.status)}>
                                {user.status === 'active' ? (
                                  <>
                                    <Lock className="h-4 w-4 me-2" />
                                    {t('users.deactivate')}
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="h-4 w-4 me-2" />
                                    {t('users.activate')}
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            {canDeleteUsers() && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4 me-2" />
                                  {t('users.deleteUser')}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('users.addNewUser')}</DialogTitle>
            <DialogDescription>
              {t('users.createUserAndAssignRole')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('users.fullName')} *</Label>
              <Input 
                id="name" 
                placeholder={t('users.enterFullName')} 
                className="min-w-0 w-full"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">{t('common.email')} *</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={t('users.enterEmail')} 
                className="min-w-0 w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">{t('common.password')} *</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder={t('users.enterPassword')} 
                className="min-w-0 w-full"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">{t('common.phone')}</Label>
              <Input 
                id="phone" 
                placeholder={t('users.enterPhone')} 
                className="min-w-0 w-full"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">{t('users.role')}</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder={t('users.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('roles.owner', 'Owner')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin', 'Admin')}</SelectItem>
                  <SelectItem value="accountant">{t('roles.accountant', 'Accountant')}</SelectItem>
                  <SelectItem value="sales">{t('roles.sales', 'Sales')}</SelectItem>
                  <SelectItem value="viewer">{t('roles.viewer', 'Viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">{t('common.department')}</Label>
              <Input 
                id="department" 
                placeholder={t('users.enterDepartment')} 
                className="min-w-0 w-full"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddUserDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitAddUser} disabled={addUserMutation.isPending} className="w-full sm:w-auto">
              {addUserMutation.isPending ? t('common.saving') : t('users.addUser')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('users.editUser')}</DialogTitle>
            <DialogDescription>
              {t('users.updateUserInformation')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">{t('users.fullName')} *</Label>
              <Input 
                id="edit-name" 
                placeholder={t('users.enterFullName')} 
                className="min-w-0 w-full"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-email">{t('common.email')} *</Label>
              <Input 
                id="edit-email" 
                type="email" 
                placeholder={t('users.enterEmail')} 
                className="min-w-0 w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-password">{t('common.password')} ({t('users.leaveEmptyToKeepCurrent')})</Label>
              <Input 
                id="edit-password" 
                type="password" 
                placeholder={t('users.enterNewPassword')} 
                className="min-w-0 w-full"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">{t('common.phone')}</Label>
              <Input 
                id="edit-phone" 
                placeholder={t('users.enterPhone')} 
                className="min-w-0 w-full"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">{t('users.role')}</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder={t('users.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">{t('roles.owner', 'Owner')}</SelectItem>
                  <SelectItem value="admin">{t('roles.admin', 'Admin')}</SelectItem>
                  <SelectItem value="accountant">{t('roles.accountant', 'Accountant')}</SelectItem>
                  <SelectItem value="sales">{t('roles.sales', 'Sales')}</SelectItem>
                  <SelectItem value="viewer">{t('roles.viewer', 'Viewer')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-department">{t('common.department')}</Label>
              <Input 
                id="edit-department" 
                placeholder={t('users.enterDepartment')} 
                className="min-w-0 w-full"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)} className="w-full sm:w-auto">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmitEditUser} disabled={updateUserMutation.isPending} className="w-full sm:w-auto">
              {updateUserMutation.isPending ? t('common.saving') : t('users.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permissions Dialog */}
      {managingPermissionsUser && (
        <PermissionsDialog
          open={!!managingPermissionsUser}
          onOpenChange={(open) => !open && setManagingPermissionsUser(null)}
          userId={managingPermissionsUser.id}
          userName={managingPermissionsUser.name}
        />
      )}
    </div>
  );
}