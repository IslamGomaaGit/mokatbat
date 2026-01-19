# IIS Deployment Guide

This guide will help you deploy the Correspondence Management System to your local IIS server.

## Prerequisites

1. **IIS Installed** with the following features:
   - IIS Management Console
   - URL Rewrite Module (download from: https://www.iis.net/downloads/microsoft/url-rewrite)
   - Application Request Routing (ARR) - Optional, for API proxying

2. **Node.js** installed (v18 or higher)
3. **npm** or **yarn** package manager

## Step 1: Build the Application

### Build Backend

```bash
cd backend
npm install
npm run build
```

This will create a `dist` folder with compiled JavaScript files.

### Build Frontend

```bash
cd frontend
npm install
npm run build
```

This will create a `dist` folder with production-ready static files.

## Step 2: Prepare Deployment Files

### Option A: Deploy Everything to IIS (Recommended)

1. Create a folder structure on your server:
   ```
   C:\inetpub\wwwroot\correspondence\
   ├── frontend\          (frontend/dist contents)
   ├── backend\           (backend/dist + node_modules + uploads)
   └── web.config
   ```

2. Copy files:
   - Copy `frontend/dist/*` to `C:\inetpub\wwwroot\correspondence\`
   - Copy `backend/dist/*` to `C:\inetpub\wwwroot\correspondence\backend\`
   - Copy `backend/node_modules` to `C:\inetpub\wwwroot\correspondence\backend\`
   - Copy `backend/uploads` to `C:\inetpub\wwwroot\correspondence\backend\`
   - Copy `backend/database.sqlite` to `C:\inetpub\wwwroot\correspondence\backend\`
   - Copy `backend/package.json` to `C:\inetpub\wwwroot\correspondence\backend\`
   - Copy `web.config` to `C:\inetpub\wwwroot\correspondence\`

### Option B: Separate Frontend and Backend

**Frontend (IIS):**
- Copy `frontend/dist/*` to `C:\inetpub\wwwroot\correspondence\`
- Copy `web.config` to `C:\inetpub\wwwroot\correspondence\`

**Backend (Windows Service or separate process):**
- Keep backend running separately on port 3000
- Update `web.config` API proxy URL if backend is on different server/port

## Step 3: Configure IIS

### 3.1 Create IIS Application

1. Open **IIS Manager**
2. Right-click on **Sites** → **Add Website**
3. Configure:
   - **Site name**: `CorrespondenceSystem`
   - **Application pool**: Create new or use existing
   - **Physical path**: `C:\inetpub\wwwroot\correspondence`
   - **Binding**: 
     - Type: `http`
     - IP address: `All Unassigned` or your server IP
     - Port: `80` (or your preferred port)
     - Host name: (optional) `correspondence.local` or your domain

### 3.2 Configure Application Pool

1. Select your application pool
2. Set **.NET CLR Version** to **No Managed Code**
3. Set **Managed Pipeline Mode** to **Integrated**
4. Set **Identity** to a user with appropriate permissions

### 3.3 Install URL Rewrite Module

If not already installed:
1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install the module
3. Restart IIS

## Step 4: Configure Backend

### 4.1 Environment Variables

Create `backend/.env` file:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
DB_STORAGE=./database.sqlite
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost
```

**Important**: Change `JWT_SECRET` to a strong random string in production!

### 4.2 Run Backend as Windows Service (Recommended)

#### Option A: Using PM2 (Recommended)

1. Install PM2 globally:
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. Start the backend:
   ```bash
   cd C:\inetpub\wwwroot\correspondence\backend
   pm2 start dist/server.js --name correspondence-api
   pm2 save
   pm2 startup
   ```

#### Option B: Using NSSM (Node Service Manager)

1. Download NSSM from: https://nssm.cc/download
2. Install as service:
   ```bash
   nssm install CorrespondenceAPI
   ```
3. Configure:
   - **Path**: `C:\Program Files\nodejs\node.exe`
   - **Startup directory**: `C:\inetpub\wwwroot\correspondence\backend`
   - **Arguments**: `dist/server.js`

#### Option C: Run as Separate Process

Create a batch file `start-backend.bat`:
```batch
@echo off
cd C:\inetpub\wwwroot\correspondence\backend
node dist/server.js
```

Run this batch file or add it to Windows Startup.

## Step 5: Update Frontend API URL

If your backend is on a different URL, update `frontend/src/lib/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api/v1';
```

Or create `frontend/.env.production`:
```env
VITE_API_URL=http://your-server-ip/api/v1
```

Then rebuild the frontend.

## Step 6: Set Permissions

Ensure IIS has proper permissions:

1. Right-click on `correspondence` folder → **Properties** → **Security**
2. Add **IIS_IUSRS** with **Read & Execute** permissions
3. For `backend/uploads` folder, add **IIS_IUSRS** with **Modify** permissions (for file uploads)
4. For `backend/database.sqlite`, ensure **IIS_IUSRS** has **Modify** permissions

## Step 7: Test the Deployment

1. Open browser and navigate to: `http://localhost` (or your configured URL)
2. Test login with default admin credentials
3. Verify file uploads work
4. Check backend logs for any errors

## Troubleshooting

### API Requests Failing

1. Check if backend is running: `http://localhost:3000/health`
2. Verify `web.config` proxy rule is correct
3. Check IIS logs: `C:\inetpub\logs\LogFiles\`
4. Verify URL Rewrite module is installed

### Static Files Not Loading

1. Check MIME types in `web.config`
2. Verify file permissions
3. Check IIS static content feature is enabled

### Database Errors

1. Verify `database.sqlite` exists and has correct permissions
2. Run migrations if needed:
   ```bash
   cd backend
   npm run migrate
   ```

### File Upload Errors

1. Check `uploads` folder permissions
2. Verify `UPLOAD_DIR` in `.env` is correct
3. Check disk space

## Security Recommendations

1. **Change JWT Secret**: Use a strong random string
2. **Use HTTPS**: Configure SSL certificate for production
3. **Firewall**: Only allow necessary ports (80, 443, 3000)
4. **Update Dependencies**: Regularly update npm packages
5. **Backup Database**: Schedule regular backups of `database.sqlite`
6. **Log Monitoring**: Set up log monitoring for errors

## Maintenance

### Updating the Application

1. Build new version:
   ```bash
   npm run build
   ```
2. Stop backend service
3. Copy new files to IIS directory
4. Restart backend service
5. Clear browser cache

### Database Backups

Regularly backup `backend/database.sqlite`:
```bash
copy backend\database.sqlite backend\backups\database-YYYY-MM-DD.sqlite
```

## Support

For issues or questions, check:
- IIS Logs: `C:\inetpub\logs\LogFiles\`
- Backend Logs: Check PM2 logs or service logs
- Browser Console: F12 → Console tab

