# 🕹️ Tasky — Retro Task Manager (Beginner-Friendly Guide)

Welcome to **Tasky**! 👾 

If you only know the basics of coding, this guide is written just for you. It explains how this entire app works from front to back, using simple words and clear analogies.

If you are a developer looking for the raw commands, configuration settings, or testing suites, check out the [Advanced Developer README](file:///f:/Projects/README_DEV.md).

---

## 💡 The "Arcade Machine" Analogy (How it all fits together)
Imagine this project is like a 90s Arcade Machine:

1. **The Frontend (React)**: This is the **arcade cabinet screen and control buttons**. It displays the flashing neon lights, the columns, and buttons you click. It doesn't store data; it only captures your clicks and shows things on the screen.
2. **The Backend (Django REST Framework)**: This is the **computer processor inside the arcade cabinet**. When you click a button on the screen, the screen sends a signal to the processor. The processor decides if you are allowed to make a move (security check) and processes the math.
3. **The Database (PostgreSQL)**: This is the **high-score memory chip**. It stores the data permanently so that when you turn the machine off and on, your tasks and account are still there.

---

## 📂 Project Structure Made Simple

Here is how the project folders are laid out:

```text
retro-task-manager/
├── frontend/             # 🎨 The React Frontend (The Screen & Buttons)
│   ├── src/
│   │   ├── components/   # Small UI pieces (cards, buttons, headers)
│   │   ├── context/      # The "Brain" that remembers if you are logged in
│   │   ├── pages/        # The screens (Login Page, Dashboard Page)
│   │   └── index.css     # The styling sheet containing the retro neon colors
└── backend/              # ⚙️ The Django Backend (The Computer Processor)
    ├── config/           # General settings, URLs, and connections
    ├── tasks/            # The custom app containing all Task logic
    │   ├── models.py     # Defines what a "Task" looks like in the database
    │   ├── views.py      # The instructions on what to do when a user requests data
    │   └── serializers.py# Translates database rows into JSON text so React can read it
```

---

## 🗄️ How the Database Stores Your Data

The database has two folders (tables) that talk to each other:

1. **User Table (`auth_user`)**: Stores user accounts.
   - Every user gets a unique ID, a username, and an encrypted password.
2. **Task Table (`tasks_task`)**: Stores all the cards on the board.
   - Each task has: `title`, `description`, `status` (To Do, In Progress, Done), and `priority`.
   - **Crucial Link (`owner`)**: Every task points to the specific User ID who created it. This is a **One-to-Many Relationship** (One user can have many tasks, but a task belongs to only one user).

---

## 🔑 The Login Flow: How Security Works (JWT)

We use **JSON Web Tokens (JWT)** to secure the app. Here is the step-by-step path:

1. **Sign Up**: You create a new account in React. The backend receives it, encrypts your password, and saves you to the database.
2. **Log In**: You type your username and password. The backend checks it. If correct, the backend gives the frontend a digital security badge (called an **Access Token**).
3. **Fetching Tasks**: When React asks the backend, *"Give me my tasks"*, it attaches that security badge in the header of the request.
4. **Owner Verification**: The backend inspects the badge, identifies who you are, and runs a command equivalent to:
   `SELECT * FROM tasks WHERE owner = you;`
   If you try to view another user's tasks, the backend blocks it and sends back a `403 Forbidden` error.

---

## 📋 The Kanban Board & Drag-and-Drop

A Kanban board divides your screen into columns: **To Do**, **In Progress**, and **Completed**.

### How Drag-and-Drop Works:
1. When you grab a task card and move it, React's drag-and-drop listener registers that you pick up card `#15`.
2. When you release your mouse over the "In Progress" column, React immediately changes the card's column on your screen so the interface feels lightning-fast (this is called **Optimistic UI**).
3. In the background, React sends a quick message to the backend: *"Hey, update Task #15's status to 'in_progress'"*.
4. The database updates the row.
5. **Mobile Friendly**: Drag-and-drop can be hard on touchscreens. To make it work on phones, we also made it so tapping a card moves it to the next column!

---

## 🚀 How to Run the App (Quickstart)

If you have downloaded the code, here is how you run it locally:

### 1. Run the Backend (Python)
Open your terminal and run:
```bash
cd backend
python -m venv venv
# Activate it (on Windows: .\venv\Scripts\Activate.ps1) (on Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Your backend will start running at `http://127.0.0.1:8000`.

### 2. Run the Frontend (React)
Open a second terminal window and run:
```bash
cd frontend
npm install
npm run dev
```
Your website will open at `http://localhost:5173`. Open it in your browser and start managing your tasks!
