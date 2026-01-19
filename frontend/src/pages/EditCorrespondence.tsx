import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { ArrowLeft, Upload, X } from 'lucide-react';

const correspondenceSchema = z.object({
  type: z.enum(['incoming', 'outgoing']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
  sender_entity_id: z.number().int().positive('Sender entity is required'),
  receiver_entity_id: z.number().int().positive('Receiver entity is required'),
  correspondence_date: z.string().min(1, 'Date is required'),
  current_status: z.enum(['draft', 'sent', 'received', 'under_review', 'replied', 'closed']).optional(),
  review_status: z.enum(['reviewed', 'not_reviewed']).optional(),
});

type CorrespondenceFormData = z.infer<typeof correspondenceSchema>;

interface Entity {
  id: number;
  name_ar: string;
  name_en: string;
}

export default function EditCorrespondence() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [entitiesLoading, setEntitiesLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CorrespondenceFormData>({
    resolver: zodResolver(correspondenceSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entitiesRes, correspondenceRes] = await Promise.all([
          api.get('/entities?limit=1000'), // Get all entities for dropdown
          id ? api.get(`/correspondences/${id}`) : Promise.resolve(null),
        ]);

        // Handle both old format (array) and new format (object with data property)
        const entitiesData = Array.isArray(entitiesRes.data) 
          ? entitiesRes.data 
          : (entitiesRes.data.data || []);
        setEntities(entitiesData);

        if (correspondenceRes?.data) {
          const corr = correspondenceRes.data;
          reset({
            type: corr.type,
            subject: corr.subject,
            description: corr.description,
            sender_entity_id: corr.sender_entity_id,
            receiver_entity_id: corr.receiver_entity_id,
            correspondence_date: new Date(corr.correspondence_date).toISOString().split('T')[0],
            current_status: corr.current_status,
            review_status: corr.review_status,
          });
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setEntitiesLoading(false);
        setDataLoading(false);
      }
    };
    fetchData();
  }, [id, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CorrespondenceFormData) => {
    if (!id) return;
    setLoading(true);
    try {
      await api.put(`/correspondences/${id}`, {
        ...data,
        correspondence_date: new Date(data.correspondence_date).toISOString(),
      });

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', data.type);
          try {
            await api.post(`/attachments/${id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (error) {
            console.error('Failed to upload file:', error);
          }
        }
      }

      toast.success(i18n.language === 'ar' ? 'تم تحديث المكاتبة بنجاح' : 'Correspondence updated successfully');
      navigate(`/correspondences/${id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update correspondence');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{t('correspondence.edit')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('correspondence.edit')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('correspondence.type')}</label>
                <Select
                  {...register('type')}
                  onChange={(e) => setValue('type', e.target.value as 'incoming' | 'outgoing')}
                >
                  <option value="incoming">{t('correspondence.incoming')}</option>
                  <option value="outgoing">{t('correspondence.outgoing')}</option>
                </Select>
                {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('correspondence.date')}</label>
                <Input type="date" {...register('correspondence_date')} />
                {errors.correspondence_date && (
                  <p className="mt-1 text-sm text-red-500">{errors.correspondence_date.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('correspondence.sender')}</label>
                <Select
                  {...register('sender_entity_id', { valueAsNumber: true })}
                  disabled={entitiesLoading}
                >
                  <option value="">{t('correspondence.sender')}</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {i18n.language === 'ar' ? entity.name_ar : entity.name_en}
                    </option>
                  ))}
                </Select>
                {errors.sender_entity_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.sender_entity_id.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">{t('correspondence.receiver')}</label>
                <Select
                  {...register('receiver_entity_id', { valueAsNumber: true })}
                  disabled={entitiesLoading}
                >
                  <option value="">{t('correspondence.receiver')}</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {i18n.language === 'ar' ? entity.name_ar : entity.name_en}
                    </option>
                  ))}
                </Select>
                {errors.receiver_entity_id && (
                  <p className="mt-1 text-sm text-red-500">{errors.receiver_entity_id.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t('correspondence.subject')}</label>
              <Input {...register('subject')} />
              {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t('correspondence.description')}</label>
              <Textarea {...register('description')} rows={6} />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">{t('correspondence.status')}</label>
                <Select
                  {...register('current_status')}
                  onChange={(e) => setValue('current_status', e.target.value as any)}
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
                <label className="mb-2 block text-sm font-medium">{t('correspondence.reviewStatus')}</label>
                <Select
                  {...register('review_status')}
                  onChange={(e) => setValue('review_status', e.target.value as any)}
                >
                  <option value="not_reviewed">{t('correspondence.notReviewed')}</option>
                  <option value="reviewed">{t('correspondence.reviewed')}</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">{t('correspondence.attachments')}</label>
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between rounded border p-2">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? '...' : t('correspondence.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                {t('correspondence.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

