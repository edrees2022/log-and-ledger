import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  MessageCircle,
  Bell,
  BellOff,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  FolderOpen,
  Link,
  Send,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Calendar,
  Activity,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit2,
  Trash2,
  Share2,
  Pin,
  PinOff,
  Star,
  StarOff,
  AtSign,
  Hash,
  Paperclip,
  Image,
  Video,
  Smile,
  Settings,
  Lock,
  Unlock,
  Crown,
  Shield,
  UserCog,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Types
type UserRole = 'owner' | 'admin' | 'accountant' | 'viewer';
type UserStatus = 'online' | 'away' | 'busy' | 'offline';
type ActivityType = 'comment' | 'mention' | 'update' | 'approval' | 'share' | 'task';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastActive: Date;
  department?: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  documentId?: string;
  documentType?: string;
  documentNumber?: string;
  mentions: string[];
  reactions: { emoji: string; users: string[] }[];
  replies?: Comment[];
  pinned?: boolean;
}

interface TeamActivity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  description: string;
  timestamp: Date;
  metadata?: {
    documentType?: string;
    documentNumber?: string;
    amount?: number;
    status?: string;
  };
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  assigneeName: string;
  createdById: string;
  createdByName: string;
  dueDate?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  documentRef?: {
    type: string;
    id: string;
    number: string;
  };
  createdAt: Date;
}

// Role config
const roleConfig: Record<UserRole, { label: string; color: string; icon: React.ElementType }> = {
  owner: { label: 'team.roles.owner', color: 'yellow', icon: Crown },
  admin: { label: 'team.roles.admin', color: 'purple', icon: Shield },
  accountant: { label: 'team.roles.accountant', color: 'blue', icon: UserCog },
  viewer: { label: 'team.roles.viewer', color: 'gray', icon: Eye },
};

// Status config
const statusConfig: Record<UserStatus, { label: string; color: string }> = {
  online: { label: 'متصل', color: 'green' },
  away: { label: 'بعيد', color: 'yellow' },
  busy: { label: 'مشغول', color: 'red' },
  offline: { label: 'غير متصل', color: 'gray' },
};

// Sample data
const sampleTeamMembers: TeamMember[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@company.com', role: 'owner', status: 'online', lastActive: new Date(), department: 'الإدارة' },
  { id: '2', name: 'فاطمة علي', email: 'fatima@company.com', role: 'admin', status: 'online', lastActive: new Date(), department: 'المحاسبة' },
  { id: '3', name: 'خالد عبدالله', email: 'khaled@company.com', role: 'accountant', status: 'away', lastActive: new Date(Date.now() - 30 * 60000), department: 'المحاسبة' },
  { id: '4', name: 'نورة سعد', email: 'noura@company.com', role: 'accountant', status: 'busy', lastActive: new Date(Date.now() - 60 * 60000), department: 'المراجعة' },
  { id: '5', name: 'محمد عمر', email: 'mohammed@company.com', role: 'viewer', status: 'offline', lastActive: new Date(Date.now() - 24 * 60 * 60000), department: 'المبيعات' },
];

const sampleComments: Comment[] = [
  {
    id: '1',
    userId: '2',
    userName: 'فاطمة علي',
    content: 'تم مراجعة الفاتورة INV-2024-0156 وكل شيء صحيح. @أحمد محمد يرجى الموافقة.',
    timestamp: new Date(Date.now() - 30 * 60000),
    documentType: 'invoice',
    documentNumber: 'INV-2024-0156',
    mentions: ['1'],
    reactions: [{ emoji: '👍', users: ['1', '3'] }],
    pinned: true,
  },
  {
    id: '2',
    userId: '3',
    userName: 'خالد عبدالله',
    content: 'هناك فرق في حساب الضريبة للفاتورة الأخيرة. يرجى المراجعة.',
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    documentType: 'invoice',
    documentNumber: 'INV-2024-0158',
    mentions: [],
    reactions: [],
  },
  {
    id: '3',
    userId: '1',
    userName: 'أحمد محمد',
    content: 'تذكير: يجب إغلاق الحسابات الشهرية قبل نهاية الأسبوع.',
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
    mentions: [],
    reactions: [{ emoji: '✅', users: ['2', '3', '4'] }],
  },
];

const sampleActivities: TeamActivity[] = [
  { id: '1', type: 'approval', userId: '1', userName: 'أحمد محمد', description: 'وافق على الفاتورة', timestamp: new Date(Date.now() - 15 * 60000), metadata: { documentType: 'invoice', documentNumber: 'INV-2024-0156', amount: 25000 } },
  { id: '2', type: 'update', userId: '2', userName: 'فاطمة علي', description: 'حدثت حالة الدفعة', timestamp: new Date(Date.now() - 45 * 60000), metadata: { documentType: 'payment', documentNumber: 'PAY-2024-089', status: 'completed' } },
  { id: '3', type: 'comment', userId: '3', userName: 'خالد عبدالله', description: 'أضاف تعليقاً على', timestamp: new Date(Date.now() - 2 * 60 * 60000), metadata: { documentType: 'bill', documentNumber: 'BILL-2024-045' } },
  { id: '4', type: 'share', userId: '4', userName: 'نورة سعد', description: 'شاركت تقرير المراجعة مع الفريق', timestamp: new Date(Date.now() - 3 * 60 * 60000) },
  { id: '5', type: 'task', userId: '2', userName: 'فاطمة علي', description: 'أكملت مهمة مراجعة الحسابات', timestamp: new Date(Date.now() - 5 * 60 * 60000) },
];

