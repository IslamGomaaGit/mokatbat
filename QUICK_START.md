# Quick Start - IIS Deployment

## Fast Deployment Steps

### 1. Install Prerequisites

- **IIS** with URL Rewrite Module: https://www.iis.net/downloads/microsoft/url-rewrite
- **Node.js** (v18+): https://nodejs.org/
- **PM2** (for backend service): `npm install -g pm2`

### 2. Run Deployment Script

Open PowerShell as **Administrator** and run:

```powershell
.\deploy.ps1
```

This will:
- Build frontend and backend
- Copy files to `C:\inetpub\wwwroot\correspondence`
- Configure IIS site
- Set permissions

### 3. Configure Backend

Create `C:\inetpub\wwwroot\correspondence\backend\.env`:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-STRING
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DB_STORAGE=./database.sqlite
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost
```

### 4. Start Backend Service

```powershell
cd C:\inetpub\wwwroot\correspondence\backend
pm2 start dist/server.js --name correspondence-api
pm2 save
pm2 startup
```

### 5. Access Application

Open browser: `http://localhost`

Default login:
- Username: `admin`
- Password: `admin123` (change after first login!)

## Manual Deployment (Alternative)

If the script doesn't work:

1. **Build:**
   ```bash
   npm run build
   ```

2. **Copy files:**
   - `frontend/dist/*` → `C:\inetpub\wwwroot\correspondence\`
   - `backend/dist/*` → `C:\inetpub\wwwroot\correspondence\backend\`
   - `backend/package.json` → `C:\inetpub\wwwroot\correspondence\backend\`
   - `backend/database.sqlite` → `C:\inetpub\wwwroot\correspondence\backend\`
   - `backend/uploads` → `C:\inetpub\wwwroot\correspondence\backend\`
   - `web.config` → `C:\inetpub\wwwroot\correspondence\`

3. **Install backend dependencies:**
   ```bash
   cd C:\inetpub\wwwroot\correspondence\backend
   npm install --production
   ```

4. **Create IIS Site:**
   - Open IIS Manager
   - Add Website: `CorrespondenceSystem`
   - Physical Path: `C:\inetpub\wwwroot\correspondence`
   - Port: `80`

5. **Start backend:**
   ```bash
   cd C:\inetpub\wwwroot\correspondence\backend
   node dist/server.js
   ```

## Troubleshooting

**API not working?**
- Check if backend is running: `http://localhost:3000/health`
- If using proxy, install ARR module
- Or update `frontend/.env.production` with direct backend URL

**Files not loading?**
- Check IIS permissions on folder
- Verify URL Rewrite module is installed
- Check `web.config` is in root folder

**Database errors?**
- Ensure `database.sqlite` has write permissions
- Run migrations if needed: `npm run migrate`

## Production Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Change default admin password
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging
- [ ] Test file uploads
- [ ] Test all user roles and permissions

