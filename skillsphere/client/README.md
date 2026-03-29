## SkillSphere Client (React + TypeScript + Vite)

Frontend for **SkillSphere — Intelligent Hyperlocal Freelance Ecosystem**.

### Features (currently implemented)
- **Auth UX**: Register/Login, Email verification, Forgot/Reset password
- **2FA**: Setup (QR) + login verification step
- **Google Sign-In**: enabled when `VITE_GOOGLE_CLIENT_ID` is set
- **Account Status Banner**: prompts verification + 2FA enablement

### Setup
Create `skillsphere/client/.env`:
- `VITE_GOOGLE_CLIENT_ID=...` (optional)

Run:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```
