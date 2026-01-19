import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-toastify';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setAuth, accessToken, loadFromStorage } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      loadFromStorage();
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Verify session is still valid
          await api.get('/auth/me');
          navigate('/', { replace: true });
        } catch (error) {
          // Session invalid, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setCheckingSession(false);
        }
      } else {
        setCheckingSession(false);
      }
    };
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      const { user, accessToken, refreshToken } = response.data;
      
      // Save session to localStorage (already done in setAuth, but ensure it's saved)
      setAuth(user, accessToken, refreshToken);
      
      // Verify session was saved
      const savedToken = localStorage.getItem('accessToken');
      if (savedToken) {
        toast.success(i18n.language === 'ar' ? 'تم تسجيل الدخول بنجاح' : 'Login successful');
        navigate('/');
      } else {
        toast.error(i18n.language === 'ar' ? 'فشل حفظ الجلسة' : 'Failed to save session');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>{i18n.language === 'ar' ? 'جارٍ التحقق من الجلسة...' : 'Checking session...'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{t('auth.login')}</CardTitle>
          <CardDescription>{t('app.name')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t('auth.username')}
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('auth.password')}
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '...' : t('auth.loginButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

