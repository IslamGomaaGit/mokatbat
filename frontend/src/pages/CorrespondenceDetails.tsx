import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/hooks/usePermissions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { ArrowLeft, Download, Trash2, MessageSquare, Eye, Upload, Edit, CheckCircle, Printer } from 'lucide-react';
import { format } from 'date-fns';
import AttachmentThumbnail from '@/components/AttachmentThumbnail';
import AttachmentViewer from '@/components/AttachmentViewer';

const replySchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
});

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'sent', 'received', 'under_review', 'replied', 'closed']),
  notes: z.string().optional(),
});

interface Correspondence {
  id: number;
  reference_number: string;
  type: 'incoming' | 'outgoing';
  subject: string;
  description: string;
  correspondence_date: string;
  current_status: string;
  review_status: string;
  senderEntity: { name_ar: string; name_en: string };
  receiverEntity: { name_ar: string; name_en: string };
  creator: { full_name_ar: string; full_name_en: string };
  attachments: Array<{
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
    file_path: string;
  }>;
  replies: Array<{
    id: number;
    subject: string;
    body: string;
    created_at: string;
    creator: { full_name_ar: string; full_name_en: string };
  }>;
  statusHistory: Array<{
    id: number;
    old_status: string;
    new_status: string;
    notes?: string;
    created_at: string;
    changedBy: { full_name_ar: string; full_name_en: string };
  }>;
}