const sampleTasks: Task[] = [
  { id: '1', title: 'مراجعة فواتير الشهر', assigneeId: '2', assigneeName: 'فاطمة علي', createdById: '1', createdByName: 'أحمد محمد', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60000), status: 'in-progress', priority: 'high', createdAt: new Date(Date.now() - 24 * 60 * 60000) },
  { id: '2', title: 'إعداد التقرير المالي الشهري', assigneeId: '3', assigneeName: 'خالد عبدالله', createdById: '1', createdByName: 'أحمد محمد', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60000), status: 'pending', priority: 'high', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000) },
  { id: '3', title: 'تحديث بيانات الموردين', assigneeId: '4', assigneeName: 'نورة سعد', createdById: '2', createdByName: 'فاطمة علي', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60000), status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000) },
  { id: '4', title: 'مطابقة كشوف الحساب البنكي', assigneeId: '2', assigneeName: 'فاطمة علي', createdById: '1', createdByName: 'أحمد محمد', status: 'completed', priority: 'medium', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000) },
];

// Member Card Component
function MemberCard({ member, onMessage }: { member: TeamMember; onMessage: (id: string) => void }) {
  const { t } = useTranslation();
  const roleInfo = roleConfig[member.role];
  const statusInfo = statusConfig[member.status];

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="relative">
        <Avatar className="h-12 w-12">
          {member.avatar ? (
            <AvatarImage src={member.avatar} alt={member.name} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {member.name.slice(0, 2)}
            </AvatarFallback>
          )}
        </Avatar>
        <div 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background bg-${statusInfo.color}-500`}
          title={statusInfo.label}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{member.name}</span>
          <Badge variant="outline" className={`text-xs bg-${roleInfo.color}-50 text-${roleInfo.color}-700`}>
            <roleInfo.icon className="h-3 w-3 ml-1" />
            {t(roleInfo.label)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{member.email}</p>
        {member.department && (
          <p className="text-xs text-muted-foreground">{member.department}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onMessage(member.id)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('team.sendMessage')}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Mail className="h-4 w-4 ml-2" />
              {t('team.sendEmail')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <UserCog className="h-4 w-4 ml-2" />
              {t('team.editRole')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <UserX className="h-4 w-4 ml-2" />
              {t('team.removeFromTeam')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Comment Component
function CommentItem({ comment, onReply, onReact }: { 
  comment: Comment; 
  onReply: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  return (
    <div className={`flex gap-3 ${comment.pinned ? 'bg-yellow-50 -mx-4 px-4 py-3 border-r-4 border-yellow-400' : ''}`}>
      <Avatar className="h-8 w-8 shrink-0">
        {comment.userAvatar ? (
          <AvatarImage src={comment.userAvatar} alt={comment.userName} />
        ) : (
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {comment.userName.slice(0, 2)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium">{comment.userName}</span>
          {comment.pinned && (
            <Badge variant="outline" className="text-xs">
              <Pin className="h-3 w-3 ml-1" />
              مثبت
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(comment.timestamp, { addSuffix: true, locale: dateLocale })}
          </span>
        </div>
        {comment.documentNumber && (
          <Badge variant="secondary" className="text-xs mt-1">
            <FileText className="h-3 w-3 ml-1" />
            {comment.documentNumber}
          </Badge>
        )}
        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
        <div className="flex items-center gap-2 mt-2">
          {comment.reactions.map((reaction, idx) => (
            <button
              key={idx}
              onClick={() => onReact(comment.id, reaction.emoji)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted hover:bg-muted/80 text-sm"
            >
              <span>{reaction.emoji}</span>
              <span className="text-xs text-muted-foreground">{reaction.users.length}</span>
            </button>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => onReply(comment.id)}>
            <MessageCircle className="h-3 w-3 ml-1" />
            رد
          </Button>
        </div>
      </div>
    </div>
  );
}

// Task Item Component
function TaskItem({ task, onStatusChange }: { task: Task; onStatusChange: (id: string, status: Task['status']) => void }) {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    pending: Clock,
    'in-progress': Activity,
    completed: CheckCircle,
    cancelled: XCircle,
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow">
      <Button
        variant="ghost"
        size="icon"
        className={`shrink-0 ${task.status === 'completed' ? 'text-green-600' : 'text-muted-foreground'}`}
        onClick={() => onStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
      >
        <StatusIcon className="h-5 w-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </span>
          <Badge variant="outline" className={priorityColors[task.priority]}>
            {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {task.assigneeName}
          </span>
          {task.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(task.dueDate, 'dd MMM', { locale: dateLocale })}
            </span>
          )}
          {task.documentRef && (
            <Badge variant="secondary" className="text-xs">
              {task.documentRef.number}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeamCollaboration() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';
  const dateLocale = isRTL ? ar : enUS;

  // State
  const [activeTab, setActiveTab] = useState('team');
  const [members] = useState<TeamMember[]>(sampleTeamMembers);
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [activities] = useState<TeamActivity[]>(sampleActivities);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const online = members.filter(m => m.status === 'online').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    
    return { online, total: members.length, pendingTasks, completedTasks };
  }, [members, tasks]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.department?.toLowerCase().includes(query)
    );
  }, [members, searchQuery]);

  // Handlers
  const handleSendComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'أحمد محمد',
      content: newComment,
      timestamp: new Date(),
      mentions: [],
      reactions: [],
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment('');
    toast({
      title: t('team.commentSent'),
      description: t('team.commentSentDesc'),
    });
  };

  const handleReact = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        const existing = c.reactions.find(r => r.emoji === emoji);
        if (existing) {
          if (existing.users.includes('1')) {
            return {
              ...c,
              reactions: c.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: r.users.filter(u => u !== '1') }
                  : r
              ).filter(r => r.users.length > 0)
            };
          } else {
            return {
              ...c,
              reactions: c.reactions.map(r => 
                r.emoji === emoji 
                  ? { ...r, users: [...r.users, '1'] }
                  : r
              )
            };
          }
        } else {
          return {
            ...c,
            reactions: [...c.reactions, { emoji, users: ['1'] }]
          };
        }
      }
      return c;
    }));
  };

  const handleTaskStatusChange = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status } : t
    ));
    toast({
      title: t('team.taskUpdated'),
      description: status === 'completed' ? t('team.taskCompleted') : t('team.taskPending'),
    });
  };

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {t('team.title', 'تعاون الفريق')}
          </h2>
          <p className="text-muted-foreground mt-1">
            {t('team.subtitle', 'التواصل والتعاون مع أعضاء الفريق')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsInviteOpen(true)}>
            <UserPlus className="h-4 w-4 ml-2" />
            {t('team.invite', 'دعوة عضو')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.online}</p>
                <p className="text-xs text-muted-foreground">{t('team.online')}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('team.totalMembers')}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">{t('team.pendingTasks')}</p>
              </div>
              <div className="p-2 rounded-full bg-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">{t('team.completedTasks')}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('team.tabs.team', 'الفريق')}
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('team.tabs.comments', 'التعليقات')}
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            {t('team.tabs.activity', 'النشاط')}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t('team.tabs.tasks', 'المهام')}
          </TabsTrigger>
        </TabsList>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t('team.searchMembers')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredMembers.map(member => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onMessage={(id) => console.log('Message to:', id)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Tab */}
        <TabsContent value="comments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('team.comments.title', 'المحادثات')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* New Comment */}
              <div className="flex gap-3 mb-6">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">أم</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder={t('team.comments.placeholder', 'اكتب تعليقاً... استخدم @ لذكر شخص')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <AtSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleSendComment} disabled={!newComment.trim()}>
                      <Send className="h-4 w-4 ml-2" />
                      {t('team.comments.send', 'إرسال')}
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Comments List */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-6">
                  {comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onReply={(id) => console.log('Reply to:', id)}
                      onReact={handleReact}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('team.activity.title', 'سجل النشاط')}
              </CardTitle>
              <CardDescription>{t('team.activity.subtitle', 'آخر أنشطة أعضاء الفريق')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50">
                      <Avatar className="h-8 w-8 shrink-0">
                        {activity.userAvatar ? (
                          <AvatarImage src={activity.userAvatar} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {activity.userName.slice(0, 2)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.userName}</span>
                          {' '}
                          <span className="text-muted-foreground">{activity.description}</span>
                          {activity.metadata?.documentNumber && (
                            <Badge variant="secondary" className="mr-1 text-xs">
                              {activity.metadata.documentNumber}
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: dateLocale })}
                        </p>
                      </div>
                      {activity.metadata?.amount && (
                        <Badge variant="outline" className="shrink-0">
                          {activity.metadata.amount.toLocaleString()} ر.س
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {t('team.tasks.title', 'المهام')}
                  </CardTitle>
                  <CardDescription>{t('team.tasks.subtitle', 'إدارة مهام الفريق')}</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  {t('team.tasks.add', 'إضافة مهمة')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('team.invite.title', 'دعوة عضو جديد')}</DialogTitle>
            <DialogDescription>{t('team.invite.subtitle', 'أرسل دعوة للانضمام إلى الفريق')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('team.role')}</Label>
              <Select defaultValue="viewer">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {t(config.label)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t('team.invite.message', 'رسالة (اختياري)')}</Label>
              <Textarea id="message" placeholder={t('team.invite.messagePlaceholder')} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={() => {
              toast({
                title: t('team.invite.sent'),
                description: t('team.invite.sentDesc'),
              });
              setIsInviteOpen(false);
            }}>
              <Send className="h-4 w-4 ml-2" />
              {t('team.invite.send', 'إرسال الدعوة')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamCollaboration;
