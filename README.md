# 🕹️ TASKY 2.0 — AI MISSION CONTROL RETRO-ARCADE SYSTEM

Welcome to **Tasky 2.0**! 👾 
Tasky 2.0 is a next-generation productivity hub that transforms task management into a 90s cyber-arcade game. It features a fully responsive neon-cyberpunk visual design, custom AI model analysis, voice integration, dynamic categories, and real-time gamification.

---

## 🚀 Key Upgrades in Tasky 2.0

### 1. 👾 AI Mission Control (Gemini 3.5 Flash Integration)
Tasky 2.0 connects directly to the **Google Gemini 3.5 Flash** model to analyze raw user objectives and structure them into actionable plans.
*   **Simple Intent (`create_task`)**: If you type or speak a basic request like *"I need to buy milk tomorrow by 4 PM"*, the AI automatically parses the target title, extracts context details, sets the category to `groceries`, sets priority to `high`, and calculates the relative target deadline.
*   **Complex Intent (`create_mission`)**: If you enter a large goal like *"Prepare for React exam"*, the AI breaks down the plan into a multi-step mission proposal, listing subtasks, step-by-step descriptions, and targeted categories, and submits it to your **Approval Queue** for verification.
*   **Realtime Debug Log Console & Percentage Tracker**: When analyzing prompts, a custom-designed terminal overlay opens in the frontend, simulating real-time system log sequences and loading status percentage metrics (0% to 100%) in a retro command-line aesthetic.

### 2. 🎙️ Dual Voice Pipeline (Dictate vs. Execute)
Integrating the browser's Web Speech Recognition API, Tasky 2.0 supports two voice-activated features:
*   **Speak to Run (`🎙️ SPEAK TO RUN`)**: Captures speech, automatically submits the transcript directly to the AI model, executes the parser, and adds the tasks to your board instantly.
*   **Speak to Type (`🎙️ Dictate`)**: Located directly inside the input textarea box. It appends your speech to the text field in real-time as you talk, allowing you to edit the prompt before executing.

### 3. 🏆 Gamification Engine (XP, Levels, and Streaks)
Tasky 2.0 turns productivity into a game:
*   **XP Rewards**: Completing tasks awards experience points (XP) based on task priority (25 XP for medium, 50 XP for high, 100 XP for urgent).
*   **Milestones & Level-Up**: Automatically triggers flashing Level-up animations and canvas-confetti explosions on crossing level thresholds.
*   **Streak Trackers**: Automatically counts consecutive days with completed tasks, logging and preserving your longest streak achievements.

### 4. 📂 Dynamic Categories & Smart Filters
*   **Dynamic Categories**: Fully user-customizable. Create custom categories with custom icons/emojis, delete them, or click pin (`📌`) to lock them at the top of your sidebar list.
*   **Safety Fallback**: Deleting a category updates any tasks inside it to the system default `'other'` category, ensuring zero broken filters.
*   **Smart Filters**: Quick-views for `IMPORTANT` (high/urgent priority), `DUE TODAY`, and `OVERDUE` tasks.

---

## 🛠️ Technology Stack

### Frontend Architecture
*   **Core**: React (built with Vite)
*   **Styling**: Vanilla CSS featuring CRT scanline screen effects, neon glow dropshadows, glassmorphic card containers, and cyber-arcade visual theme.
*   **State & Routing**: React Context API, custom hooks, and state-bound views.
*   **HTTP Client**: Axios (configured with request and response interceptors to automatically attach JWT headers and handle token refreshing).
*   **Icons**: Lucide React.
*   **VFX**: canvas-confetti.

### Backend Architecture
*   **Core Framework**: Django 5.1 & Django REST Framework (DRF)
*   **Database**: SQLite (development/testing) / PostgreSQL (production staging)
*   **Auth**: JSON Web Tokens (JWT) using `djangorestframework-simplejwt`
*   **Filters**: `django-filter` integration for parameters query mapping.
*   **API Client**: Requests (communicating with Google Gemini 3.5 Flash).
*   **Testing**: Pytest & Pytest-Django (28 unit tests covering model constraints, auth, XP events, and AI fallback states).

---

## 📦 Project Directory Layout

```text
retro-task-manager/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # UI Components (AIAssistant, CategorySidebar, TaskModal, XPBar, etc.)
│   │   ├── services/         # Axios interceptors (api.js)
│   │   ├── context/          # Auth context provider
│   │   ├── pages/            # Core views (DashboardPage, LoginPage, RegisterPage)
│   │   └── index.css         # Visual Styles (neon tokens, CRT styles, mobile media queries)
│   └── package.json
└── backend/                  # Django Backend
    ├── config/               # Settings & URL configuration
    ├── tasks/                # Main tasks app
    │   ├── ai/               # AI Service module (service.py, classifier.py, prompts.py, parser.py)
    │   ├── models.py         # Category, Task, UserProfile, XPEvent models
    │   ├── serializers.py    # Serializers & validation methods
    │   └── views.py          # Viewsets and endpoint logic
    ├── tests/                # Automated pytest files
    ├── manage.py
    └── requirements.txt
```

---

## ⚙️ Local Development Setup

### 1. Backend Configuration
From the `backend/` directory:
1.  Initialize a python virtual environment:
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```text
    SECRET_KEY=django-insecure-retro-task-manager-dev-key
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
4.  Generate database migrations and migrate:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```
5.  Start the development server:
    ```bash
    python manage.py runserver
    ```
    Backend will run at `http://127.0.0.1:8000`.

### 2. Frontend Configuration
From the `frontend/` directory:
1.  Install packages:
    ```bash
    npm install
    ```
2.  Start the Vite dev server:
    ```bash
    npm run dev
    ```
    Frontend will open at `http://localhost:5173`.

### 3. Running Backend Tests
From the `backend/` directory:
```bash
.\venv\Scripts\pytest
```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.
