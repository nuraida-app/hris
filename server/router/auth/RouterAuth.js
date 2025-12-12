import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../models/master/User.js";
import Employee from "../../models/employee/Employee.js";
import auth from "../../middleware/authMiddleware.js";

const router = Router();

// @route   POST api/auth/login
// @desc    Login user (Admin or Employee)
// @access  Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    let user = await User.findOne({ where: { username } });
    let role = "admin";

    if (!user) {
      user = await Employee.findOne({ where: { username } });
      role = "employee";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        role: role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "your_default_secret", // Fallback for safety
      { expiresIn: "1d" },
      (err, token) => {
        if (err) throw err;

        // Return user info without password
        const userToReturn = { ...user.get({ plain: true }) };
        delete userToReturn.password;

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.json({ message: "Berhasil Login", user: userToReturn });
      }
    );
  } catch (err) {
    console.error("error: ", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/auth/me
// @desc    Load current user data
// @access  Private
router.get("/load", auth, async (req, res) => {
  try {
    let user;
    if (req.user.role === "admin") {
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
    } else if (req.user.role === "employee") {
      user = await Employee.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });
    }

    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan" });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logout successful" });
});

export default router;
