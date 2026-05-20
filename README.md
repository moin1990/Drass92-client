# 💡 IdeaVault – Startup Idea Sharing Platform

**Live Site:** [https://ideavault.vercel.app](https://ideavault.vercel.app)  
**Server API:** [https://ideavault-api.onrender.com](https://ideavault-api.onrender.com)

IdeaVault is a modern, community-driven platform where entrepreneurs, developers, and dreamers share startup ideas, gather real feedback, and collaborate to transform concepts into reality.

---

## ✨ Key Features

- **Idea Submission & Discovery** — Submit detailed startup ideas with title, description, category, problem statement, proposed solution, target audience, estimated budget, and tags. Browse all ideas with real-time search by title and filter by category.

- **Community Comment System** — Engage with any idea through a full comment system. Add, edit (via modal), and delete your own comments with confirmation dialogs and toast notifications on every action.

- **Secure JWT Authentication** — Firebase Auth handles Email/Password and Google OAuth login. The server verifies Firebase ID tokens via Firebase Admin SDK and issues its own JWT stored in an httpOnly cookie — fully protected from XSS.

- **Dark / Light Theme** — Toggle between dark and light mode from the navbar. Theme persists across sessions via localStorage with zero flash on reload, respecting OS preference as a fallback.

- **My Dashboard** — Manage your own ideas (edit via modal, delete with confirmation) and view all your interactions (comments) across the community from dedicated private pages.

- **Trending Algorithm** — The home page surfaces the 6 most-discussed ideas using a MongoDB sort on `commentCount` and `createdAt` — real community engagement drives visibility.

- **Bookmark System** — Save interesting ideas to your personal collection and access them anytime from your profile.

- **Profile Management** — Update your display name and profile photo. Changes propagate to Firebase Auth, MongoDB, and all existing ideas and comments in real time.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Client** | React 18, Vite, TailwindCSS, ShadCN UI, Axios, React Router v6, React Hot Toast |
| **Auth** | Firebase Authentication (Email/Password + Google OAuth) |
| **Server** | Node.js, Express.js, MongoDB (Atlas), JWT, Firebase Admin SDK |
| **Security** | httpOnly cookies, Helmet, express-rate-limit, Firebase token verification |
| **Deployment** | Vercel (client) + Render (server) + MongoDB Atlas |

---

## 🚀 Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account
- Firebase project with Email/Password + Google enabled

### Client
```bash
cd ideavault-client
npm install
cp .env.example .env   # fill in your Firebase keys
npm run dev            # http://localhost:5173
```

### Server
```bash
cd ideavault-server
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secret, Firebase Admin keys
npm run dev            # http://localhost:5000
```

---

## 📁 Project Structure

ideavault-client/     React + Vite frontend
ideavault-server/     Node.js + Express API

---

## 🔒 Environment Variables

**Client `.env`** — copy from `.env.example`, fill Firebase config  
**Server `.env`** — copy from `.env.example`, fill MongoDB URI + JWT secret + Firebase Admin SDK credentials

---

## 📸 Screenshots

> Add screenshots after deployment.

---

## 👤 Author

Built for the MERN Stack assignment.