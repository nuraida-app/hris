import { Router } from "express";
import Department from "../../models/master/Department.js";
import Position from "../../models/master/Position.js";
import { created, notFound, removed, updated } from "../../utils/Messages.js";

const router = Router();

router.get("/dep-filter", async (req, res) => {
  try {
    const departments = await Department.findAll({
      attributes: ["id", "name"], // Ambil field yang perlu saja agar ringan
      include: [
        {
          model: Position,
          attributes: ["id", "name", "level"], // Ambil field posisi yang perlu saja
          // Jika Anda ingin mengurutkan posisi di dalam departemen (misal berdasarkan level)
          // order: [['level', 'ASC']]
        },
      ],
      order: [["name", "ASC"]], // Urutkan nama departemen A-Z
    });

    res.status(200).json(departments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Create or Update Department
router.post("/add", async (req, res) => {
  const { id } = req.body;
  try {
    if (id) {
      // Update logic
      const department = await Department.findOne({ where: { id } });
      if (!department) {
        return res.status(404).json({ message: notFound });
      }
      await Department.update(req.body, { where: { id } });
      res.status(200).json({ message: updated });
    } else {
      // Create logic
      const department = await Department.create(req.body);
      res.status(201).json({ message: created });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Departments
router.get("/get-all", async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Department By Id
router.get("/:id", async (req, res) => {
  try {
    const department = await Department.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!department) {
      return res.status(404).json({ message: notFound });
    }
    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Department
router.delete("/:id", async (req, res) => {
  try {
    const department = await Department.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!department) {
      return res.status(404).json({ message: notFound });
    }
    await Department.destroy({
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
