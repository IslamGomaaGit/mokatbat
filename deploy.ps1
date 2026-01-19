# PowerShell Deployment Script for IIS
# Run as Administrator

param(
    [string]$IISPath = "C:\inetpub\wwwroot\correspondence",
    [int]$BackendPort = 3000,
    [string]$SiteName = "CorrespondenceSystem"
)

Write-Host "=== Correspondence Management System - IIS Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Step 1: Build the application
Write-Host "Step 1: Building application..." -ForegroundColor Green
Write-Host ""

Write-Host "Building backend..." -ForegroundColor Yellow
Set-Location backend
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Backend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "Building frontend..." -ForegroundColor Yellow
Set-Location frontend
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Frontend build failed!" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Create deployment directory
Write-Host "Step 2: Creating deployment directory..." -ForegroundColor Green
if (Test-Path $IISPath) {
    Write-Host "Directory exists. Cleaning..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "$IISPath\*"
} else {
    New-Item -ItemType Directory -Path $IISPath -Force | Out-Null
}
New-Item -ItemType Directory -Path "$IISPath\backend" -Force | Out-Null
Write-Host "Directory created: $IISPath" -ForegroundColor Green
Write-Host ""

# Step 3: Copy files
Write-Host "Step 3: Copying files..." -ForegroundColor Green

# Copy frontend
Write-Host "Copying frontend files..." -ForegroundColor Yellow
Copy-Item -Path "frontend\dist\*" -Destination $IISPath -Recurse -Force

# Copy backend
Write-Host "Copying backend files..." -ForegroundColor Yellow
Copy-Item -Path "backend\dist\*" -Destination "$IISPath\backend" -Recurse -Force
Copy-Item -Path "backend\package.json" -Destination "$IISPath\backend" -Force
Copy-Item -Path "backend\tsconfig.json" -Destination "$IISPath\backend" -Force

# Copy database and uploads if they exist
if (Test-Path "backend\database.sqlite") {
    Copy-Item -Path "backend\database.sqlite" -Destination "$IISPath\backend" -Force
    Write-Host "Database copied." -ForegroundColor Yellow
}

if (Test-Path "backend\uploads") {
    Copy-Item -Path "backend\uploads" -Destination "$IISPath\backend" -Recurse -Force
    Write-Host "Uploads folder copied." -ForegroundColor Yellow
}

# Copy web.config
Copy-Item -Path "web.config" -Destination $IISPath -Force
Write-Host "web.config copied." -ForegroundColor Yellow

Write-Host "Files copied successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Install backend dependencies
Write-Host "Step 4: Installing backend dependencies..." -ForegroundColor Green
Set-Location "$IISPath\backend"
npm install --production
Set-Location ..\..
Write-Host "Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 5: Create/Update IIS Site
Write-Host "Step 5: Configuring IIS..." -ForegroundColor Green

Import-Module WebAdministration -ErrorAction SilentlyContinue

# Check if site exists
$site = Get-WebSite -Name $SiteName -ErrorAction SilentlyContinue

if ($site) {
    Write-Host "Site '$SiteName' already exists. Updating..." -ForegroundColor Yellow
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $IISPath
} else {
    Write-Host "Creating new IIS site '$SiteName'..." -ForegroundColor Yellow
    New-WebSite -Name $SiteName -PhysicalPath $IISPath -Port 80 -Force
}

# Set application pool to No Managed Code
$appPoolName = (Get-WebSite -Name $SiteName).applicationPool
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedRuntimeVersion -Value ""
Set-ItemProperty "IIS:\AppPools\$appPoolName" -Name managedPipelineMode -Value "Integrated"

Write-Host "IIS site configured!" -ForegroundColor Green
Write-Host ""

# Step 6: Set permissions
Write-Host "Step 6: Setting permissions..." -ForegroundColor Green

$acl = Get-Acl $IISPath
$permission = "IIS_IUSRS", "ReadAndExecute", "ContainerInherit,ObjectInherit", "None", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $IISPath $acl

# Set write permissions for uploads
if (Test-Path "$IISPath\backend\uploads") {
    $uploadAcl = Get-Acl "$IISPath\backend\uploads"
    $uploadPermission = "IIS_IUSRS", "Modify", "ContainerInherit,ObjectInherit", "None", "Allow"
    $uploadAccessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $uploadPermission
    $uploadAcl.SetAccessRule($uploadAccessRule)
    Set-Acl "$IISPath\backend\uploads" $uploadAcl
}

Write-Host "Permissions set!" -ForegroundColor Green
Write-Host ""

# Step 7: Create backend startup script
Write-Host "Step 7: Creating backend startup script..." -ForegroundColor Green

$startScript = @"
@echo off
cd /d "$IISPath\backend"
node dist/server.js
"@

$startScript | Out-File -FilePath "$IISPath\backend\start.bat" -Encoding ASCII

Write-Host "Startup script created!" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "=== Deployment Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Create backend/.env file with production settings" -ForegroundColor White
Write-Host "2. Start the backend service:" -ForegroundColor White
Write-Host "   cd $IISPath\backend" -ForegroundColor Gray
Write-Host "   node dist/server.js" -ForegroundColor Gray
Write-Host ""
Write-Host "   Or use PM2:" -ForegroundColor White
Write-Host "   pm2 start $IISPath\backend\dist\server.js --name correspondence-api" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the application at: http://localhost" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Update JWT_SECRET in backend/.env before production use!" -ForegroundColor Red
Write-Host ""

