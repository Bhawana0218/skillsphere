## SkillSphere — Intelligent Hyperlocal Freelance Ecosystem (NAYODA)

SkillSphere is a full‑stack **MERN** platform designed to connect **clients** with **freelancers** in a **hyperlocal** environment.  
It includes **AI-powered matching**, **milestone payments**, **reputation scoring**, **real-time collaboration**, and **admin analytics** to create an industry-grade freelance ecosystem.

---

### Core Roles
- **Client**: Post projects, define milestones, invite freelancers, manage payments, review outcomes.
- **Freelancer**: Build a professional profile/portfolio, apply with proposals, collaborate, complete milestones, grow reputation.
- **Admin**: Verification, moderation, fraud monitoring, platform analytics and governance.

---

### Advanced Modules (Project Scope)

#### 1) Multi‑Role Authentication System (RBAC)
- Multi-role authentication: Client / Freelancer / Admin
- Role-based access control (RBAC)
- Google OAuth login
- Email verification system
- Password reset with token
- Two-Factor Authentication (2FA)

#### 2) AI‑Powered Job Matching (HuggingFace)
- Skill similarity scoring
- Personalized freelancer recommendations
- Trending skills detection
- Hyperlocal ranking (distance + availability + reputation)

#### 3) Freelancer Professional Profiles
- Skills with proficiency levels
- Portfolio gallery
- Resume upload
- Certifications
- Work experience timeline
- Availability calendar
- Pricing (hourly + milestone)
- Verification badge system

#### 4) Gig / Project Marketplace
- Create gigs with budget ranges
- Define milestones
- Attach documents
- Invite freelancers
- Track progress

#### 5) Proposal & Bidding System
- Proposal description
- Bid amount
- Estimated completion time
- Client accepts / rejects / negotiates

#### 6) Real‑Time Chat + Collaboration (Socket.IO)
- Messaging, typing indicators, read receipts
- File sharing
- Optional WebRTC video calls

#### 7) Secure Payment System (Razorpay)
- Escrow-like milestone payments
- Release on approval
- Refund management
- Transaction history

#### 8) Smart Reputation & Review System
- Weighted reputation score (verified work has higher weight)
- Review analytics
- Fraud signals for fake reviews

#### 9) Admin Dashboard
- Manage users, suspend accounts, verify freelancers
- Approve gigs/projects
- Payment monitoring
- Fraud detection
- Analytics: revenue, active users, top categories, success rate

#### 10) Advanced Search Engine
- Location-based search
- Skill-based filtering
- Price, rating, experience filters
- MongoDB Atlas Search (recommended) or ElasticSearch

#### 11) Notification System
- Real-time notifications (Socket.IO)
- Email notifications
- Events: new gig, proposal accepted, payment received, review added

#### 12) Freelancer Availability Scheduler
- Availability slots
- Booking system
- Auto scheduling

#### 13) Dispute Resolution System
- Dispute request + evidence upload
- Admin mediation + resolution workflow

#### 14) Project Progress Tracker
- Task completion percentage
- File uploads
- Progress logs
- Deadline reminders

#### 15) Freelancer Analytics Dashboard
- Profile views
- Applications
- Earnings statistics
- Monthly revenue chart
- Client feedback analytics

---

### Repo Structure
- `skillsphere/server` — Express + MongoDB + Socket.IO + Razorpay integrations
- `skillsphere/client` — React + TypeScript + Vite + Tailwind

---

### Quick Start (Local)

#### Server
1. Create `skillsphere/server/.env` (see example keys below)
2. Install and run:

```bash
cd skillsphere/server
npm install
npm start
```

#### Client
1. Create `skillsphere/client/.env`:
- `VITE_GOOGLE_CLIENT_ID=...` (optional, enables Google Sign-In UI)

2. Install and run:

```bash
cd skillsphere/client
npm install
npm run dev
```

---

### Environment Variables (Server)

Minimum:
- `PORT=5000`
- `MONGO_URI=...`
- `JWT_SECRET=...`
- `CLIENT_URL=http://localhost:5173`

Razorpay:
- `RAZORPAY_KEY_ID=...`
- `RAZORPAY_KEY_SECRET=...`

Google OAuth:
- `GOOGLE_CLIENT_ID=...`

Email (SMTP) for verification/reset emails:
- `EMAIL_HOST=...`
- `EMAIL_PORT=...`
- `EMAIL_USER=...`
- `EMAIL_PASS=...`
- `EMAIL_FROM="SkillSphere <no-reply@skillsphere.com>"`

Optional (strict mode):
- `REQUIRE_EMAIL_VERIFIED=true`

