import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Upload, 
  Scan, 
  FileText, 
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Check,
  X,
  Loader2,
  Wand2,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FileImage,
  Receipt,
  CreditCard,
  Building2,
  Calendar,
  DollarSign,
  User,
  Hash,
  Mail,
  Phone,
  MapPin,
  Globe,
  Trash2,
  Edit2,
  Copy,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Document types that can be scanned
type DocumentType = 'invoice' | 'receipt' | 'bill' | 'contract' | 'id_card' | 'business_card' | 'other';

interface ExtractedField {
  id: string;
  field: string;
  label: string;
  value: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  isEdited?: boolean;
}

interface ScannedDocument {
  id: string;
  type: DocumentType;
  originalImage: string;
  processedImage?: string;
  extractedFields: ExtractedField[];
  rawText?: string;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface DocumentScannerProps {
  onDocumentProcessed?: (document: ScannedDocument) => void;
  onDataExtracted?: (fields: ExtractedField[]) => void;
  acceptedTypes?: DocumentType[];
  autoProcess?: boolean;
}

// Field icons mapping
const fieldIcons: Record<string, React.ElementType> = {
  vendor_name: Building2,
  vendor_address: MapPin,
  vendor_email: Mail,
  vendor_phone: Phone,
  invoice_number: Hash,
  invoice_date: Calendar,
  due_date: Calendar,
  total_amount: DollarSign,
  subtotal: DollarSign,
  tax_amount: DollarSign,
  tax_rate: Hash,
  customer_name: User,
  customer_email: Mail,
  customer_phone: Phone,
  customer_address: MapPin,
  payment_terms: FileText,
  currency: Globe,
  card_number: CreditCard,
  expiry_date: Calendar,
  name: User,
  email: Mail,
  phone: Phone,
  company: Building2,
  address: MapPin,
  website: Globe,
};

// Document type configurations
const documentTypeConfigs: Record<DocumentType, { 
  icon: React.ElementType; 
  color: string;
  expectedFields: string[];
}> = {
  invoice: {
    icon: FileText,
    color: 'text-blue-500',
    expectedFields: ['vendor_name', 'invoice_number', 'invoice_date', 'due_date', 'total_amount', 'subtotal', 'tax_amount', 'customer_name']
  },
  receipt: {
    icon: Receipt,
    color: 'text-green-500',
    expectedFields: ['vendor_name', 'vendor_address', 'invoice_date', 'total_amount', 'payment_method', 'items']
  },
  bill: {
    icon: FileText,
    color: 'text-orange-500',
    expectedFields: ['vendor_name', 'account_number', 'due_date', 'total_amount', 'service_period']
  },
  contract: {
    icon: FileText,
    color: 'text-purple-500',
    expectedFields: ['party_a', 'party_b', 'contract_date', 'contract_value', 'terms']
  },
  id_card: {
    icon: CreditCard,
    color: 'text-red-500',
    expectedFields: ['name', 'id_number', 'date_of_birth', 'expiry_date', 'nationality']
  },
  business_card: {
    icon: User,
    color: 'text-teal-500',
    expectedFields: ['name', 'company', 'title', 'email', 'phone', 'address', 'website']
  },
  other: {
    icon: FileImage,
    color: 'text-gray-500',
    expectedFields: []
  }
};

export function DocumentScanner({
  onDocumentProcessed,
  onDataExtracted,
  acceptedTypes = ['invoice', 'receipt', 'bill', 'business_card'],
  autoProcess = true
}: DocumentScannerProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>('invoice');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [rawText, setRawText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Image editing state
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: t('scanner.invalidFileType'),
        description: t('scanner.supportedFormats'),
        variant: 'destructive'
      });
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      resetEditing();
      if (autoProcess) {
        processDocument(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [autoProcess, t, toast]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
      }
    } catch (error) {
      toast({
        title: t('scanner.cameraError'),
        description: t('scanner.cameraPermission'),
        variant: 'destructive'
      });
    }
  }, [t, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  }, [cameraStream]);

  // Capture from camera
  const captureFromCamera = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(imageData);
        stopCamera();
        setActiveTab('upload');
        
        if (autoProcess) {
          processDocument(imageData);
        }
      }
    }
  }, [autoProcess, stopCamera]);

  // Reset editing
  const resetEditing = useCallback(() => {
    setRotation(0);
    setZoom(100);
    setBrightness(100);
    setContrast(100);
    setProcessedImage(null);
    setExtractedFields([]);
    setRawText('');
    setShowResults(false);
  }, []);

  // Apply image filters
  const applyFilters = useCallback(() => {
    if (!selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate rotated dimensions
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));
      const newWidth = img.width * cos + img.height * sin;
      const newHeight = img.width * sin + img.height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Apply transformations
      ctx.translate(newWidth / 2, newHeight / 2);
      ctx.rotate(radians);
      ctx.scale(zoom / 100, zoom / 100);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      setProcessedImage(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.src = selectedImage;
  }, [selectedImage, rotation, zoom, brightness, contrast]);

  // Process document with OCR and AI extraction
  const processDocument = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep(t('scanner.steps.preparing'));

    try {
      // Step 1: Image preprocessing (10%)
      setProcessingProgress(10);
      setProcessingStep(t('scanner.steps.preprocessing'));
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: OCR text extraction (40%)
      setProcessingProgress(40);
      setProcessingStep(t('scanner.steps.extractingText'));
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate extracted text based on document type
      const simulatedText = generateSimulatedText(documentType);
      setRawText(simulatedText);

      // Step 3: AI field extraction (70%)
      setProcessingProgress(70);
      setProcessingStep(t('scanner.steps.analyzingFields'));
      await new Promise(resolve => setTimeout(resolve, 600));

      // Generate simulated extracted fields
      const fields = generateSimulatedFields(documentType);
      setExtractedFields(fields);

      // Step 4: Validation (90%)
      setProcessingProgress(90);
      setProcessingStep(t('scanner.steps.validating'));
      await new Promise(resolve => setTimeout(resolve, 400));

      // Step 5: Complete (100%)
      setProcessingProgress(100);
      setProcessingStep(t('scanner.steps.complete'));

      setShowResults(true);

      toast({
        title: t('scanner.processComplete'),
        description: t('scanner.fieldsExtracted', { count: fields.length })
      });

      if (onDataExtracted) {
        onDataExtracted(fields);
      }

      if (onDocumentProcessed) {
        onDocumentProcessed({
          id: Date.now().toString(),
          type: documentType,
          originalImage: imageData,
          processedImage: processedImage || imageData,
          extractedFields: fields,
          rawText: simulatedText,
          createdAt: new Date(),
          status: 'completed'
        });
      }
    } catch (error) {
      toast({
        title: t('scanner.processError'),
        description: (error as Error).message,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [documentType, processedImage, onDataExtracted, onDocumentProcessed, t, toast]);

  // Generate simulated text for demo
  const generateSimulatedText = (type: DocumentType): string => {
    const texts: Record<DocumentType, string> = {
      invoice: `
INVOICE #INV-2024-001234
Date: November 29, 2024
Due Date: December 29, 2024

From:
ABC Company LLC
123 Business Street
New York, NY 10001
Tel: +1 (555) 123-4567
Email: billing@abccompany.com

Bill To:
John Smith
456 Customer Ave
Los Angeles, CA 90001

Items:
1. Professional Services    $2,500.00
2. Consulting Hours (10)    $1,500.00
3. Software License         $  500.00

Subtotal:    $4,500.00
Tax (10%):   $  450.00
Total:       $4,950.00

Payment Terms: Net 30
      `,
      receipt: `
STORE RECEIPT
ABC Store
123 Main St, City

Date: 11/29/2024 14:30
Receipt #: R-789456

Items:
Product A       $25.99
Product B x2    $39.98
Product C       $15.00

Subtotal:       $80.97
Tax:            $ 8.10
Total:          $89.07

Payment: Credit Card ****1234
Thank you for shopping!
      `,
      bill: `
UTILITY BILL
Service Period: Nov 1 - Nov 30, 2024
Account: 1234567890

Current Charges:
Electricity Usage: $125.50
Service Fee:       $ 10.00
Total Due:         $135.50

Due Date: December 15, 2024
      `,
      business_card: `
John Smith
Senior Developer
Tech Solutions Inc.

Email: john.smith@techsolutions.com
Phone: +1 (555) 987-6543
Website: www.techsolutions.com

123 Tech Park, Suite 100
San Francisco, CA 94105
      `,
      contract: 'Contract document text...',
      id_card: 'ID card details...',
      other: 'Document text...'
    };
    return texts[type] || texts.other;
  };

  // Generate simulated fields for demo
  const generateSimulatedFields = (type: DocumentType): ExtractedField[] => {
    const fieldSets: Record<DocumentType, ExtractedField[]> = {
      invoice: [
        { id: '1', field: 'vendor_name', label: t('scanner.fields.vendorName'), value: 'ABC Company LLC', confidence: 98 },
        { id: '2', field: 'vendor_address', label: t('scanner.fields.vendorAddress'), value: '123 Business Street, New York, NY 10001', confidence: 95 },
        { id: '3', field: 'vendor_email', label: t('scanner.fields.vendorEmail'), value: 'billing@abccompany.com', confidence: 99 },
        { id: '4', field: 'vendor_phone', label: t('scanner.fields.vendorPhone'), value: '+1 (555) 123-4567', confidence: 97 },
        { id: '5', field: 'invoice_number', label: t('scanner.fields.invoiceNumber'), value: 'INV-2024-001234', confidence: 99 },
        { id: '6', field: 'invoice_date', label: t('scanner.fields.invoiceDate'), value: '2024-11-29', confidence: 98 },
        { id: '7', field: 'due_date', label: t('scanner.fields.dueDate'), value: '2024-12-29', confidence: 98 },
        { id: '8', field: 'customer_name', label: t('scanner.fields.customerName'), value: 'John Smith', confidence: 96 },
        { id: '9', field: 'subtotal', label: t('scanner.fields.subtotal'), value: '4500.00', confidence: 99 },
        { id: '10', field: 'tax_amount', label: t('scanner.fields.taxAmount'), value: '450.00', confidence: 98 },
        { id: '11', field: 'total_amount', label: t('scanner.fields.totalAmount'), value: '4950.00', confidence: 99 },
        { id: '12', field: 'currency', label: t('scanner.fields.currency'), value: 'USD', confidence: 100 },
      ],
      receipt: [
        { id: '1', field: 'vendor_name', label: t('scanner.fields.vendorName'), value: 'ABC Store', confidence: 97 },
        { id: '2', field: 'invoice_date', label: t('scanner.fields.date'), value: '2024-11-29', confidence: 98 },
        { id: '3', field: 'total_amount', label: t('scanner.fields.totalAmount'), value: '89.07', confidence: 99 },
        { id: '4', field: 'tax_amount', label: t('scanner.fields.taxAmount'), value: '8.10', confidence: 95 },
        { id: '5', field: 'payment_method', label: t('scanner.fields.paymentMethod'), value: 'Credit Card ****1234', confidence: 92 },
      ],
      bill: [
        { id: '1', field: 'vendor_name', label: t('scanner.fields.vendorName'), value: 'Utility Company', confidence: 95 },
        { id: '2', field: 'account_number', label: t('scanner.fields.accountNumber'), value: '1234567890', confidence: 98 },
        { id: '3', field: 'due_date', label: t('scanner.fields.dueDate'), value: '2024-12-15', confidence: 97 },
        { id: '4', field: 'total_amount', label: t('scanner.fields.totalAmount'), value: '135.50', confidence: 99 },
      ],
      business_card: [
        { id: '1', field: 'name', label: t('scanner.fields.name'), value: 'John Smith', confidence: 99 },
        { id: '2', field: 'title', label: t('scanner.fields.title'), value: 'Senior Developer', confidence: 95 },
        { id: '3', field: 'company', label: t('scanner.fields.company'), value: 'Tech Solutions Inc.', confidence: 97 },
        { id: '4', field: 'email', label: t('scanner.fields.email'), value: 'john.smith@techsolutions.com', confidence: 99 },
        { id: '5', field: 'phone', label: t('scanner.fields.phone'), value: '+1 (555) 987-6543', confidence: 98 },
        { id: '6', field: 'website', label: t('scanner.fields.website'), value: 'www.techsolutions.com', confidence: 96 },
        { id: '7', field: 'address', label: t('scanner.fields.address'), value: '123 Tech Park, Suite 100, San Francisco, CA 94105', confidence: 93 },
      ],
      contract: [],
      id_card: [],
      other: []
    };
    return fieldSets[type] || [];
  };

  // Update field value
  const updateFieldValue = useCallback((fieldId: string, newValue: string) => {
    setExtractedFields(prev => 
      prev.map(f => f.id === fieldId ? { ...f, value: newValue, isEdited: true } : f)
    );
  }, []);

  // Copy field to clipboard
  const copyField = useCallback((value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: t('scanner.copied') });
  }, [t, toast]);

  // Get confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 95) return 'text-green-500';
    if (confidence >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Handle dialog close
  const handleClose = useCallback(() => {
    stopCamera();
    setIsOpen(false);
    resetEditing();
    setSelectedImage(null);
  }, [stopCamera, resetEditing]);

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Scan className="h-4 w-4" />
        {t('scanner.scanDocument')}
      </Button>

      {/* Main Dialog */}
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              {t('scanner.title')}
            </DialogTitle>
            <DialogDescription>
              {t('scanner.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {!showResults ? (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'camera')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="gap-2">
                    <Upload className="h-4 w-4" />
                    {t('scanner.uploadTab')}
                  </TabsTrigger>
                  <TabsTrigger value="camera" className="gap-2">
                    <Camera className="h-4 w-4" />
                    {t('scanner.cameraTab')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Upload/Preview */}
                    <div className="space-y-4">
                      {!selectedImage ? (
                        <div
                          className={cn(
                            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                            "hover:border-primary/50 hover:bg-muted/50"
                          )}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">{t('scanner.dropzone')}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t('scanner.supportedFormats')}
                          </p>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="border rounded-lg overflow-hidden bg-muted/20">
                            <img
                              src={processedImage || selectedImage}
                              alt="Document preview"
                              className="w-full h-auto max-h-80 object-contain"
                              style={{
                                filter: `brightness(${brightness}%) contrast(${contrast}%)`
                              }}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 end-2"
                            onClick={() => {
                              setSelectedImage(null);
                              resetEditing();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {/* Processing indicator */}
                      {isProcessing && (
                        <Card>
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3 mb-3">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span className="font-medium">{processingStep}</span>
                            </div>
                            <Progress value={processingProgress} />
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Right: Options */}
                    <div className="space-y-4">
                      <div>
                        <Label>{t('scanner.documentType')}</Label>
                        <Select value={documentType} onValueChange={(v) => setDocumentType(v as DocumentType)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {acceptedTypes.map(type => {
                              const config = documentTypeConfigs[type];
                              const Icon = config.icon;
                              return (
                                <SelectItem key={type} value={type}>
                                  <div className="flex items-center gap-2">
                                    <Icon className={cn("h-4 w-4", config.color)} />
                                    {t(`scanner.types.${type}`)}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedImage && (
                        <>
                          <Separator />
                          
                          <div className="space-y-3">
                            <Label>{t('scanner.imageAdjustments')}</Label>
                            
                            <div className="flex items-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setRotation((r) => (r - 90) % 360)}>
                                      <RotateCw className="h-4 w-4" style={{ transform: 'scaleX(-1)' }} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('scanner.rotateLeft')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setRotation((r) => (r + 90) % 360)}>
                                      <RotateCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('scanner.rotateRight')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(50, z - 10))}>
                                      <ZoomOut className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('scanner.zoomOut')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(200, z + 10))}>
                                      <ZoomIn className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('scanner.zoomIn')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="icon" onClick={resetEditing}>
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>{t('scanner.reset')}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm">{t('scanner.brightness')}</Label>
                                <span className="text-sm text-muted-foreground">{brightness}%</span>
                              </div>
                              <Slider
                                value={[brightness]}
                                onValueChange={(v) => setBrightness(v[0])}
                                min={50}
                                max={150}
                                step={5}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm">{t('scanner.contrast')}</Label>
                                <span className="text-sm text-muted-foreground">{contrast}%</span>
                              </div>
                              <Slider
                                value={[contrast]}
                                onValueChange={(v) => setContrast(v[0])}
                                min={50}
                                max={150}
                                step={5}
                              />
                            </div>
                          </div>

                          <Button 
                            onClick={() => processDocument(selectedImage)}
                            disabled={isProcessing}
                            className="w-full gap-2"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {t('scanner.processing')}
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4" />
                                {t('scanner.extractData')}
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="camera" className="mt-4">
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {!isCameraActive && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button onClick={startCamera} size="lg" className="gap-2">
                            <Camera className="h-5 w-5" />
                            {t('scanner.startCamera')}
                          </Button>
                        </div>
                      )}
                      {/* Scan overlay */}
                      {isCameraActive && (
                        <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                        </div>
                      )}
                    </div>

                    {isCameraActive && (
                      <div className="flex justify-center gap-4">
                        <Button onClick={captureFromCamera} size="lg" className="gap-2">
                          <Camera className="h-5 w-5" />
                          {t('scanner.capture')}
                        </Button>
                        <Button onClick={stopCamera} variant="outline" size="lg">
                          {t('common.cancel')}
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Results View */
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                {/* Left: Image */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        {t('scanner.scannedDocument')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden">
                        <img
                          src={processedImage || selectedImage || ''}
                          alt="Scanned document"
                          className="w-full h-auto max-h-64 object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Raw Text */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {t('scanner.extractedText')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-32">
                        <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                          {rawText}
                        </pre>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Extracted Fields */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        {t('scanner.extractedFields')}
                      </CardTitle>
                      <Badge variant="outline">
                        {extractedFields.length} {t('scanner.fieldsFound')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {extractedFields.map(field => {
                          const Icon = fieldIcons[field.field] || FileText;
                          return (
                            <div 
                              key={field.id} 
                              className={cn(
                                "p-3 border rounded-lg",
                                field.isEdited && "border-primary bg-primary/5"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-muted-foreground" />
                                  <Label className="text-sm">{field.label}</Label>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Badge 
                                    variant="outline" 
                                    className={cn("text-xs", getConfidenceColor(field.confidence))}
                                  >
                                    {field.confidence}%
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => copyField(field.value)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>{t('scanner.copy')}</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <Input
                                value={field.value}
                                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                                className="mt-2 text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => setShowResults(false)}
                        className="flex-1 gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t('scanner.scanAnother')}
                      </Button>
                      <Button
                        onClick={() => {
                          if (onDataExtracted) {
                            onDataExtracted(extractedFields);
                          }
                          toast({ title: t('scanner.dataSaved') });
                          handleClose();
                        }}
                        className="flex-1 gap-2"
                      >
                        <Check className="h-4 w-4" />
                        {t('scanner.useData')}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default DocumentScanner;
