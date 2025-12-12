import { Router } from "express";
import Holiday from "../../../models/master/Holiday.js";
import {
  created,
  notFound,
  removed,
  updated,
} from "../../../utils/Messages.js";

const router = Router();

// Create or Update Holiday
router.post("/add", async (req, res) => {
  const { id } = req.body;
  try {
    if (id) {
      // Update logic
      const holiday = await Holiday.findOne({ where: { id } });
      if (!holiday) {
        return res.status(404).json({ message: notFound });
      }
      await Holiday.update(req.body, { where: { id } });
      res.status(200).json({ message: updated });
    } else {
      // Create logic
      await Holiday.create(req.body);
      res.status(201).json({ message: created });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Holidays
router.get("/get-all", async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query; // Ambil parameter dari query
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const offset = (pageNumber - 1) * limitNumber;

  // Kondisi pencarian
  const searchCondition = search
    ? {
        name: {
          [Op.iLike]: `%${search}%`, // Menggunakan Op.iLike untuk pencarian case-insensitive di PostgreSQL
        },
      }
    : {};

  try {
    const { count, rows } = await Holiday.findAndCountAll({
      where: searchCondition, // Terapkan kondisi pencarian
      limit: limitNumber,
      offset: offset,
      order: [["startDate", "ASC"]], // Opsional: Urutkan berdasarkan tanggal mulai
    });

    // Kirim data dan informasi paginasi
    res.status(200).json({ data: rows, total: count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Get Holiday By Id
router.get("/:id", async (req, res) => {
  try {
    const holiday = await Holiday.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!holiday) {
      return res.status(404).json({ message: notFound });
    }
    res.status(200).json(holiday);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Holiday
router.delete("/:id", async (req, res) => {
  try {
    const holiday = await Holiday.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!holiday) {
      return res.status(404).json({ message: notFound });
    }
    await Holiday.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: removed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
