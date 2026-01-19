import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { renderAsync } from 'docx-preview';

interface Attachment {
  id: number;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
}

interface AttachmentViewerProps {
  attachment: Attachment | null;
  attachments?: Attachment[];
  isOpen: boolean;
  onClose: () => void;
  onDownload: (id: number, filename: string) => void;
}

export default function AttachmentViewer({
  attachment,
  attachments = [],
  isOpen,
  onClose,
  onDownload,
}: AttachmentViewerProps) {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [wordContent, setWordContent] = useState<string | null>(null);
  const wordContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // If we have an explicit attachment prop, find its index in the attachments array
      if (attachment && attachments.length > 0) {
        const index = attachments.findIndex(a => a.id === attachment.id);
        if (index >= 0) {
          setCurrentIndex(index);
        }
      } else if (attachments.length > 0 && (currentIndex < 0 || currentIndex >= attachments.length)) {
        // If no explicit attachment and index is invalid, set to 0
        setCurrentIndex(0);
      }
      
      // Reset state when opening viewer or switching attachments
      setFileUrl(null);
      setWordContent(null);
      setError(false);
      setLoading(true);
      
      // Load file after state is updated
      // Use the explicit attachment if provided, otherwise use the one from array
      const attachmentToLoad = attachment || (attachments.length > 0 && currentIndex >= 0 && currentIndex < attachments.length ? attachments[currentIndex] : null);
      if (attachmentToLoad) {
        setTimeout(() => {
          loadFileForAttachment(attachmentToLoad);
        }, 0);
      }
    }
  }, [isOpen, attachment?.id]);

  const loadFile = async () => {
    // Get the current attachment to load - explicit attachment takes priority
    const attachmentToLoad = attachment || (attachments.length > 0 && currentIndex >= 0 && currentIndex < attachments.length ? attachments[currentIndex] : null);
    if (!attachmentToLoad) {
      setError(true);
      setLoading(false);
      return;
    }
    
    // Use the shared load function
    await loadFileForAttachment(attachmentToLoad);
  };

  const handlePrevious = () => {
    if (attachments.length > 0 && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      // Reset state when navigating
      setFileUrl(null);
      setWordContent(null);
      setError(false);
      setLoading(true);
      // Load the new attachment
      setTimeout(() => {
        const attachmentToLoad = attachments[newIndex];
        if (attachmentToLoad) {
          loadFileForAttachment(attachmentToLoad);
        }
      }, 0);
    }
  };

  const handleNext = () => {
    if (attachments.length > 0 && currentIndex < attachments.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      // Reset state when navigating
      setFileUrl(null);
      setWordContent(null);
      setError(false);
      setLoading(true);
      // Load the new attachment
      setTimeout(() => {
        const attachmentToLoad = attachments[newIndex];
        if (attachmentToLoad) {
          loadFileForAttachment(attachmentToLoad);
        }
      }, 0);
    }
  };

  const loadFileForAttachment = async (attachmentToLoad: Attachment) => {
    if (!attachmentToLoad) {
      setError(true);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(false);

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';
      // Handle both relative and absolute paths
      let filePath = attachmentToLoad.file_path;
      if (!filePath.startsWith('http')) {
        // Normalize backslashes to forward slashes first
        filePath = filePath.replace(/\\/g, '/');
        
        // Remove "uploads/" or "uploads\" prefix if it exists (handle both slashes)
        filePath = filePath.replace(/^uploads[/\\]?/i, '');
        
        // Remove leading/trailing slashes
        filePath = filePath.replace(/^\/+|\/+$/g, '');
        filePath = `${baseUrl}/uploads/${filePath}`;
      }
      
      // For images and PDFs, we can use direct URL
      if (attachmentToLoad.mime_type.startsWith('image/') || attachmentToLoad.mime_type === 'application/pdf') {
        setFileUrl(filePath);
        setLoading(false);
      } else if (attachmentToLoad.mime_type.includes('word') || attachmentToLoad.mime_type.includes('document')) {
        // For Word docs, fetch and render using docx-preview
        // Check if it's .docx (new format) or .doc (old format)
        const isDocx = attachmentToLoad.original_name.toLowerCase().endsWith('.docx') ||
                      attachmentToLoad.mime_type.includes('openxml');
        
        if (isDocx) {
          try {
            const response = await fetch(filePath);
            if (!response.ok) {
              throw new Error('Failed to fetch Word document');
            }
            const arrayBuffer = await response.arrayBuffer();
            
            // Wait a bit for the container to be ready if needed
            const renderDoc = async () => {
              if (wordContainerRef.current) {
                // Clear previous content
                wordContainerRef.current.innerHTML = '';
                
                // Render Word document
                await renderAsync(arrayBuffer, wordContainerRef.current, null, {
                  className: 'docx-wrapper',
                  inWrapper: true,
                  ignoreWidth: false,
                  ignoreHeight: false,
                  ignoreFonts: false,
                  breakPages: true,
                  ignoreLastRenderedPageBreak: true,
                });
                setWordContent('rendered');
                setLoading(false);
              } else {
                // Retry after a short delay
                setTimeout(renderDoc, 100);
              }
            };
            
            renderDoc();
          } catch (err) {
            console.error('Failed to render Word document:', err);
            setError(true);
            setLoading(false);
          }
        } else {
          // For .doc files (old format), try Office Online viewer or show download message
          const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePath)}`;
          setFileUrl(officeViewerUrl);
          setLoading(false);
        }
      } else {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      setError(true);
      setLoading(false);
    }
  };

  // Get the current attachment to display - explicit attachment takes priority
  const displayAttachment = attachment || (attachments.length > 0 && currentIndex >= 0 && currentIndex < attachments.length ? attachments[currentIndex] : null);
  
  if (!isOpen || !displayAttachment) return null;

  const isImage = displayAttachment.mime_type.startsWith('image/');
  const isPDF = displayAttachment.mime_type === 'application/pdf';
  const isWord = displayAttachment.mime_type.includes('word') || displayAttachment.mime_type.includes('document');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <div className="relative h-full w-full">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-black/80 p-4 text-white">
          <div className="flex items-center gap-4">
            {attachments.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm">
                  {currentIndex + 1} / {attachments.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNext}
                  disabled={currentIndex === attachments.length - 1}
                  className="text-white hover:bg-white/20"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{displayAttachment.original_name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDownload(displayAttachment.id, displayAttachment.original_name)}
              className="text-white hover:bg-white/20"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-full items-center justify-center p-4 pt-20">
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : error && (!isImage && !isPDF && !isWord) ? (
            <div className="text-center text-white">
              <p className="mb-4 text-lg">
                This file type cannot be previewed. Please download to view.
              </p>
              <Button
                onClick={() => onDownload(displayAttachment.id, displayAttachment.original_name)}
                variant="default"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('correspondence.download')}
              </Button>
            </div>
          ) : isImage ? (
            <img
              src={fileUrl || ''}
              alt={displayAttachment.original_name}
              className="max-h-full max-w-full object-contain"
              crossOrigin="anonymous"
              onError={() => {
                console.error('Failed to load image:', fileUrl);
                setError(true);
              }}
            />
          ) : isPDF ? (
            <iframe
              src={fileUrl || ''}
              className="h-full w-full border-0 bg-white"
              title={displayAttachment.original_name}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              style={{ border: 'none' }}
            />
          ) : isWord ? (
            wordContent ? (
              <div 
                ref={wordContainerRef}
                className="h-full w-full overflow-auto bg-white p-8 docx-wrapper"
                style={{ maxHeight: 'calc(100vh - 80px)' }}
              />
            ) : fileUrl && !error ? (
              <iframe
                src={fileUrl}
                className="h-full w-full border-0 bg-white"
                title={displayAttachment.original_name}
                onError={() => {
                  console.error('Failed to load document via Office viewer:', fileUrl);
                  setError(true);
                }}
              />
            ) : error ? (
              <div className="text-center text-white">
                <p className="mb-4 text-lg">
                  {i18n.language === 'ar' 
                    ? 'فشل تحميل المستند. يرجى التنزيل للعرض.' 
                    : 'Failed to load document. Please download to view.'}
                </p>
                <Button
                  onClick={() => onDownload(displayAttachment.id, displayAttachment.original_name)}
                  variant="default"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t('correspondence.download')}
                </Button>
              </div>
            ) : (
              <div className="text-center text-white">
                <p className="mb-4 text-lg">Loading Word document...</p>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

