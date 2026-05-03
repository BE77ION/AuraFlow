# AuraFlow — Premium Team Task Manager

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c6fef?style=for-the-badge&logo=rocket)](https://auraflow-app.up.railway.app/auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](https://opensource.org/licenses/MIT)

AuraFlow is a state-of-the-art team task management platform designed for modern workflows. Built with a focus on visual excellence and high performance, it features a glassmorphic dark-mode interface, robust role-based access control, and intuitive project management.

---

## 🎨 Design & Aesthetic

AuraFlow isn't just a tool; it's an experience.
- **Glassmorphic UI** — Subtle blurs, semi-transparent surfaces, and glowing accents create a premium "floating" feel.
- **Dynamic Dark Mode** — A carefully curated dark palette that reduces eye strain while maintaining high contrast for readability.
- **Micro-Animations** — Staggered entry animations, hover lifts, and smooth state transitions using CSS transforms and transitions.
- **Responsive & Edge-to-Edge** — A fully responsive layout with a professional sidebar that adapts to any screen size.

---

## ✨ Key Features

- **Project & Kanban Management** — Organize tasks into projects with a dedicated Kanban board (To Do, In Progress, Review, Done).
- **Advanced Role-Based Access Control (RBAC)** — 
  - **Admins** have full control: create projects, manage all tasks/members, and **Promote/Demote** users.
  - **Members** collaborate by creating tasks, updating assigned task statuses, and commenting.
- **Real-time Stats** — Interactive dashboards with count-up statistics and visual progress indicators.
- **Secure Authentication** — JWT-based auth with secure password hashing and live password strength validation.
- **Team Collaboration** — Threaded comments on tasks for seamless team communication.
- **Profile Customization** — Users can manage their identity, update passwords, and view their assigned workload.

---

## 🛠️ Tech Stack

### Backend
| Technology | Description |
|---|---|
| **Node.js & Express 5** | High-performance REST API |
| **MongoDB & Mongoose** | Flexible NoSQL database & modeling |
| **JWT & BcryptJS** | Secure authentication & hashing |
| **Express Validator** | Robust server-side input validation |

### Frontend
| Technology | Description |
|---|---|
| **React 19 & Vite** | Modern UI framework & lightning-fast builds |
| **Vanilla CSS** | Custom design system with zero bloat |
| **Lucide React** | Sleek, consistent iconography |
| **Axios** | Optimized API communication with interceptors |
| **React Hot Toast** | Elegant, non-intrusive notifications |

---

## 📁 Project Structure

```bash
AuraFlow/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic handlers
│   │   ├── middleware/        # JWT & RBAC guards
│   │   ├── models/            # Database schemas
│   │   ├── routes/            # API endpoints
│   │   └── index.js           # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI elements
    │   ├── context/           # Global state (Auth, Theme)
    │   ├── pages/             # Main application views
    │   ├── utils/             # API client & helpers
    │   ├── index.css          # Core design system
    │   └── App.jsx            # Routing & Layout
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas)

### 2. Installation

```bash
# Clone the repo
git clone https://github.com/BE77ION/AuraFlow.git
cd AuraFlow

# Install Backend dependencies
cd backend && npm install

# Install Frontend dependencies
cd ../frontend && npm install
```

### 3. Environment Setup

Create a `.env` in the `backend/` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/auraflow
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

### 4. Running the App

```bash
# Run Backend (from /backend)
npm run dev

# Run Frontend (from /frontend)
npm run dev
```

---

## 🌐 API Reference

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Auth | List all members |
| PATCH | `/:id/promote` | Admin | Promote user to Admin |
| PATCH | `/:id/demote` | Admin | Demote Admin to Member |
| DELETE | `/:id` | Admin | Remove member |
| PATCH | `/me/profile` | Auth | Update profile details |

### Projects & Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/projects` | Admin | Create a project |
| GET | `/api/tasks` | Auth | List/Filter tasks |
| PATCH | `/api/tasks/:id`| Auth | Update task/status |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [BE77ION](https://github.com/BE77ION)
