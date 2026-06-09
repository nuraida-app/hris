import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../../models/master/User.js";
import auth from "../../middleware/authMiddleware.js";
import {
  JWT_SECRET,
  COOKIE_OPTIONS,
  buildAuthUser,
} from "./authHelpers.js";

const router = Router();
const signToken = promisify(jwt.sign);

// @route   POST api/auth/login
// @desc    Login user (admin, hr_staff, employee)
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password) {
    return res.status(400).json({ message: "Username dan password wajib diisi" });
  }

  try {
    const user = await User.findOne({
      where: { username: username.trim() },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Username atau password salah" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Akun Anda dinonaktifkan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Username atau password salah" });
    }

    const token = await signToken(
      { user: { id: user.id, role: user.role } },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const authUser = await buildAuthUser(user);

    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ message: "Login berhasil", user: authUser });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// @route   GET api/auth/load
// @desc    Load current authenticated user
// @access  Private
router.get("/load", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    if (!user.isActive) {
      res.clearCookie("token", COOKIE_OPTIONS);
      return res.status(403).json({ message: "Akun Anda dinonaktifkan" });
    }

    const authUser = await buildAuthUser(user);
    res.json(authUser);
  } catch (err) {
    console.error("Load user error:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Public
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logout berhasil" });
});

export default router;
