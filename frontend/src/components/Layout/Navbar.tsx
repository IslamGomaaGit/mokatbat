import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { LogOut, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">{t('app.name')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleLanguage}>
            <Globe className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {i18n.language === 'ar' ? user?.full_name_ar : user?.full_name_en}
            </span>
            <span className="text-xs text-muted-foreground">({user?.role})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

