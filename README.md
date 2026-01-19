# نظام المكاتبات والخطابات الرسمية
# Official Correspondence & Letters Management System

A production-ready full-stack web application for managing official correspondence and letters for the Egyptian government holding company (الشركة القابضة للصناعات الغذائية).

## Technology Stack

### Backend
- Node.js (Latest LTS)
- Express.js
- SQLite with Sequelize ORM
- JWT Authentication (Access & Refresh Tokens)
- Role-Based Access Control (RBAC)
- Multer for file uploads
- Swagger (OpenAPI 3.0)

### Frontend
- React 18 with Vite
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Axios for API calls
- React Router
- i18next for internationalization (Arabic & English)
- Zustand for state management

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/          # Database & Swagger config
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, error handling, upload
│   │   ├── migrations/      # Database migrations
│   │   ├── models/          # Sequelize models
│   │   ├── routes/          # API routes
│   │   ├── seeders/         # Database seeders
│   │   ├── utils/           # Utilities (JWT, password, etc.)
│   │   ├── validators/      # Zod validation schemas
│   │   └── server.ts        # Express server
│   ├── uploads/             # File uploads directory
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── i18n/           # Internationalization
│   │   ├── lib/            # Utilities & API client
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   └── App.tsx        # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
DB_STORAGE=./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
UPLOAD_MAX_SIZE=10485760
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:5173
```

5. Run migrations:
```bash
npm run migrate
```

6. Run seeders:
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:3000`
Swagger documentation: `http://localhost:3000/api-docs`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Running Both Together

From the root directory:
```bash
npm install
npm run dev
```

## Default Login Credentials

After running seeders, you can login with:

- **Admin**: `admin` / `admin123`
- **Reviewer**: `reviewer1` / `admin123`
- **Employee**: `employee1` / `admin123`

## Features

### Core Features
- ✅ User authentication with JWT
- ✅ Role-based access control (Admin, Reviewer, Employee, Viewer)
- ✅ Incoming & Outgoing correspondence management
- ✅ Full CRUD operations for correspondences
- ✅ File attachments (PDF, Word, Images)
- ✅ Reply threads
- ✅ Status tracking and history
- ✅ Review workflow
- ✅ Search and filtering
- ✅ Pagination
- ✅ Arabic & English support (RTL/LTR)
- ✅ Dashboard with statistics
- ✅ Entity management
- ✅ User management (Admin only)
- ✅ Audit logging

### API Endpoints

All endpoints are prefixed with `/api/v1`

- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `GET /correspondences` - List correspondences
- `GET /correspondences/:id` - Get correspondence details
- `POST /correspondences` - Create correspondence
- `PUT /correspondences/:id` - Update correspondence
- `DELETE /correspondences/:id` - Delete correspondence
- `POST /correspondences/:id/reply` - Add reply
- `PATCH /correspondences/:id/status` - Update status
- `POST /correspondences/:id/review` - Review correspondence
- `POST /attachments/:id` - Upload attachment
- `GET /attachments/:id/download` - Download attachment
- `GET /entities` - List entities
- `GET /users` - List users (Admin only)
- `GET /dashboard/stats` - Get dashboard statistics

Full API documentation available at `/api-docs` when server is running.

## Production Build

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`. Serve them with a static file server or integrate with your backend.

## Database Schema

The system uses a fully normalized relational schema with:
- Users & Roles (RBAC)
- Entities (Companies/Authorities)
- Correspondences
- Correspondence Replies
- Attachments
- Status History
- Audit Logs

All tables include soft deletes, timestamps, and proper foreign key relationships.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based permissions
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection protection (Sequelize ORM)

## License

This project is proprietary software for the Egyptian government holding company.

