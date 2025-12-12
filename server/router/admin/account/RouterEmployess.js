import { Router } from "express";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import db from "../../../config/config.js";
import {
  created,
  notFound,
  removed,
  updated,
} from "../../../utils/Messages.js";
import authorizeRole from "../../../middleware/authorizeRole.js";
import fs from "fs";
import path from "path";
import multer from "multer";

// Import Semua Model Terkait
import User from "../../../models/master/User.js";
import Employee from "../../../models/employee/Employee.js";
import Department from "../../../models/master/Department.js";
import Position from "../../../models/master/Position.js";
import FamilyMember from "../../../models/employee/FamilyMember.js"; // Pastikan file ini ada
import EmployeeDocument from "../../../models/employee/EmployeeDocument.js"; // Pastikan file ini ada
import CareerHistory from "../../../models/employee/CareerHistory.js";
import EducationHistory from "../../../models/employee/EducationHistory.js";
import TrainingHistory from "../../../models/employee/TrainingHistory.js";

const router = Router();

// --- KONFIGURASI MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "server/assets/";
    // Pastikan folder root assets ada
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Penamaan file unik: timestamp-namaasli
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB (Opsional)
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Hanya file Gambar dan Dokumen (PDF/Word) yang diperbolehkan!"
        )
      );
    }
  },
});

