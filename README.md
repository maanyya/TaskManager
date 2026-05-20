# TaskFlow - Team Task Manager

A full-stack web app where teams can manage projects, assign tasks, and track progress. Built with React, Node.js, Express, and MongoDB.

## What it does

- **Sign up and log in** as an Admin or Member
- **Admins** can create projects, add team members, create tasks, and assign them
- **Members** can view their assigned tasks and update task status (To Do → In Progress → Done)
- **Dashboard** shows task stats — total, in progress, completed, and overdue tasks
- **Project detail page** has a kanban-style board to visualize task progress
- **Role-based access** — only admins can create/delete projects and tasks, members can only update their own task status

## Tech Stack

- **Frontend**: React (Vite), React Router, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT (JSON Web Tokens) + bcrypt for passwords

## How to run locally

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd Task-Manager
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend` with:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_random_secret_string
PORT=5000
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`

## Deploying on Railway

1. Push your code to GitHub (make sure `.env` is in `.gitignore`)
2. Go to [Railway](https://railway.app) and create a new project
3. Connect your GitHub repo
4. Add these environment variables in Railway dashboard:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any random string
   - `NODE_ENV` — `production`
   - `PORT` — `5000`
5. Set the build command to: `cd frontend && npm install && npm run build && cd ../backend && npm install`
6. Set the start command to: `cd backend && node server.js`
7. Deploy and your app will be live

## Project Structure

```
Task-Manager/
├── backend/
│   ├── config/db.js          — MongoDB connection
│   ├── middleware/auth.js     — JWT auth + role check
│   ├── models/               — User, Project, Task schemas
│   ├── routes/               — API routes for auth, projects, tasks
│   └── server.js             — Express server
├── frontend/
│   ├── src/
│   │   ├── components/       — Navbar, PrivateRoute, TaskModal
│   │   ├── context/          — Auth state management
│   │   └── pages/            — Dashboard, Projects, Login, Signup
│   └── index.html
├── .gitignore
└── README.md
```

## API Endpoints

| Method | Endpoint | Who can use it | What it does |
|--------|----------|---------------|--------------|
| POST | /api/auth/signup | Anyone | Create account |
| POST | /api/auth/login | Anyone | Log in |
| GET | /api/auth/me | Logged in users | Get profile |
| GET | /api/projects | Logged in users | List your projects |
| POST | /api/projects | Admins only | Create project |
| GET | /api/projects/:id | Project members | View project + tasks |
| DELETE | /api/projects/:id | Project owner | Delete project |
| POST | /api/projects/:id/members | Project owner | Add member |
| GET | /api/tasks/dashboard | Logged in users | Dashboard stats |
| POST | /api/tasks | Admins only | Create task |
| PUT | /api/tasks/:id | Assigned user / Admin | Update task |
| DELETE | /api/tasks/:id | Admins only | Delete task |
