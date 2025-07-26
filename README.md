# Google Login with Email Verification 🔐

A secure Node.js authentication system using Google OAuth 2.0 with 6-digit email verification.

## 🌟 Features
- **Google OAuth 2.0** login
- **6-digit email verification** code
- Session management
- Responsive UI
- Profile dashboard

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/ialwaysw1n/2FA-Google-Login.git
cd repo
npm install
```

### 2. Google Cloud Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)

2. Create project → APIs & Services → Credentials

3. Create OAuth 2.0 Web Application credentials

4. Add authorized URIs:
```bash
http://localhost:3000
http://localhost:3000/auth/google/callback
```

### 3. Email Setup

1. Enable [2-Step Verification](https://myaccount.google.com/security)

2. Generate [App Password](https://myaccount.google.com/apppasswords)


### 4. Configure `.env`

```bash
GOOGLE_CLIENT_ID=YOUR_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_SECRET_HERE
SESSION_SECRET=ANY_COMPLEX_CHARACTERS_YOU_WANT
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=PASSWORD
BASE_URL=http://localhost:3000
```

### 5 Run Dev Server

```bash
node app.js
```

Visit `http://localhost:3000`

Made with ❤️ by ialwaysw1n
