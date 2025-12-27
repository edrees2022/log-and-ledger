import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText,
  Check,
  Eye,
  Download,
  Copy,
  Edit2,
  Trash2,
  Star,
  StarOff,
  Lock,
  Unlock,
  Plus,
  Settings,
  Palette,
  Layout,
  Type,
  Image,
  Grid,
  Maximize2,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Building2,
  Briefcase,
  ShoppingBag,
  Wrench,
  Code,
  Heart,
  Layers,
  MoreVertical,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Types
type TemplateCategory = 'professional' | 'modern' | 'creative' | 'minimal' | 'classic' | 'industry';
type TemplateLayout = 'standard' | 'compact' | 'detailed' | 'letterhead';
type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'gray' | 'custom';

interface InvoiceTemplate {
  id: string;
  name: string;
  nameAr: string;
  category: TemplateCategory;
  layout: TemplateLayout;
  thumbnail: string;
  isPremium: boolean;
  isDefault?: boolean;
  isFavorite?: boolean;
  colors: ColorScheme;
  features: string[];
  industry?: string;
}

interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  showWatermark: boolean;
  showPaymentTerms: boolean;
  showNotes: boolean;
  showBankDetails: boolean;
  showSignature: boolean;
  paperSize: 'a4' | 'letter' | 'legal';
  margins: number;
}

interface InvoiceTemplateSelectorProps {
  selectedTemplateId?: string;
  onSelect?: (template: InvoiceTemplate, customization: TemplateCustomization) => void;
  mode?: 'selector' | 'manager';
}

// Template data
const templates: InvoiceTemplate[] = [
  { 
    id: 'professional-1', 
    name: 'Professional Standard', 
    nameAr: 'احترافي قياسي',
    category: 'professional', 
    layout: 'standard',
    thumbnail: '/templates/professional-1.png',
    isPremium: false,
    isDefault: true,
    colors: 'blue',
    features: ['Logo', 'Table', 'Totals', 'Notes']
  },
  { 
    id: 'professional-2', 
    name: 'Business Elite', 
    nameAr: 'أعمال النخبة',
    category: 'professional', 
    layout: 'detailed',
    thumbnail: '/templates/professional-2.png',
    isPremium: true,
    colors: 'gray',
    features: ['Letterhead', 'Multiple Tables', 'Bank Details', 'Signature']
  },
  { 
    id: 'modern-1', 
    name: 'Modern Minimal', 
    nameAr: 'عصري بسيط',
    category: 'modern', 
    layout: 'compact',
    thumbnail: '/templates/modern-1.png',
    isPremium: false,
    colors: 'purple',
    features: ['Clean Design', 'QR Code', 'Mobile Friendly']
  },
  { 
    id: 'modern-2', 
    name: 'Tech Forward', 
    nameAr: 'تقني متقدم',
    category: 'modern', 
    layout: 'standard',
    thumbnail: '/templates/modern-2.png',
    isPremium: true,
    colors: 'green',
    features: ['Gradient Header', 'Progress Bar', 'Digital Signature']
  },
  { 
    id: 'creative-1', 
    name: 'Creative Studio', 
    nameAr: 'استوديو إبداعي',
    category: 'creative', 
    layout: 'detailed',
    thumbnail: '/templates/creative-1.png',
    isPremium: true,
    colors: 'custom',
    features: ['Custom Colors', 'Photo Grid', 'Project Timeline'],
    industry: 'creative'
  },
  { 
    id: 'creative-2', 
    name: 'Artistic Flow', 
    nameAr: 'انسيابية فنية',
    category: 'creative', 
    layout: 'standard',
    thumbnail: '/templates/creative-2.png',
    isPremium: false,
    colors: 'purple',
    features: ['Curved Elements', 'Icon Set', 'Visual Focus']
  },
  { 
    id: 'minimal-1', 
    name: 'Clean & Simple', 
    nameAr: 'نظيف وبسيط',
    category: 'minimal', 
    layout: 'compact',
    thumbnail: '/templates/minimal-1.png',
    isPremium: false,
    colors: 'gray',
    features: ['Minimalist', 'Fast Load', 'Print Optimized']
  },
  { 
    id: 'minimal-2', 
    name: 'White Space', 
    nameAr: 'مساحة بيضاء',
    category: 'minimal', 
    layout: 'standard',
    thumbnail: '/templates/minimal-2.png',
    isPremium: false,
    colors: 'gray',
    features: ['Elegant', 'Typography Focus', 'Light Weight']
  },
  { 
    id: 'classic-1', 
    name: 'Traditional', 
    nameAr: 'تقليدي',
    category: 'classic', 
    layout: 'letterhead',
    thumbnail: '/templates/classic-1.png',
    isPremium: false,
    colors: 'blue',
    features: ['Formal Layout', 'Watermark', 'Official Look']
  },
  { 
    id: 'classic-2', 
    name: 'Corporate Official', 
    nameAr: 'رسمي للشركات',
    category: 'classic', 
    layout: 'detailed',
    thumbnail: '/templates/classic-2.png',
    isPremium: true,
    colors: 'gray',
    features: ['Multi-column', 'Legal Format', 'Audit Trail']
  },
  { 
    id: 'industry-retail', 
    name: 'Retail & POS', 
    nameAr: 'تجزئة ونقطة بيع',
    category: 'industry', 
    layout: 'compact',
    thumbnail: '/templates/industry-retail.png',
    isPremium: false,
    colors: 'green',
    features: ['Receipt Style', 'Barcode', 'Quick Print'],
    industry: 'retail'
  },
  { 
    id: 'industry-service', 
    name: 'Service Business', 
    nameAr: 'أعمال الخدمات',
    category: 'industry', 
    layout: 'standard',
    thumbnail: '/templates/industry-service.png',
    isPremium: true,
    colors: 'blue',
    features: ['Time Tracking', 'Service Categories', 'Project Details'],
    industry: 'service'
  },
  { 
    id: 'industry-construction', 
    name: 'Construction', 
    nameAr: 'البناء والمقاولات',
    category: 'industry', 
    layout: 'detailed',
    thumbnail: '/templates/industry-construction.png',
    isPremium: true,
    colors: 'red',
    features: ['Materials List', 'Labor Breakdown', 'Progress Billing'],
    industry: 'construction'
  },
  { 
    id: 'industry-freelance', 
    name: 'Freelancer', 
    nameAr: 'عمل حر',
    category: 'industry', 
    layout: 'compact',
    thumbnail: '/templates/industry-freelance.png',
    isPremium: false,
    colors: 'purple',
    features: ['Hours/Rate', 'Portfolio Link', 'Payment Options'],
    industry: 'freelance'
  }
];

