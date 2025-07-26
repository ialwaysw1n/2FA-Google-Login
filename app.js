require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set this to true if youre using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

const verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const verificationCode = generateVerificationCode();
    
    verificationCodes.set(req.user.emails[0].value, {
      code: verificationCode,
      expires: Date.now() + 15 * 60 * 1000,
      profile: req.user
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.user.emails[0].value,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.redirect('/');
      }
      res.redirect('/verify');
    });
  }
);

app.get('/verify', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  res.render('verify');
});

app.post('/verify', (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/');
  
  const userEmail = req.user.emails[0].value;
  const storedCode = verificationCodes.get(userEmail);
  const { code } = req.body;
  
  if (!storedCode || storedCode.code !== code) {
    return res.render('verify', { error: 'Invalid verification code' });
  }
  
  if (Date.now() > storedCode.expires) {
    verificationCodes.delete(userEmail);
    return res.render('verify', { error: 'Verification code has expired' });
  }
  
  req.session.verified = true;
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated() || !req.session.verified) {
    return res.redirect('/');
  }
  
  const userEmail = req.user.emails[0].value;
  const storedData = verificationCodes.get(userEmail);
  
  res.render('profile', { user: storedData.profile });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.redirect('/');
    }
    req.session.destroy();
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});