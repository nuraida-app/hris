import { Router } from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import User from "../../models/master/User.js";
import { created, notFound, removed, updated } from "../../utils/Messages.js";
import authorizeRole from "../../middleware/authorizeRole.js";

const router = Router();

router.get("/get-all", authorizeRole(["admin"]), async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const whereCondition = {
      role: "admin",
      isActive: true,
      ...(search && {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    const { count, rows: admins } = await User.findAndCountAll({
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [["username", "ASC"]],
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "role",
        "isActive",
        "createdAt",
      ],
    });

    return res.status(200).json({ admins, totalData: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/add", authorizeRole(["admin"]), async (req, res) => {
  // 1. Tambahkan 'name' di destructuring req.body
  const { id, name, username, email, password, isActive } = req.body;

  try {
    // Hash password jika ada (untuk create atau update password)
    let hash;
    if (password) {
      hash = await bcrypt.hash(password, 12);
    }

    // --- 1. Logika UPDATE (Jika ID Disediakan) ---
    if (id) {
      const updateData = {};

      // 2. Tambahkan logika update untuk 'name'
      if (name) updateData.name = name;
      if (username) updateData.username = username;
      if (email) updateData.email = email;

      if (typeof isActive !== "undefined") updateData.isActive = isActive;

      if (password) {
        updateData.password = hash;
      }

      const [updatedRows] = await User.update(updateData, {
        where: { id: id, role: "admin" },
        returning: true,
      });

      if (updatedRows === 0) {
        return res.status(404).json({ message: notFound });
      }

      const updatedAdmin = await User.findOne({
        where: { id: id, role: "admin" },
        attributes: [
          "id",
          "name", // Pastikan name dikembalikan
          "username",
          "email",
          "role",
          "isActive",
          "createdAt",
        ],
      });

      return res.status(200).json({ message: updated });
    }

    // --- 2. Logika CREATE (Jika ID Tidak Disediakan) ---
    else {
      // 3. Tambahkan validasi untuk 'name'
      if (!name || !username || !email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Nama, Username, email, dan password wajib diisi untuk membuat admin baru.",
        });
      }

      await User.create({
        name: name, // 4. Masukkan 'name' ke dalam query create
        username,
        email,
        password: hash,
        role: "admin",
        isActive: true, // Default true saat create
      });

      return res.status(201).json({ message: created });
    }
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Username atau email sudah terdaftar.",
      });
    }
    console.error("Error in add/update admin:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await User.findOne({
      where: { id: id, role: "admin" },
      attributes: ["id", "username", "email", "role", "isActive", "createdAt"],
    });

    if (!admin) {
      return res.status(404).json({ message: notFound });
    }

    return res.status(200).json({ data: admin });
  } catch (error) {
    console.error("Error fetching admin by ID:", error);
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authorizeRole(["admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const admin = await User.findAll({
      where: { role: "admin" },
    });

    if (admin?.length === 1) {
      return res
        .status(400)
        .json({ message: "Tidak bisa menghapus admin utama" });
    }

    const deletedRows = await User.destroy({
      where: { id: id, role: "admin" },
    });

    if (deletedRows === 0) {
      return res.status(404).json({ message: notFound });
    }

    return res.status(200).json({ message: removed });
  } catch (error) {
    console.error("Error deleting admin:", error);
    return res.status(500).json({ message: error.message });
  }
});

export default router;
