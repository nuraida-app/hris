import { Router } from "express";
import Position from "../../../models/master/Position.js";
import Department from "../../../models/master/Department.js";
import {
  created,
  notFound,
  removed,
  updated,
} from "../../../utils/Messages.js";
import { Op } from "sequelize";

const router = Router();

// Helper function untuk operasi Create/Update
router.put("/add", async (req, res) => {
  const { id } = req.body;

  try {
    if (id) {
      const position = await Position.findOne({ where: { id } });

      if (!position) {
        return res.status(404).json({ message: notFound });
      }

      await position.update(req.body, {
        where: { id },
        returning: true,
      });

      res.status(200).json({ message: updated });
    } else {
      await Position.create(req.body);

      res.status(201).json({ message: created });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Read All Operation
router.get("/get-all", async (req, res) => {
  // Ambil query page, default ke 1 jika tidak ada
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const offset = (page - 1) * limit;

  // ➡️ Ambil query search
  const { search } = req.query;
  let whereClause = {}; // Inisialisasi object WHERE clause

  // ➡️ Logika Search
  if (search) {
    // Mencari berdasarkan nama Position atau nama Department (nested WHERE)
    whereClause = {
      [Op.or]: [
        // 1. Search berdasarkan Nama Position
        {
          name: {
            [Op.iLike]: `%${search}%`, // Gunakan Op.iLike untuk pencarian case-insensitive (PostgreSQL)
            // Jika menggunakan MySQL/SQLite, ganti Op.iLike dengan Op.like
          },
        },
        // 2. Search berdasarkan Nama Department (menggunakan model yang di-include)
        // Sequelize menangani ini dengan membuat subquery atau JOIN yang sesuai
        {
          "$Department.name$": {
            // '$NamaModel.Kolom$' adalah sintaks untuk mengakses kolom model yang di-include
            [Op.iLike]: `%${search}%`,
          },
        },
      ],
    };
  }

  try {
    const { count, rows: positions } = await Position.findAndCountAll({
      where: whereClause, // ➡️ Aplikasikan WHERE clause untuk search
      limit: limit,
      offset: offset,
      include: [
        {
          model: Department, // Sertakan model Department
          attributes: [
            ["id", "id"],
            ["name", "dep_name"],
          ],
          required: search ? true : false, // ➡️ Penting: Jika ada search, gunakan INNER JOIN (required: true) agar filter Department.name bekerja
        },
      ],
      attributes: {
        exclude: ["departmentId", "updatedAt", "createdAt"],
      },
      // ➡️ Gunakan order jika diperlukan, misal berdasarkan nama Position
      order: [["name", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    // Format hasil
    const response = {
      total_data: count,
      positions: positions,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Read One Operation
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const position = await Position.findByPk(id);
    if (position) {
      res.status(200).json(position);
    } else {
      res.status(404).json({ message: notFound });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Operation
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const count = await Position.destroy({
      where: { id },
    });

    if (count > 0) {
      res.status(200).json({ message: removed });
    } else {
      res.status(404).json({ message: notFound });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