export default function CorrespondenceDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const [correspondence, setCorrespondence] = useState<Correspondence | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState<{
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
    file_path: string;
  } | null>(null);

  const replyForm = useForm<z.infer<typeof replySchema>>({
    resolver: zodResolver(replySchema),
  });

  const statusForm = useForm<z.infer<typeof statusUpdateSchema>>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: correspondence?.current_status as any,
    },
  });

  useEffect(() => {
    const fetchCorrespondence = async () => {
      try {
        const response = await api.get(`/correspondences/${id}`);
        setCorrespondence(response.data);
      } catch (error) {
        toast.error('Failed to load correspondence');
        navigate('/incoming');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCorrespondence();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (correspondence) {
      statusForm.setValue('status', correspondence.current_status as any);
    }
  }, [correspondence]);

  const fetchCorrespondence = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/correspondences/${id}`);
      setCorrespondence(response.data);
    } catch (error) {
      toast.error('Failed to load correspondence');
    }
  };

  const handleDownload = async (attachmentId: number, filename: string) => {
    try {
      const response = await api.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // Use original filename with extension
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download attachment');
    }
  };

  const handleViewAttachment = (attachment: {
    id: number;
    original_name: string;
    file_size: number;
    mime_type: string;
    file_path: string;
  }) => {
    setViewingAttachment(attachment);
    setViewerOpen(true);
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!confirm(i18n.language === 'ar' ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?')) return;
    try {
      await api.delete(`/attachments/${attachmentId}`);
      toast.success(i18n.language === 'ar' ? 'تم الحذف بنجاح' : 'Deleted successfully');
      fetchCorrespondence();
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const onReplySubmit = async (data: z.infer<typeof replySchema>) => {
    if (!id) return;
    try {
      await api.post(`/correspondences/${id}/reply`, data);
      toast.success(i18n.language === 'ar' ? 'تم إضافة الرد بنجاح' : 'Reply added successfully');
      replyForm.reset();
      setShowReplyForm(false);
      fetchCorrespondence();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add reply');
    }
  };

  const onStatusSubmit = async (data: z.infer<typeof statusUpdateSchema>) => {
    if (!id) return;
    try {
      await api.patch(`/correspondences/${id}/status`, data);
      toast.success(i18n.language === 'ar' ? 'تم تحديث الحالة بنجاح' : 'Status updated successfully');
      setShowStatusForm(false);
      fetchCorrespondence();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !id) return;
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', correspondence?.type || 'incoming');
      await api.post(`/attachments/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(i18n.language === 'ar' ? 'تم رفع الملف بنجاح' : 'File uploaded successfully');
      setSelectedFile(null);
      fetchCorrespondence();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !correspondence) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${i18n.language === 'ar' ? 'rtl' : 'ltr'}" lang="${i18n.language}">
        <head>
          <meta charset="UTF-8">
          <title>${correspondence.reference_number} - ${correspondence.subject}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; direction: ${i18n.language === 'ar' ? 'rtl' : 'ltr'}; }
            h1 { text-align: center; margin-bottom: 30px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
            .info-item { border-bottom: 1px solid #eee; padding: 10px 0; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { margin-top: 5px; }
            .description { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
            .attachments { margin: 20px 0; }
            .attachment-item { padding: 5px 0; }
            @media print { 
              @page { margin: 1cm; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${i18n.language === 'ar' ? 'تفاصيل المكاتبة' : 'Correspondence Details'}</h1>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">${t('correspondence.referenceNumber')}:</div>
              <div class="info-value">${correspondence.reference_number}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.type')}:</div>
              <div class="info-value">${i18n.language === 'ar' ? (correspondence.type === 'incoming' ? 'وارد' : 'صادر') : correspondence.type}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.subject')}:</div>
              <div class="info-value">${correspondence.subject}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.date')}:</div>
              <div class="info-value">${format(new Date(correspondence.correspondence_date), 'yyyy-MM-dd')}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.sender')}:</div>
              <div class="info-value">${i18n.language === 'ar' ? correspondence.senderEntity.name_ar : correspondence.senderEntity.name_en}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.receiver')}:</div>
              <div class="info-value">${i18n.language === 'ar' ? correspondence.receiverEntity.name_ar : correspondence.receiverEntity.name_en}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${t('correspondence.status')}:</div>
              <div class="info-value">${correspondence.current_status}</div>
            </div>
            <div class="info-item">
              <div class="info-label">${i18n.language === 'ar' ? 'المنشئ' : 'Created By'}:</div>
              <div class="info-value">${i18n.language === 'ar' ? correspondence.creator.full_name_ar : correspondence.creator.full_name_en}</div>
            </div>
          </div>

          <div class="description">
            <div class="info-label">${t('correspondence.description')}:</div>
            <div class="info-value">${correspondence.description || '-'}</div>
          </div>

          ${correspondence.attachments && correspondence.attachments.length > 0 ? `
            <div class="attachments">
              <div class="info-label">${t('correspondence.attachments')}:</div>
              ${correspondence.attachments.map(att => `
                <div class="attachment-item">- ${att.original_name} (${(att.file_size / 1024).toFixed(2)} KB)</div>
              `).join('')}
            </div>
          ` : ''}

          ${correspondence.replies && correspondence.replies.length > 0 ? `
            <div class="replies" style="margin-top: 20px;">
              <div class="info-label">${t('correspondence.replies')}:</div>
              ${correspondence.replies.map(reply => `
                <div style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                  <div class="info-label">${reply.subject}</div>
                  <div class="info-value">${reply.body}</div>
                  <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    ${i18n.language === 'ar' ? 'بواسطة' : 'By'}: ${i18n.language === 'ar' ? reply.creator.full_name_ar : reply.creator.full_name_en} 
                    - ${format(new Date(reply.created_at), 'yyyy-MM-dd HH:mm')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-10 w-64" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="mt-4 h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!correspondence) {
    return <div>Correspondence not found</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{t('correspondence.title')}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            {i18n.language === 'ar' ? 'طباعة' : 'Print'}
          </Button>
          {hasPermission('correspondence:update') && (
            <Button variant="outline" onClick={() => navigate(`/correspondences/${id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              {t('correspondence.edit')}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{correspondence.subject}</CardTitle>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                {correspondence.reference_number}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('correspondence.type')}</p>
                <p>{t(`correspondence.${correspondence.type}`)}</p>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('correspondence.status')}</p>
                    <p>{t(`correspondence.${correspondence.current_status}`)}</p>
                  </div>
                  {hasPermission('correspondence:update') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowStatusForm(!showStatusForm)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      {t('correspondence.edit', 'Edit')}
                    </Button>
                  )}
                </div>
                {showStatusForm && (
                  <form
                    onSubmit={statusForm.handleSubmit(onStatusSubmit)}
                    className="mt-4 space-y-4 rounded border p-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium">{t('correspondence.status')}</label>
                      <Select
                        {...statusForm.register('status')}
                        onChange={(e) => statusForm.setValue('status', e.target.value as any)}
                      >
                        <option value="draft">{t('correspondence.draft')}</option>
                        <option value="sent">{t('correspondence.sent')}</option>
                        <option value="received">{t('correspondence.received')}</option>
                        <option value="under_review">{t('correspondence.underReview')}</option>
                        <option value="replied">{t('correspondence.replied')}</option>
                        <option value="closed">{t('correspondence.closed')}</option>
                      </Select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">{t('correspondence.notes', 'Notes')}</label>
                      <Textarea {...statusForm.register('notes')} rows={3} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('correspondence.save')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusForm(false)}
                      >
                        {t('correspondence.cancel')}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('correspondence.sender')}</p>
                <p>{i18n.language === 'ar' ? correspondence.senderEntity.name_ar : correspondence.senderEntity.name_en}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('correspondence.receiver')}</p>
                <p>{i18n.language === 'ar' ? correspondence.receiverEntity.name_ar : correspondence.receiverEntity.name_en}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('correspondence.date')}</p>
                <p>{format(new Date(correspondence.correspondence_date), 'yyyy-MM-dd')}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('correspondence.description')}</p>
              <p className="mt-2 whitespace-pre-wrap">{correspondence.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('correspondence.attachments')}</CardTitle>
              {hasPermission('correspondence:update') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {t('correspondence.upload', 'Upload')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            {selectedFile && (
              <div className="mb-4 flex items-center justify-between rounded border p-3">
                <span className="text-sm">{selectedFile.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleFileUpload} disabled={uploadingFile}>
                    {uploadingFile ? '...' : t('correspondence.upload', 'Upload')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    {t('correspondence.cancel')}
                  </Button>
                </div>
              </div>
            )}
            {correspondence.attachments && correspondence.attachments.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {correspondence.attachments.map((attachment) => (
                  <AttachmentThumbnail
                    key={attachment.id}
                    attachment={attachment}
                    onDownload={handleDownload}
                    onDelete={hasPermission('correspondence:delete') ? handleDeleteAttachment : undefined}
                    onView={handleViewAttachment}
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('correspondence.noAttachments', 'No attachments')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('correspondence.replies')}</CardTitle>
              {hasPermission('correspondence:update') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('correspondence.addReply')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showReplyForm && (
              <form onSubmit={replyForm.handleSubmit(onReplySubmit)} className="space-y-4 rounded border p-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">{t('correspondence.subject')}</label>
                  <Input {...replyForm.register('subject')} />
                  {replyForm.formState.errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{replyForm.formState.errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{t('correspondence.description')}</label>
                  <Textarea {...replyForm.register('body')} rows={4} />
                  {replyForm.formState.errors.body && (
                    <p className="mt-1 text-sm text-red-500">{replyForm.formState.errors.body.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">
                    {t('correspondence.save')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowReplyForm(false);
                      replyForm.reset();
                    }}
                  >
                    {t('correspondence.cancel')}
                  </Button>
                </div>
              </form>
            )}
            {correspondence.replies && correspondence.replies.length > 0 ? (
              correspondence.replies.map((reply) => (
                <div key={reply.id} className="rounded border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{reply.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(reply.created_at), 'yyyy-MM-dd HH:mm')}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {i18n.language === 'ar' ? reply.creator.full_name_ar : reply.creator.full_name_en}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{reply.body}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{t('correspondence.noReplies', 'No replies yet')}</p>
            )}
          </CardContent>
        </Card>

        {correspondence.statusHistory && correspondence.statusHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {correspondence.statusHistory.map((history) => (
                  <div key={history.id} className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm">
                        {t(`correspondence.${history.old_status}`)} → {t(`correspondence.${history.new_status}`)}
                      </p>
                      {history.notes && <p className="mt-1 text-sm text-muted-foreground">{history.notes}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(history.created_at), 'yyyy-MM-dd HH:mm')} -{' '}
                        {i18n.language === 'ar' ? history.changedBy.full_name_ar : history.changedBy.full_name_en}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attachment Viewer */}
        <AttachmentViewer
          attachment={viewingAttachment}
          attachments={correspondence.attachments || []}
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setViewingAttachment(null);
          }}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
}