// =========================================================================
// 1. GET ALL (List Pegawai untuk Tabel Utama)
// =========================================================================
router.get(
  "/get-all",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const searchCondition = search
        ? {
            [Op.or]: [
              { fullName: { [Op.iLike]: `%${search}%` } },
              { nip: { [Op.iLike]: `%${search}%` } },
              { "$account.username$": { [Op.iLike]: `%${search}%` } },
            ],
          }
        : {};

      const { count, rows } = await Employee.findAndCountAll({
        where: searchCondition,
        include: [
          {
            model: User,
            as: "account",
            attributes: ["id", "username", "email", "role", "isActive"],
          },
          { model: Department, as: "department", attributes: ["name"] },
          { model: Position, as: "position", attributes: ["name"] },
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / parseInt(limit)),
          currentPage: parseInt(page),
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =========================================================================
// 2. GET DETAIL (Core HR Profile View)
// Mengambil Data Lengkap (Biodata, Keluarga, Dokumen, riwayat jabatan)
// =========================================================================
router.get(
  "/detail/:id",
  authorizeRole(["admin", "hr_staff", "employee"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findByPk(id, {
        include: [
          // 1. Akun Login
          {
            model: User,
            as: "account",
            attributes: ["id", "username", "email", "role", "isActive"],
          },
          // 2. Jabatan & Dept Saat Ini
          { model: Department, as: "department", attributes: ["id", "name"] },
          {
            model: Position,
            as: "position",
            attributes: ["id", "name", "level"],
          },

          // 3. Core HR Data
          { model: FamilyMember },
          { model: EmployeeDocument },

          // 4. Riwayat Karir
          {
            model: CareerHistory,
            include: [
              { model: Department, attributes: ["name"] },
              { model: Position, attributes: ["name"] },
            ],
          },

          // 5. RIWAYAT PENDIDIKAN (BARU)
          {
            model: EducationHistory,
            as: "educations", // Sesuai alias di Employee.js
          },
          {
            model: TrainingHistory,
            as: "trainings", // Sesuai alias di Employee.js
          },
        ],
        order: [
          [CareerHistory, "startDate", "DESC"],
          [
            { model: EducationHistory, as: "educations" },
            "graduationYear",
            "DESC",
          ],
          // Urutkan Pelatihan (Tahun terbaru diatas)
          [{ model: TrainingHistory, as: "trainings" }, "year", "DESC"],
        ],
      });

      if (!employee) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// =========================================================================
// 3. CREATE & UPDATE EMPLOYEE (Main Profile + Financial/Legal)
// =========================================================================
router.post("/save", authorizeRole(["admin"]), async (req, res) => {
  const t = await db.transaction();
  try {
    const {
      id,
      // User Account
      username,
      email,
      password,
      role,
      // Basic Info
      nip,
      fullName,
      joinDate,
      status,
      gender,
      phone,
      address,
      departmentId,
      positionId,
      // Core HR: Personal & Identity
      placeOfBirth,
      dateOfBirth,
      maritalStatus,
      religion,
      bloodType,
      identityNumber,
      // Core HR: Financial & Legal
      bankName,
      bankAccountNumber,
      bankAccountHolder,
      npwp,
      bpjsKetenagakerjaan,
      bpjsKesehatan,
    } = req.body;

    // --- UPDATE ---
    if (id) {
      // 1. Ambil data lama untuk pengecekan perubahan jabatan
      const employee = await Employee.findByPk(id, { include: ["account"] });
      if (!employee) {
        await t.rollback();
        return res.status(404).json({ message: "Data tidak ditemukan" });
      }

      // Cek apakah ada perubahan Jabatan atau Departemen
      const oldPositionId = employee.positionId;
      const oldDepartmentId = employee.departmentId;
      const isPositionChanged = oldPositionId !== positionId;
      const isDeptChanged = oldDepartmentId !== departmentId;

      // 2. Update Data Employee Utama
      await employee.update(
        {
          nip,
          fullName,
          joinDate,
          status,
          gender,
          phone,
          address,
          departmentId,
          positionId,
          placeOfBirth,
          dateOfBirth,
          maritalStatus,
          religion,
          bloodType,
          identityNumber,
          bankName,
          bankAccountNumber,
          bankAccountHolder,
          npwp,
          bpjsKetenagakerjaan,
          bpjsKesehatan,
        },
        { transaction: t }
      );

      // 3. Update Data Akun (User)
      if (employee.account) {
        const userUpdate = { username, email, role };
        if (password) {
          const salt = await bcrypt.genSalt(10);
          userUpdate.password = await bcrypt.hash(password, salt);
        }
        await employee.account.update(userUpdate, { transaction: t });
      }

      // 4. LOGIKA CAREER HISTORY (Jika ada perubahan posisi/dept)
      if (isPositionChanged || isDeptChanged) {
        const today = new Date();

        // A. Tutup history lama (isi endDate)
        await CareerHistory.update(
          { endDate: today },
          {
            where: { employeeId: id, endDate: null }, // Cari yg masih aktif
            transaction: t,
          }
        );

        // B. Tentukan Tipe Mutasi
        let historyType = "transfer"; // Default pindah dept
        if (isPositionChanged) {
          // Bisa dikembangkan logikanya (misal cek level naik/turun), sementara anggap promosi
          historyType = "promoted";
        }

        // C. Buat History Baru
        await CareerHistory.create(
          {
            employeeId: id,
            departmentId: departmentId, // Dept Baru
            positionId: positionId, // Posisi Baru
            startDate: today,
            type: historyType,
            notes: isPositionChanged
              ? "Perubahan Jabatan"
              : "Mutasi Departemen",
          },
          { transaction: t }
        );
      }

      await t.commit();
      return res.status(200).json({ message: "Data berhasil diperbarui" });
    }

    // --- CREATE (Onboarding Awal) ---
    else {
      // 1. Cek Duplikasi Akun
      const existingUser = await User.findOne({
        where: { [Op.or]: [{ email }, { username }] },
      });
      if (existingUser) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Email atau Username sudah ada." });
      }

      // 2. Buat User
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = await User.create(
        {
          name: fullName,
          username,
          email,
          password: hashedPassword,
          role: role || "employee",
          isActive: true,
        },
        { transaction: t }
      );

      // 3. Buat Employee
      const newEmployee = await Employee.create(
        {
          userId: newUser.id,
          nip,
          fullName,
          joinDate,
          status,
          gender,
          phone,
          address,
          departmentId,
          positionId,
          // Field opsional Core HR bisa diisi di sini jika ada di req.body
          placeOfBirth,
          dateOfBirth,
          maritalStatus,
          religion,
          bloodType,
          identityNumber,
          bankName,
          bankAccountNumber,
          bankAccountHolder,
          npwp,
          bpjsKetenagakerjaan,
          bpjsKesehatan,
        },
        { transaction: t }
      );

      // 4. LOGIKA CAREER HISTORY (HIRED)
      // Otomatis catat sejarah "Hired" saat pegawai baru dibuat
      await CareerHistory.create(
        {
          employeeId: newEmployee.id,
          departmentId: departmentId,
          positionId: positionId,
          startDate: joinDate || new Date(), // Gunakan tgl gabung
          type: "hired",
          notes: "Bergabung Pertama Kali",
        },
        { transaction: t }
      );

      await t.commit();
      return res
        .status(201)
        .json({ message: "Pegawai baru berhasil ditambahkan" });
    }
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// =========================================================================
// 4. FAMILY MEMBER MANAGEMENT (Sub-Feature)
// Endpoint: /api/employee/family/save
// =========================================================================
router.post(
  "/family/save",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const {
        id,
        employeeId,
        name,
        relation,
        dob,
        gender,
        isEmergencyContact,
        phone,
      } = req.body;

      if (id) {
        // Edit Anggota Keluarga
        await FamilyMember.update(
          { name, relation, dob, gender, isEmergencyContact, phone },
          { where: { id } }
        );
        return res.status(200).json({ message: "Data keluarga diperbarui" });
      } else {
        // Tambah Anggota Keluarga Baru
        await FamilyMember.create({
          employeeId,
          name,
          relation,
          dob,
          gender,
          isEmergencyContact,
          phone,
        });
        return res
          .status(201)
          .json({ message: "Anggota keluarga ditambahkan" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/family/delete/:id",
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      await FamilyMember.destroy({ where: { id: req.params.id } });
      res.status(200).json({ message: "Data keluarga dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =========================================================================
// 5. DOCUMENT MANAGEMENT
// Endpoint: /api/employee/document/save
// Catatan: Asumsi upload file ditangani middleware 'upload' (multer) sebelumnya
// dan me-return path file di req.file.path / req.body.filePath
// =========================================================================
router.post(
  "/document/save",
  authorizeRole(["admin", "hr_staff"]),
  upload.single("file"), // Middleware Multer
  async (req, res) => {
    try {
      const { employeeId, documentType, description, expiryDate } = req.body;
      const file = req.file;

      if (!file) {
        return res
          .status(400)
          .json({ message: "File dokumen wajib diupload." });
      }

      // 1. Ambil Data Pegawai untuk nama folder
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        // Hapus file yang sudah terlanjur diupload jika pegawai tidak ketemu
        fs.unlinkSync(file.path);
        return res.status(404).json({ message: "Pegawai tidak ditemukan." });
      }

      // 2. Buat Folder Berdasarkan Nama User (Sanitize nama agar aman untuk folder)
      const safeName = employee.fullName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      const targetDir = `server/assets/${safeName}`;

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // 3. Pindahkan file dari temp folder (server/assets) ke folder user
      const oldPath = file.path;
      const newFilename = file.filename;
      const newPath = path.join(targetDir, newFilename);

      fs.renameSync(oldPath, newPath);

      // 4. Simpan Path ke Database (Simpan relative path agar mudah diakses frontend)
      // Contoh simpan: "assets/budi_santoso/123123-file.pdf"
      const dbFilePath = `assets/${safeName}/${newFilename}`;

      await EmployeeDocument.create({
        employeeId,
        documentType,
        description,
        expiryDate:
          expiryDate === "null" || expiryDate === "" ? null : expiryDate,
        filePath: dbFilePath,
      });

      res
        .status(201)
        .json({ message: "Dokumen berhasil disimpan", filePath: dbFilePath });
    } catch (error) {
      // Cleanup file jika error database
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/document/delete/:id",
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      // 1. Cari data dokumen dulu
      const document = await EmployeeDocument.findByPk(req.params.id);

      if (!document) {
        return res.status(404).json({ message: "Dokumen tidak ditemukan" });
      }

      // 2. Hapus File Fisik
      // filePath di DB: "assets/nama_user/file.pdf"
      // Kita perlu tambahkan prefix "server/" karena kode berjalan di root server
      const fullPath = path.join("server", document.filePath);

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath); // Hapus file
      } else {
        console.warn(
          `File fisik tidak ditemukan di: ${fullPath}, menghapus record database saja.`
        );
      }

      // 3. Hapus Record Database
      await document.destroy();

      res
        .status(200)
        .json({ message: "Dokumen dan file fisik berhasil dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =========================================================================
// 6. DELETE EMPLOYEE (Full Cleanup)
// =========================================================================
router.delete("/delete/:id", authorizeRole(["admin"]), async (req, res) => {
  const t = await db.transaction();
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);

    if (!employee) {
      await t.rollback();
      return res.status(404).json({ message: "Employee not found" }); // Pastikan variable notFound didefinisikan atau ganti string
    }

    if (employee.userId) {
      await User.destroy({ where: { id: employee.userId }, transaction: t });
    }
    await employee.destroy({ transaction: t });

    await t.commit();

    // Jika removed() function error, dia akan lari ke catch,
    // tapi karena sudah commit, kita tidak boleh rollback lagi.
    res.status(200).json({ message: removed });
  } catch (error) {
    // PERBAIKAN DI SINI:
    // Hanya rollback jika transaksi belum selesai (belum commit/rollback)
    if (!t.finished) {
      await t.rollback();
    }
    console.error(error); // Penting untuk melihat jika error sebenarnya berasal dari res.json
    res.status(500).json({ message: error.message });
  }
});

// =========================================================================
// 7. EDUCATION HISTORY MANAGEMENT (Sub-Feature)
// Endpoint: /api/employee/education/save
// =========================================================================
router.post(
  "/education/save",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const {
        id, // Jika ada ID, berarti edit
        employeeId,
        level,
        institutionName,
        major,
        graduationYear,
        gpa,
        city,
        notes,
      } = req.body;

      if (id) {
        // --- UPDATE EXISTING ---
        const edu = await EducationHistory.findByPk(id);
        if (!edu) {
          return res
            .status(404)
            .json({ message: "Data pendidikan tidak ditemukan" });
        }

        await edu.update({
          level,
          institutionName,
          major,
          graduationYear,
          gpa,
          city,
          notes,
        });

        return res.status(200).json({ message: "Data pendidikan diperbarui" });
      } else {
        // --- CREATE NEW ---
        await EducationHistory.create({
          employeeId,
          level,
          institutionName,
          major,
          graduationYear,
          gpa,
          city,
          notes,
        });

        return res.status(201).json({ message: "Data pendidikan ditambahkan" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Delete Education
router.delete(
  "/education/delete/:id",
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const deleted = await EducationHistory.destroy({
        where: { id: req.params.id },
      });
      if (!deleted)
        return res.status(404).json({ message: "Data tidak ditemukan" });
      res.status(200).json({ message: "Data pendidikan dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// =========================================================================
// 8. TRAINING HISTORY MANAGEMENT
// Endpoint: /api/employee/training/save
// =========================================================================
router.post(
  "/training/save",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const {
        id, // Jika ada ID = Update
        employeeId,
        trainingName,
        organizer,
        year,
        certificateNo,
        notes,
      } = req.body;

      if (id) {
        // Update
        const training = await TrainingHistory.findByPk(id);
        if (!training) {
          return res
            .status(404)
            .json({ message: "Data pelatihan tidak ditemukan" });
        }
        await training.update({
          trainingName,
          organizer,
          year,
          certificateNo,
          notes,
        });
        return res.status(200).json({ message: "Data pelatihan diperbarui" });
      } else {
        // Create
        await TrainingHistory.create({
          employeeId,
          trainingName,
          organizer,
          year,
          certificateNo,
          notes,
        });
        return res.status(201).json({ message: "Data pelatihan ditambahkan" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }
);

router.delete(
  "/training/delete/:id",
  authorizeRole(["admin"]),
  async (req, res) => {
    try {
      const deleted = await TrainingHistory.destroy({
        where: { id: req.params.id },
      });
      if (!deleted)
        return res.status(404).json({ message: "Data tidak ditemukan" });
      res.status(200).json({ message: "Data pelatihan dihapus" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
