# AuraFlow — Team Task Manager

A full-stack team task management web application with role-based access control, a Kanban board, project management, and team collaboration features.

---

## ✨ Key Features

- **Dynamic, Modern UI** — Clean, edge-to-edge layout built with vanilla CSS. Includes a professional sidebar, floating background orbs, staggered animations, count-up stats, and interactive shimmer loaders.
- **Light & Dark Mode** — Full system-wide theme toggling with smooth transitions that persists across sessions.
- **Authentication** — Secure JWT-based signup & login. First registered user is automatically assigned the Admin role.
- **Role-Based Access Control** — 
  - **Admins** can create projects, manage all tasks/members, and promote members. 
  - **Members** can view projects, comment, and update the status of tasks assigned to them.
- **Kanban Board** — Per-project board with four columns: To Do, In Progress, Review, and Done. Features hover lifts and glowing status badges.
- **Task Management** — Create tasks with title, description, priority, assignee, and due date. Tasks automatically highlight when overdue.
- **Team Notes (Comments)** — Leave comments on any task for team collaboration.
- **Profile Management** — Update name, email, and manage passwords (with live password strength meters).
- **Admin Dashboard** — Manage all tasks, projects, and users from a dedicated, restricted admin panel.

---

## 🛠️ Tech Stack

### Backend
| Package | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Token (JWT) | Authentication tokens |
| bcryptjs | Password hashing |
| express-validator | Input validation |
| dotenv | Environment config |
| cors | Cross-origin requests |

### Frontend
| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| React Router DOM 7 | Client-side routing |
| Axios | HTTP requests |
| date-fns | Date formatting & comparison |
| lucide-react | Icon library |
| react-hot-toast | Toast notifications |

---

## 📁 Project Structure

```
AuraFlow/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Route handler logic
│   │   ├── middleware/        # JWT verification, admin guard
│   │   ├── models/            # Mongoose schemas (User, Task, Project, Comment)
│   │   ├── routes/            # Express routers
│   │   ├── index.js           # App entry point
│   │   └── seed.js            # Sample data seeder
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI (Layout, Sidebar)
    │   ├── context/           # AuthContext, ThemeContext
    │   ├── pages/             # App Pages (Dashboard, Auth, Projects, Profile, Admin)
    │   ├── utils/             # api.js (Axios instance with auth interceptor)
    │   ├── App.jsx
    │   ├── index.css          # Global CSS variables, animations, and styles
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB running locally (default: `mongodb://127.0.0.1:27017`)

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd AuraFlow
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/auraflow
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend dev server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

> **Optional:** Seed sample data (projects, tasks, members):
> ```bash
> node src/seed.js
> ```

---

### 3. Set up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register a new user |
| POST | `/login` | Public | Login and receive JWT |
| GET | `/me` | Auth | Get current user info |

### Projects — `/api/projects`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List all projects |
| GET | `/:id` | Auth | Get a project by ID |
| POST | `/` | Admin | Create a new project |

### Tasks — `/api/tasks`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List tasks (filter by `projectId`, `assigneeId`, `status`) |
| GET | `/:id` | Auth | Get a task by ID |
| POST | `/` | Auth | Create a task |
| PATCH | `/:id` | Auth | Update a task (full edit for author/admin, status-only for assignee) |
| DELETE | `/:id` | Auth | Delete a task (author or admin only) |

### Comments — `/api/comments`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/:taskId` | Auth | Get all comments for a task |
| POST | `/` | Auth | Add a comment |
| DELETE | `/:id` | Auth | Delete a comment (author or admin only) |

### Users (Members) — `/api/users`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List all members |
| DELETE | `/:id` | Admin | Delete a member |
| PATCH | `/:id/promote` | Admin | Promote a member to admin |
| PATCH | `/me/profile` | Auth | Update current user profile (name, email) |
| PATCH | `/me/password` | Auth | Change current user password |

---

## 🔐 Role Permissions

| Action | Admin | Member (Author) | Member (Assignee) |
|---|:---:|:---:|:---:|
| Create project | ✅ | ❌ | ❌ |
| Create task | ✅ | ✅ | ✅ |
| Edit task fully | ✅ | ✅ | ❌ |
| Update task status | ✅ | ✅ | ✅ |
| Delete task | ✅ | ✅ | ❌ |
| Manage members | ✅ | ❌ | ❌ |
| Access admin panel | ✅ | ❌ | ❌ |

---

## License

MIT
