# 🔐 Vault Drive — Backend

A secure and scalable backend for a full-stack file management system.

Vault Drive is a full-stack file management system that allows users to securely **upload, store, organize, manage, search, share, and access their files**.

This repository contains the backend of VaultDrive, built with **Node.js, Express.js, PostgreSQL, and Supabase**, providing REST APIs for authentication, file management, folder organization, sharing, permissions, search, pagination, and more.

---

## ✨ Features

- 🔐 JWT-based authentication
- 🔑 Secure password hashing with bcrypt
- 🌐 Google OAuth configuration through Supabase Auth
- 📤 File upload and storage using Supabase Storage
- 📁 File management and metadata handling
- 📂 Hierarchical folder organization
- 🗑️ Soft delete and trash recovery
- 🤝 File sharing through secure shareable links
- 🛡️ User-specific file permissions
- 🔗 Temporary signed URLs
- 🔎 PostgreSQL full-text search
- ⚡ Database query optimization and indexing
- 📄 Pagination and lazy-loading support
- 🧪 Automated testing using Jest and Supertest
- 📬 API testing using Postman

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Backend runtime |
| **Express.js** | REST API framework |
| **PostgreSQL** | Relational database |
| **Supabase** | Database and file storage |
| **JavaScript** | Backend language |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **Multer** | File upload handling |
| **Jest** | Automated testing |
| **Supertest** | API testing |
| **Postman** | Manual API testing |

---

## 📁 Project Structure

    Backend/
    │
    ├── docs/
    │   ├── day-1/
    │   ├── day-2/
    │   ├── day-3/
    │   ├── day-4/
    │   ├── day-5/
    │   ├── day-6/
    │   └── day-7/
    │
    ├── server/
    │   ├── config/
    │   ├── controllers/
    │   ├── middleware/
    │   └── routes/
    │
    ├── tests/
    │
    ├── index.js
    ├── package.json
    └── ...

---

# 🔐 Authentication

VaultDrive uses **JWT-based authentication** to protect user-specific resources.

### Implemented

- User registration
- Password hashing with bcrypt
- User login
- JWT token generation
- JWT authentication middleware
- Protected API routes
- Protected profile endpoint
- Google OAuth configuration through Supabase Auth

### Authentication Endpoints

    POST /api/auth/register
    POST /api/auth/login
    GET  /api/auth/profile

📸 **Documentation:**  
[View Day 2 — Authentication](docs/day-2/)

---

# 📤 File Upload & Storage

Files are uploaded using **Multer** and stored securely in **Supabase Storage**.

File metadata is stored in PostgreSQL.

### Implemented

- Multipart file upload
- Memory-based file handling
- 10 MB upload limit
- Unique storage paths
- MIME type handling
- User-specific storage organization
- PostgreSQL file metadata persistence

### Endpoint

    POST /api/files/upload

📸 **Documentation:**  
[View Day 3 — File Upload & Storage](docs/day-3/)

---

# 📁 File Management

VaultDrive provides REST APIs for managing uploaded files.

### Implemented

- Fetch files
- Rename files
- Update file information
- Move files into folders
- Soft delete files
- Retrieve file metadata

### Endpoints

    GET  /api/files
    POST /api/files/:id/delete
    POST /api/files/:id/rename
    POST /api/files/:id/update

📸 **Documentation:**  
[View Day 4 — File Management APIs](docs/day-4/)

---

# 📂 Folder Management

VaultDrive supports organizing files using folders and hierarchical folder structures.

### Implemented

- Create folders
- Fetch folders
- Rename folders
- Update folders
- Delete folders
- Parent-child folder relationships

### Endpoints

    POST /api/folders
    GET  /api/folders
    POST /api/folders/:id/rename
    POST /api/folders/:id/update
    POST /api/folders/:id/delete

📸 **Documentation:**  
[View Day 4 — Folder Management](docs/day-4/)

---

# 🤝 File Sharing & Permissions

VaultDrive allows users to share files securely and manage access permissions.

### Implemented

- Shareable file links
- Secure share tokens
- Access through share tokens
- User-specific file permissions
- Permission creation and updates

### Sharing Endpoints

    POST /api/share/:fileId
    GET  /api/share/access/:shareToken

### Permissions Endpoint

    POST /api/permissions/:fileId

📸 **Documentation:**  
[View Day 5 — Sharing & Permissions](docs/day-5/)

---

# 🔗 Signed URLs

VaultDrive generates temporary signed URLs for secure access to files stored in Supabase Storage.

### Endpoint

    POST /api/files/:fileId/signed-url

The endpoint is protected using JWT authentication.

📸 **Documentation:**  
[View Day 5 — Signed URLs](docs/day-5/)

---

# 🗑️ Trash & Recovery

VaultDrive uses **soft deletion** instead of immediately removing files and folders from the database.

Deleted items can be retrieved and restored.

### Endpoints

    POST /api/trash
    POST /api/trash/:type/:id/restore

### Implemented

- Move files to trash
- Retrieve deleted items
- Restore deleted files and folders

📸 **Documentation:**  
[View Day 4 — File Management](docs/day-4/)  
[View Day 5 — Sharing & Permissions](docs/day-5/)

---

# 🔎 Search & Optimization

VaultDrive implements **PostgreSQL full-text search** for efficient file searching.

### Implemented

- PostgreSQL full-text search
- GIN search indexing
- Database indexes
- Query optimization
- Pagination
- Lazy-loading support
- Search API

### Search

    GET /api/files/search?q=internship

### Pagination

    GET /api/files?page=1&limit=10

