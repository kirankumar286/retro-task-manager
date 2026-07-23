# 🕹️ RETRO_TASK — Full-Stack Task Management Application

A 90s Cyber Terminal & Arcade-themed Task Management Web Application built with a **Django REST Framework (DRF)** backend API and a retro **React (Vite)** frontend.

---

## 🚀 Tech Stack

### Backend API (`backend/`)
- **Python 3.12**
- **Django 5.1 & Django REST Framework (DRF)**
- **Authentication**: JWT via `djangorestframework-simplejwt`
- **Database**: SQLite (Development)
- **Filtering & Search**: `django-filter` & DRF `SearchFilter` / `OrderingFilter`
- **Testing**: `pytest` & `pytest-django`

### Retro Frontend (`frontend/`)
- **React (Vite)**
- **Styling**: Vanilla CSS Design System with 3D Bevel borders, CRT scanlines, Google Fonts (`Press Start 2P`, `Share Tech Mono`), and neon palette.
- **Icons & Effects**: `lucide-react`, `canvas-confetti` celebrations, custom retro SVG cursors.
- **HTTP Client**: `axios` with JWT request interceptor & token auto-refresh handling.
- **Testing**: `vitest`, `@testing-library/react`.

---

## 🛠️ Local Development Setup

### 1. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment (if not created)
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations tasks
python manage.py migrate

# Run Pytest suite
pytest

# Start Django backend dev server (runs on http://127.0.0.1:8000)
python manage.py runserver
```

### 2. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Run automated tests
npm test

# Copy environment variables
cp .env.example .env

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🧪 Manual QA Checklist

### Authentication Flow
- [x] **User Registration**: Register new user `pilot_a` with valid credentials. Verify successful JWT token issuance and automatic redirect to Dashboard.
- [x] **Duplicate Registration Prevention**: Attempt registering `pilot_a` again. Confirm retro 400 error banner appears.
- [x] **Login Flow**: Log in with valid credentials. Verify user badge appears on header with status `ONLINE`.
- [x] **Invalid Login Prevention**: Input wrong password. Confirm 401 error message display.
- [x] **Logout Flow**: Click `LOGOUT` button. Confirm token clearance from `localStorage` and redirect to Login screen.

### Task Management (CRUD)
- [x] **Create Task**: Click `+ ADD TASK`, input valid title, description, priority, and future due date. Confirm task card renders in grid with correct badges.
- [x] **Empty Title Rejection**: Attempt creating task with whitespace title. Confirm error notice appears.
- [x] **Past Due Date Rejection**: Attempt creating task with yesterday's date. Confirm rejection error notice.
- [x] **Status Toggle**: Click status button on task card (`To Do` -> `In Progress` -> `Done`). Confirm confetti explosion on completion!
- [x] **Edit Task**: Click `Edit`, update description and priority, save. Confirm card updates immediately.
- [x] **Delete Task**: Click `Delete`, confirm retro arcade confirmation modal (`CONFIRM DELETE [Y]`). Confirm card removal.

### Filtering & Search
- [x] **Status Filter**: Select `Done`. Verify only completed tasks display.
- [x] **Priority Filter**: Select `High`. Verify only high priority tasks display.
- [x] **Search Query**: Type keyword in search box. Confirm instant filter update.
- [x] **Sort Order**: Toggle sort between `Newest First`, `Oldest First`, `Due Date`. Confirm order re-sorting.
- [x] **Reset Filters**: Click `Reset Filters`. Confirm all filters clear.

### User Isolation & Security
- [x] **Cross-User Data Isolation**: Log in as `User A`. Create a task. Log in as `User B`. Verify `User B` cannot see or manipulate `User A`'s tasks.

### Mobile Responsiveness Pass
- [x] **Viewport ~375px (Phone)**: Verify single-column reflow, touch-friendly tap targets, no horizontal overflow, and hover trail disabled.
- [x] **Viewport ~768px (Tablet)**: Verify grid re-alignment and responsive navigation bar.

---

## 🌐 Deployment Guide & Architecture Rationale

### Vercel vs Backend Hosting Architecture Note

> [!IMPORTANT]
> **Why separate deployment environments?**
> Vercel is designed specifically for static site hosting, Single Page Applications (SPAs), and serverless Edge Functions. A full Django REST Framework application requires a persistent WSGI/ASGI application runner (e.g. Gunicorn/Uvicorn) and long-lived database connections, which fit naturally on container platforms like **Render**, **Railway**, or **Fly.io**.
> 
> Therefore:
> 1. **Frontend (React/Vite)** is deployed to **Vercel**.
> 2. **Backend (Django API)** is deployed separately to **Render** or **Railway**.
> 3. The Frontend communicates with the hosted Backend via the environment variable `VITE_API_URL`.

### Steps to Deploy Frontend to Vercel
1. Push this repository to GitHub.
2. Log into [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your repository and set the **Root Directory** to `frontend`.
4. Build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-app.onrender.com`
6. Click **Deploy**.

### Steps to Deploy Backend to Render / Railway
1. Create a Web Service on Render/Railway linked to the `backend/` folder.
2. Environment variables needed:
   - `SECRET_KEY` = `<strong_random_secret_key>`
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `your-backend-app.onrender.com`
   - `CORS_ALLOWED_ORIGINS` = `https://your-frontend.vercel.app`
3. Build Command: `pip install -r requirements.txt && python manage.py migrate`
4. Start Command: `gunicorn config.wsgi:application`
