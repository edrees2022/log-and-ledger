/**
 * File Drag and Drop Component
 * Enterprise file upload with drag-and-drop support
 */
import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Upload,
  File,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
} from 'lucide-react';

export interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  error?: string;
  uploaded?: boolean;
}

interface FileDragDropProps {
  accept?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: File[]) => void;
  onUpload?: (files: File[]) => Promise<void>;
  className?: string;
  showPreview?: boolean;
  value?: FileWithPreview[];
  onChange?: (files: FileWithPreview[]) => void;
}

export function FileDragDrop({
  accept = ['*/*'],
  maxSize = 10,
  maxFiles = 10,
  multiple = true,
  disabled = false,
  onFilesSelected,
  onUpload,
  className,
  showPreview = true,
  value = [],
  onChange,
}: FileDragDropProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>(value);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSize * 1024 * 1024;

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-5 w-5 text-purple-500" />;
    if (type.startsWith('video/')) return <Film className="h-5 w-5 text-red-500" />;
    if (type.startsWith('audio/')) return <Music className="h-5 w-5 text-green-500" />;
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) {
      return <Archive className="h-5 w-5 text-yellow-500" />;
    }
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FileText className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSizeBytes) {
      return t('upload.fileTooLarge', 'File exceeds {{size}}MB limit', { size: maxSize });
    }
    if (accept[0] !== '*/*') {
      const fileType = file.type || 'application/octet-stream';
      const isAccepted = accept.some(type => {
        if (type.endsWith('/*')) {
          return fileType.startsWith(type.replace('/*', '/'));
        }
        return fileType === type || file.name.endsWith(type.replace('*', ''));
      });
      if (!isAccepted) {
        return t('upload.invalidType', 'File type not allowed');
      }
    }
    return null;
  };

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    const currentCount = files.length;

    for (let i = 0; i < fileList.length; i++) {
      if (!multiple && newFiles.length >= 1) break;
      if (currentCount + newFiles.length >= maxFiles) break;

      const file = fileList[i] as FileWithPreview;
      const error = validateFile(file);
      
      if (error) {
        file.error = error;
      } else if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }

      newFiles.push(file);
    }

    const updatedFiles = multiple ? [...files, ...newFiles] : newFiles;
    setFiles(updatedFiles);
    onChange?.(updatedFiles);
    onFilesSelected(newFiles.filter(f => !f.error));
  }, [files, maxFiles, multiple, onFilesSelected, onChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [disabled, processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(index, 1);
    if (removed.preview) {
      URL.revokeObjectURL(removed.preview);
    }
    setFiles(newFiles);
    onChange?.(newFiles);
  };

  const handleUpload = async () => {
    if (!onUpload) return;
    const validFiles = files.filter(f => !f.error && !f.uploaded);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(validFiles);
      setFiles(prev => prev.map(f => ({ ...f, uploaded: true })));
      onChange?.(files.map(f => ({ ...f, uploaded: true })));
    } catch (error) {
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
    onChange?.([]);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          !isDragging && !disabled && "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(',')}
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragging ? "bg-primary/10" : "bg-muted"
          )}>
            <CloudUpload className={cn(
              "h-8 w-8",
              isDragging ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="font-medium">
              {isDragging
                ? t('upload.dropHere', 'Drop files here')
                : t('upload.dragOrClick', 'Drag files here or click to browse')}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t('upload.maxSize', 'Max {{size}}MB per file', { size: maxSize })}
              {multiple && ` • ${t('upload.maxFiles', 'Max {{count}} files', { count: maxFiles })}`}
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {showPreview && files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t('upload.filesCount', '{{count}} file(s)', { count: files.length })}
            </span>
            <div className="flex items-center gap-2">
              {onUpload && (
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={isUploading || files.every(f => f.error || f.uploaded)}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {t('upload.uploadAll', 'Upload All')}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                {t('upload.clearAll', 'Clear All')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  file.error && "border-destructive bg-destructive/5",
                  file.uploaded && "border-green-500 bg-green-500/5"
                )}
              >
                {/* Preview or Icon */}
                {file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                    {getFileIcon(file.type)}
                  </div>
                )}

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                    <Progress value={file.uploadProgress} className="h-1 mt-1" />
                  )}
                  {file.error && (
                    <p className="text-sm text-destructive">{file.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  {file.error ? (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  ) : file.uploaded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