Pagination responses include metadata such as:

    page
    limit
    total
    totalPages
    hasNextPage
    hasPreviousPage

This allows large datasets to be loaded incrementally instead of retrieving every file at once.

📸 **Documentation:**  
[View Day 6 — Search & Optimization](docs/day-6/)

---

# 🌐 API Overview

| Module | Endpoints |
|---|---|
| **Authentication** | `/api/auth/register` · `/api/auth/login` · `/api/auth/profile` |
| **Files** | `/api/files` · `/api/files/upload` · `/api/files/:id/delete` · `/api/files/:id/rename` · `/api/files/:id/update` |
| **Folders** | `/api/folders` · `/api/folders/:id/rename` · `/api/folders/:id/update` · `/api/folders/:id/delete` |
| **Sharing** | `/api/share/:fileId` · `/api/share/access/:shareToken` |
| **Permissions** | `/api/permissions/:fileId` |
| **Trash** | `/api/trash` · `/api/trash/:type/:id/restore` |
| **Signed URLs** | `/api/files/:fileId/signed-url` |
| **Search** | `/api/files/search` |
| **Pagination** | `/api/files?page=1&limit=10` |

---

# 📅 Week 1 Development Progress

| Day | Task | Status |
|---|---|---|
| **Day 1** | Project Setup & Database Connection | ✅ Complete |
| **Day 2** | Authentication & JWT Middleware | ✅ Complete |
| **Day 3** | File Upload & Storage | ✅ Complete |
| **Day 4** | File & Folder Management APIs | ✅ Complete |
| **Day 5** | Sharing, Permissions & Signed URLs | ✅ Complete |
| **Day 6** | Search, Optimization & Pagination | ✅ Complete |
| **Day 7** | Testing & Deployment Preparation | ✅ Complete |

---

# 🧪 Testing

Backend APIs were manually tested using **Postman** throughout development.

Automated testing was implemented using **Jest and Supertest**.

### Test Coverage

- Health check
- Authentication protection
- File API authentication
- Folder API authentication
- Permission API authentication
- Share API authentication
- Signed URL authentication
- Trash authentication
- Restore authentication
- Search API authentication

### Final Test Result

    Test Suites: 7 passed, 7 total
    Tests:       10 passed, 10 total
    Snapshots:   0 total

✅ **All 7 test suites passed.**  
✅ **All 10 tests passed.**

📸 **Automated testing evidence:**  
[View Day 7 — Testing](docs/day-7/)

---

# 📬 API Testing with Postman

All backend APIs were tested manually using Postman during their respective development phases.

| Day | Testing |
|---|---|
| **Day 2** | Authentication APIs |
| **Day 3** | File Upload & Storage |
| **Day 4** | File & Folder Management |
| **Day 5** | Sharing, Permissions, Signed URLs & Trash |
| **Day 6** | Search & Pagination |
| **Day 7** | Automated Jest + Supertest testing |

Postman screenshots are maintained inside their respective day documentation folders rather than being duplicated in Day 7.

---

# 🗄️ Database

VaultDrive uses **PostgreSQL through Supabase**.

### Main Tables

- `users`
- `folders`
- `files`
- `permissions`
- `shares`

The `files` table stores metadata such as:

- File ID
- File name
- Original name
- File size
- MIME type
- Storage path
- Storage URL
- User ID
- Folder ID
- Deleted timestamp
- Created timestamp
- Updated timestamp

Folders support hierarchical organization through parent-folder relationships.

Soft deletion is implemented using the `deleted_at` field.

---

# ⚙️ Environment Variables

Create a `.env` file in the backend root:

    DATABASE_URL=your_postgresql_connection_string
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
    JWT_SECRET=your_jwt_secret
    PORT=5000

> ⚠️ **Never commit `.env` files or secret keys to GitHub.**

---

# ▶️ Running Locally

### 1. Install dependencies

    npm install

### 2. Configure environment variables

Create a `.env` file and add the required configuration.

### 3. Start the development server

    npm run dev

### 4. Start the production server

    npm start

### 5. Run automated tests

    npm test

The backend runs locally on:

    http://localhost:5000

---

# 🚀 Deployment

The backend is prepared for deployment using **Render**.

### Backend Configuration

| Setting | Value |
|---|---|
| **Service Type** | Web Service |
| **Root Directory** | `Backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

Required environment variables will be configured through the deployment platform.

The frontend can be deployed separately using **Vercel** and configured to communicate with the deployed backend URL.

---

# 📸 Documentation

Detailed implementation and testing evidence is organized day-wise inside the `docs/` directory.

- [📁 Day 1 — Project Setup](docs/day-1/)
- [📁 Day 2 — Authentication](docs/day-2/)
- [📁 Day 3 — File Upload & Storage](docs/day-3/)
- [📁 Day 4 — File Management APIs](docs/day-4/)
- [📁 Day 5 — Sharing & Permissions](docs/day-5/)
- [📁 Day 6 — Search & Optimization](docs/day-6/)
- [📁 Day 7 — Testing & Deployment](docs/day-7/)

---

# 🏆 Week 1 Backend Status

## VaultDrive Backend — Week 1 Complete 🔥

During Week 1, the VaultDrive backend was developed from initial project setup through authentication, secure file storage, file and folder management, sharing and permissions, search optimization, pagination, automated testing, and deployment preparation.

### Final Week 1 Result

**7 Test Suites Passed**  
**10 Tests Passed**  
**All Week 1 Backend Tasks Completed** ✅

The backend is now **structured, documented, tested, and ready for deployment.** 🚀