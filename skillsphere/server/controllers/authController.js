import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { generateSecret, generateURI, verifySync } from "otplib";

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { sendEmail } from "../utils/email.js";

const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || "7d";
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

const generateTwoFactorLoginToken = (id) => {
  return jwt.sign(
    { id, purpose: "2fa_login" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
};

const randomToken = () => crypto.randomBytes(32).toString("hex");

const getClientUrl = () => process.env.CLIENT_URL || "http://localhost:5173";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const emailVerificationToken = randomToken();
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      authProvider: "local",
      isVerified: false,
      emailVerificationToken,
      emailVerificationExpiresAt,
    });

    const verifyLink = `${getClientUrl()}/verify-email?token=${emailVerificationToken}`;
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your SkillSphere account",
      text: `Welcome to SkillSphere!\n\nPlease verify your email by visiting: ${verifyLink}\n\nIf you didn't request this, you can ignore this email.`,
    });

    // For dev/testing: if SMTP isn't configured, return the token so the flow can still be tested.
    const devToken = !emailResult.ok ? emailVerificationToken : undefined;

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id), // frontend currently expects a token pattern
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      authProvider: user.authProvider,
      verificationToken: devToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token || req.body.token;
    if (!token) return res.status(400).json({ message: "Token required" });

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiresAt: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpiresAt = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND VERIFICATION
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If account exists, email will be sent." });
    if (user.isVerified) return res.json({ message: "Email already verified" });

    const emailVerificationToken = randomToken();
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpiresAt = emailVerificationExpiresAt;
    await user.save();

    const verifyLink = `${getClientUrl()}/verify-email?token=${emailVerificationToken}`;
    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your SkillSphere account",
      text: `Verify your email by visiting: ${verifyLink}`,
    });

    res.json({
      message: "Verification email sent (or token returned in dev mode).",
      verificationToken: !emailResult.ok ? emailVerificationToken : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(400).json({ message: "Use Google login for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (process.env.REQUIRE_EMAIL_VERIFIED === "true" && !user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    if (user.twoFactorEnabled) {
      const twoFactorToken = generateTwoFactorLoginToken(user._id);
      return res.json({
        requiresTwoFactor: true,
        twoFactorToken,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        authProvider: user.authProvider,
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      authProvider: user.authProvider,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY 2FA FOR LOGIN (no auth header; uses twoFactorToken from /login)
export const verify2FAForLogin = async (req, res) => {
  try {
    const { twoFactorToken, code } = req.body;
    if (!twoFactorToken || !code) {
      return res.status(400).json({ message: "twoFactorToken and code are required" });
    }

    const decoded = jwt.verify(twoFactorToken, process.env.JWT_SECRET);
    if (!decoded?.purpose || decoded.purpose !== "2fa_login") {
      return res.status(401).json({ message: "Invalid two-factor token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ message: "Two-factor not enabled" });
    }

    const check = verifySync({ token: String(code), secret: user.twoFactorSecret });
    if (!check.valid) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    if (process.env.REQUIRE_EMAIL_VERIFIED === "true" && !user.isVerified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      authProvider: user.authProvider,
    });
  } catch (error) {
    res.status(401).json({ message: error.message || "Two-factor verification failed" });
  }
};

// PASSWORD RESET
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "If account exists, a reset link will be sent." });
    }

    const passwordResetToken = randomToken();
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpiresAt = passwordResetExpiresAt;
    await user.save();

    const resetLink = `${getClientUrl()}/reset-password?token=${passwordResetToken}`;
    const emailResult = await sendEmail({
      to: email,
      subject: "Reset your SkillSphere password",
      text: `Reset your password by visiting: ${resetLink}\n\nThis link expires in 1 hour.`,
    });

    res.json({
      message: "If account exists, a reset link will be sent (or token returned in dev mode).",
      resetToken: !emailResult.ok ? passwordResetToken : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "token and newPassword are required" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GOOGLE OAUTH (expects idToken from frontend)
export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "idToken is required" });

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: "GOOGLE_CLIENT_ID not configured" });
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    let user = await User.findOne({ googleId });
    if (!user) {
      // If email exists with a local account, link provider.
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.isVerified = true;
      } else {
        user = await User.create({
          name,
          email,
          googleId,
          authProvider: "google",
          isVerified: true,
          role: "client",
        });
      }
    }

    // If local user exists but password provider is missing, keep it as google-auth.
    user.twoFactorEnabled = user.twoFactorEnabled ?? false;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
      isVerified: user.isVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      authProvider: user.authProvider,
    });
  } catch (error) {
    res.status(401).json({ message: error.message || "Google auth failed" });
  }
};

// ENABLE 2FA (returns secret + otpauthUrl; user confirms with /2fa/confirm)
export const enable2FA = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const secret = generateSecret();
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false; // pending until confirmed
    await user.save();

    const otpauthUrl = generateURI({
      label: user.email,
      issuer: "SkillSphere",
      secret,
    });

    res.json({
      message: "2FA secret generated. Confirm with the code from your authenticator app.",
      otpauthUrl,
      twoFactorSecret: secret, // for dev convenience; normally frontend would only use otpauthUrl
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CONFIRM 2FA
export const confirm2FA = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const user = await User.findById(req.user._id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA is not initialized" });
    }

    const check = verifySync({ token: String(code), secret: user.twoFactorSecret });
    if (!check.valid) {
      return res.status(401).json({ message: "Invalid verification code" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};