// Category icons
const categoryIcons: Record<TemplateCategory, React.ElementType> = {
  professional: Briefcase,
  modern: Zap,
  creative: Sparkles,
  minimal: Layout,
  classic: Crown,
  industry: Building2
};

// Industry icons
const industryIcons: Record<string, React.ElementType> = {
  retail: ShoppingBag,
  service: Wrench,
  construction: Building2,
  creative: Sparkles,
  freelance: Code
};

// Color presets
const colorPresets: Record<ColorScheme, { primary: string; secondary: string; accent: string }> = {
  blue: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  green: { primary: '#16a34a', secondary: '#22c55e', accent: '#4ade80' },
  purple: { primary: '#9333ea', secondary: '#a855f7', accent: '#c084fc' },
  red: { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  gray: { primary: '#374151', secondary: '#4b5563', accent: '#6b7280' },
  custom: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' }
};

// Font options
const fontOptions = [
  { value: 'inter', label: 'Inter' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'lato', label: 'Lato' },
  { value: 'opensans', label: 'Open Sans' },
  { value: 'cairo', label: 'Cairo (Arabic)' },
  { value: 'tajawal', label: 'Tajawal (Arabic)' }
];

// Default customization
const defaultCustomization: TemplateCustomization = {
  primaryColor: '#2563eb',
  secondaryColor: '#3b82f6',
  accentColor: '#60a5fa',
  fontFamily: 'inter',
  fontSize: 14,
  showLogo: true,
  logoPosition: 'left',
  showWatermark: false,
  showPaymentTerms: true,
  showNotes: true,
  showBankDetails: true,
  showSignature: true,
  paperSize: 'a4',
  margins: 20
};

export function InvoiceTemplateSelector({ 
  selectedTemplateId,
  onSelect,
  mode = 'selector'
}: InvoiceTemplateSelectorProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const isRTL = i18n.dir() === 'rtl';

  // State
  const [selectedId, setSelectedId] = useState(selectedTemplateId || 'professional-1');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customization, setCustomization] = useState<TemplateCustomization>(defaultCustomization);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>('blue');

  // Get selected template
  const selectedTemplate = useMemo(() => 
    templates.find(t => t.id === selectedId) || templates[0], 
    [selectedId]
  );

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = !searchQuery || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.nameAr.includes(searchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }, []);

  // Apply color scheme
  const applyColorScheme = useCallback((scheme: ColorScheme) => {
    setSelectedColorScheme(scheme);
    const colors = colorPresets[scheme];
    setCustomization(prev => ({
      ...prev,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent
    }));
  }, []);

  // Handle select
  const handleSelect = useCallback(() => {
    onSelect?.(selectedTemplate, customization);
    toast({ title: t('templates.templateApplied') });
  }, [selectedTemplate, customization, onSelect, t, toast]);

  // Template card
  const TemplateCard = ({ template }: { template: InvoiceTemplate }) => {
    const isSelected = template.id === selectedId;
    const isFavorite = favorites.includes(template.id);
    const CategoryIcon = categoryIcons[template.category];
    const IndustryIcon = template.industry ? industryIcons[template.industry] : null;

    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative group",
          isSelected && "ring-2 ring-primary"
        )}
        onClick={() => setSelectedId(template.id)}
      >
        {/* Premium badge */}
        {template.isPremium && (
          <Badge className="absolute top-2 end-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500">
            <Crown className="h-3 w-3 me-1" />
            {t('templates.premium')}
          </Badge>
        )}

        {/* Default badge */}
        {template.isDefault && (
          <Badge variant="outline" className="absolute top-2 start-2 z-10">
            {t('templates.default')}
          </Badge>
        )}

        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 rounded-t-lg overflow-hidden">
          {/* Placeholder for actual thumbnail */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-32 bg-white shadow-lg rounded flex flex-col p-2">
              <div className="h-6 bg-primary/20 rounded mb-2" />
              <div className="flex-1 space-y-1">
                <div className="h-2 bg-muted rounded w-full" />
                <div className="h-2 bg-muted rounded w-3/4" />
                <div className="h-2 bg-muted rounded w-1/2" />
              </div>
              <div className="h-4 bg-muted rounded mt-2" />
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); setPreviewOpen(true); }}
            >
              <Eye className="h-4 w-4 me-1" />
              {t('templates.preview')}
            </Button>
          </div>
        </div>

        {/* Info */}
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-sm">
                {isRTL ? template.nameAr : template.name}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <CategoryIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {t(`templates.categories.${template.category}`)}
                </span>
                {IndustryIcon && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <IndustryIcon className="h-3 w-3 text-muted-foreground" />
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(template.id); }}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-1 mt-2">
            {template.features.slice(0, 3).map(feature => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
            {template.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.features.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 start-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-3 w-3" />
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {t('templates.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('templates.description')}
          </p>
        </div>
        
        {mode === 'selector' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCustomizeOpen(true)}>
              <Palette className="h-4 w-4 me-2" />
              {t('templates.customize')}
            </Button>
            <Button onClick={handleSelect}>
              <Check className="h-4 w-4 me-2" />
              {t('templates.apply')}
            </Button>
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('templates.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TemplateCategory | 'all')}>
          <TabsList>
            <TabsTrigger value="all">{t('templates.all')}</TabsTrigger>
            {Object.entries(categoryIcons).map(([cat, Icon]) => (
              <TabsTrigger key={cat} value={cat} className="gap-1">
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{t(`templates.categories.${cat}`)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Empty state */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t('templates.noTemplates')}</h3>
          <p className="text-muted-foreground">{t('templates.noTemplatesDescription')}</p>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isRTL ? selectedTemplate.nameAr : selectedTemplate.name}
            </DialogTitle>
            <DialogDescription>
              {t('templates.previewDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 bg-muted rounded-lg p-4 overflow-auto">
            {/* Template Preview */}
            <div className="bg-white shadow-lg rounded-lg p-8 min-h-[600px]" style={{ direction: 'ltr' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="w-32 h-12 bg-primary/20 rounded flex items-center justify-center text-primary font-bold">
                    LOGO
                  </div>
                </div>
                <div className="text-end">
                  <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                  <p className="text-muted-foreground">#INV-2024-001</p>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">FROM</p>
                  <p className="font-medium">Your Company Name</p>
                  <p className="text-sm text-muted-foreground">123 Business Street</p>
                  <p className="text-sm text-muted-foreground">City, Country 12345</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">TO</p>
                  <p className="font-medium">Client Company</p>
                  <p className="text-sm text-muted-foreground">456 Client Avenue</p>
                  <p className="text-sm text-muted-foreground">City, Country 67890</p>
                </div>
              </div>

              {/* Table */}
              <table className="w-full mb-8">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-start py-2">Description</th>
                    <th className="text-end py-2">Qty</th>
                    <th className="text-end py-2">Rate</th>
                    <th className="text-end py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3">Service Item 1</td>
                    <td className="text-end">10</td>
                    <td className="text-end">$100.00</td>
                    <td className="text-end">$1,000.00</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">Service Item 2</td>
                    <td className="text-end">5</td>
                    <td className="text-end">$200.00</td>
                    <td className="text-end">$1,000.00</td>
                  </tr>
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>$2,000.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (15%)</span>
                    <span>$300.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">$2,300.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              {t('common.close')}
            </Button>
            <Button onClick={() => { setPreviewOpen(false); handleSelect(); }}>
              <Check className="h-4 w-4 me-2" />
              {t('templates.useTemplate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customize Dialog */}
      <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('templates.customizeTemplate')}
            </DialogTitle>
            <DialogDescription>
              {t('templates.customizeDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="colors" className="mt-4">
            <TabsList className="w-full">
              <TabsTrigger value="colors" className="flex-1">
                <Palette className="h-4 w-4 me-2" />
                {t('templates.colors')}
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex-1">
                <Type className="h-4 w-4 me-2" />
                {t('templates.typography')}
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex-1">
                <Layout className="h-4 w-4 me-2" />
                {t('templates.layout')}
              </TabsTrigger>
              <TabsTrigger value="elements" className="flex-1">
                <Layers className="h-4 w-4 me-2" />
                {t('templates.elements')}
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div>
                <Label>{t('templates.colorScheme')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(Object.keys(colorPresets) as ColorScheme[]).map(scheme => (
                    <Button
                      key={scheme}
                      variant={selectedColorScheme === scheme ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyColorScheme(scheme)}
                      className="gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: colorPresets[scheme].primary }}
                      />
                      {t(`templates.colorSchemes.${scheme}`)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('templates.primaryColor')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={customization.primaryColor}
                      onChange={(e) => setCustomization({ ...customization, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('templates.secondaryColor')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={customization.secondaryColor}
                      onChange={(e) => setCustomization({ ...customization, secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={customization.secondaryColor}
                      onChange={(e) => setCustomization({ ...customization, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t('templates.accentColor')}</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      value={customization.accentColor}
                      onChange={(e) => setCustomization({ ...customization, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-4 mt-4">
              <div>
                <Label>{t('templates.fontFamily')}</Label>
                <Select 
                  value={customization.fontFamily}
                  onValueChange={(v) => setCustomization({ ...customization, fontFamily: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map(font => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.fontSize')}</Label>
                  <span className="text-sm text-muted-foreground">{customization.fontSize}px</span>
                </div>
                <Slider
                  value={[customization.fontSize]}
                  onValueChange={([v]) => setCustomization({ ...customization, fontSize: v })}
                  min={10}
                  max={18}
                  step={1}
                  className="mt-2"
                />
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              <div>
                <Label>{t('templates.paperSize')}</Label>
                <RadioGroup 
                  value={customization.paperSize}
                  onValueChange={(v) => setCustomization({ ...customization, paperSize: v as 'a4' | 'letter' | 'legal' })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="a4" id="a4" />
                    <Label htmlFor="a4">A4</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="letter" id="letter" />
                    <Label htmlFor="letter">Letter</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="legal" id="legal" />
                    <Label htmlFor="legal">Legal</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.margins')}</Label>
                  <span className="text-sm text-muted-foreground">{customization.margins}mm</span>
                </div>
                <Slider
                  value={[customization.margins]}
                  onValueChange={([v]) => setCustomization({ ...customization, margins: v })}
                  min={10}
                  max={40}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>{t('templates.logoPosition')}</Label>
                <RadioGroup 
                  value={customization.logoPosition}
                  onValueChange={(v) => setCustomization({ ...customization, logoPosition: v as 'left' | 'center' | 'right' })}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="left" id="logo-left" />
                    <Label htmlFor="logo-left">{t('templates.left')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="logo-center" />
                    <Label htmlFor="logo-center">{t('templates.center')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="right" id="logo-right" />
                    <Label htmlFor="logo-right">{t('templates.right')}</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>

            {/* Elements Tab */}
            <TabsContent value="elements" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showLogo')}</Label>
                  <Switch 
                    checked={customization.showLogo}
                    onCheckedChange={(v) => setCustomization({ ...customization, showLogo: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showWatermark')}</Label>
                  <Switch 
                    checked={customization.showWatermark}
                    onCheckedChange={(v) => setCustomization({ ...customization, showWatermark: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showPaymentTerms')}</Label>
                  <Switch 
                    checked={customization.showPaymentTerms}
                    onCheckedChange={(v) => setCustomization({ ...customization, showPaymentTerms: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showNotes')}</Label>
                  <Switch 
                    checked={customization.showNotes}
                    onCheckedChange={(v) => setCustomization({ ...customization, showNotes: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showBankDetails')}</Label>
                  <Switch 
                    checked={customization.showBankDetails}
                    onCheckedChange={(v) => setCustomization({ ...customization, showBankDetails: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>{t('templates.showSignature')}</Label>
                  <Switch 
                    checked={customization.showSignature}
                    onCheckedChange={(v) => setCustomization({ ...customization, showSignature: v })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomization(defaultCustomization)}>
              {t('templates.resetDefaults')}
            </Button>
            <Button onClick={() => { setCustomizeOpen(false); toast({ title: t('templates.customizationSaved') }); }}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InvoiceTemplateSelector;
