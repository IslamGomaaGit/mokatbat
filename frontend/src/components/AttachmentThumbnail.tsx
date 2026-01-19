import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Download, File, FileText, Image, FileType, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  id: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
}

interface AttachmentThumbnailProps {
  attachment: Attachment;
  onDownload: (id: number, filename: string) => void;
  onDelete?: (id: number) => void;
  onView?: (attachment: Attachment) => void;
  showActions?: boolean;
}

export default function AttachmentThumbnail({
  attachment,
  onDownload,
  onDelete,
  onView,
  showActions = true,
}: AttachmentThumbnailProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const getFileIcon = () => {
    const mime = attachment.mime_type.toLowerCase();
    if (mime.startsWith('image/')) return Image;
    if (mime === 'application/pdf') return FileText;
    if (mime.includes('word') || mime.includes('document')) return FileType;
    return File;
  };

  const getFileExtension = () => {
    const parts = attachment.original_name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  const isImage = attachment.mime_type.startsWith('image/');
  const isPDF = attachment.mime_type === 'application/pdf';
  const isViewable = isImage || isPDF || attachment.mime_type.includes('word') || attachment.mime_type.includes('document');

  const Icon = getFileIcon();
  // Construct file URL - handle both relative and absolute paths
  const getFileUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
    if (attachment.file_path.startsWith('http')) {
      return attachment.file_path;
    }
    // Path is stored relative to uploads directory (e.g., "incoming/filename.pdf")
    // Normalize backslashes to forward slashes first
    let pathPart = attachment.file_path.replace(/\\/g, '/');
    
    // Remove "uploads/" or "uploads\" prefix if it exists (handle both slashes)
    pathPart = pathPart.replace(/^uploads[/\\]?/i, '');
    
    // Remove leading/trailing slashes
    pathPart = pathPart.replace(/^\/+|\/+$/g, '');
    
    // Construct final URL
    return `${baseUrl}/uploads/${pathPart}`;
  };
  const fileUrl = getFileUrl();

  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg">
      {/* Thumbnail */}
      <div
        className={cn(
          "relative aspect-square w-full cursor-pointer overflow-hidden bg-muted",
          isViewable && "hover:opacity-90"
        )}
        onClick={() => isViewable && onView?.(attachment)}
      >
        {isImage && !imageError ? (
          <img
            src={fileUrl}
            alt={attachment.original_name}
            className="h-full w-full object-cover"
            crossOrigin="anonymous"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4">
            <Icon className="h-12 w-12 text-muted-foreground" />
            <span className="mt-2 text-xs font-semibold text-muted-foreground">
              {getFileExtension()}
            </span>
          </div>
        )}

        {/* Overlay on hover */}
        {isViewable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Eye className="h-8 w-8 text-white" />
          </div>
        )}

        {/* File size badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          {(attachment.file_size / 1024).toFixed(1)} KB
        </div>
      </div>

      {/* File info and actions */}
      <div className="p-3">
        <p className="truncate text-sm font-medium" title={attachment.original_name}>
          {attachment.original_name}
        </p>
        {showActions && (
          <div className="mt-2 flex gap-1">
            {isViewable && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1 text-xs"
                onClick={() => onView?.(attachment)}
              >
                <Eye className="mr-1 h-3 w-3" />
                {t('correspondence.view')}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 flex-1 text-xs"
              onClick={() => onDownload(attachment.id, attachment.original_name)}
            >
              <Download className="mr-1 h-3 w-3" />
              {t('correspondence.download')}
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(attachment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

