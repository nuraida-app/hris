import { Router } from "express";
import { Op } from "sequelize";
import multer from "multer";
import * as XLSX from "xlsx";
import { created, notFound, removed, updated } from "../../utils/Messages.js";
import authorizeRole from "../../middleware/authorizeRole.js";
import AttendanceLog from "../../models/employee/AttendanceLog.js";
import Employee from "../../models/employee/Employee.js";

const router = Router();

// Konfigurasi Multer untuk upload file sementara di memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * GET /get-all
 * Mengambil data absensi dengan Pagination & Search (Nama Pegawai)
 */
router.get(
  "/get-all",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        startDate,
        endDate,
      } = req.query;
      const offset = (page - 1) * limit;

      // Filter kondisi tanggal
      const whereCondition = {};
      if (startDate && endDate) {
        whereCondition.date = { [Op.between]: [startDate, endDate] };
      }

      // Filter pencarian berdasarkan Nama Karyawan lewat Asosiasi
      const includeCondition = {
        model: Employee,
        attributes: ["id", "fullName", "nip"], // Ambil NIP juga
      };

      if (search) {
        includeCondition.where = {
          fullName: { [Op.iLike]: `%${search}%` },
        };
      }

      const { count, rows } = await AttendanceLog.findAndCountAll({
        where: whereCondition,
        include: [includeCondition],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["date", "DESC"],
          ["created_at", "DESC"],
        ],
      });

      res.status(200).json({
        success: true,
        data: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /save
 * Input Absensi Manual
 */
router.post("/save", authorizeRole(["admin", "hr_staff"]), async (req, res) => {
  try {
    const { employeeId, date, clockIn, clockOut, status, latitude, longitude } =
      req.body;

    const newLog = await AttendanceLog.create({
      employeeId,
      date,
      clockIn: clockIn || null,
      clockOut: clockOut || null,
      status,
      latitude,
      longitude,
    });

    res.status(201).json({ message: created });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /update/:id
 * Edit Data Absensi
 */
router.put(
  "/update/:id",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { date, clockIn, clockOut, status } = req.body;

      const log = await AttendanceLog.findByPk(id);
      if (!log) return notFound(res, "Data absensi tidak ditemukan");

      await log.update({
        date,
        clockIn,
        clockOut,
        status,
      });

      res.status(201).json({ message: updated });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * DELETE /delete/:id
 * Hapus Data Absensi
 */
router.delete(
  "/delete/:id",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const log = await AttendanceLog.findByPk(id);
      if (!log) return notFound(res, "Data absensi tidak ditemukan");

      await log.destroy();

      res.status(201).json({ message: removed });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /template
 * Download Template Excel untuk Import (MENGGUNAKAN NIP)
 */
router.get(
  "/template",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      // Header template diganti dari Email ke NIP
      const headers = [
        [
          "NIP",
          "Date (YYYY-MM-DD)",
          "Clock In (HH:mm)",
          "Clock Out (HH:mm)",
          "Status (present/late/absent/permission)",
        ],
      ];

      // Buat Workbook dummy
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headers);

      // Tambahkan contoh data menggunakan format NIP string
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          ["1001", "2025-12-01", "08:00", "17:00", "present"],
          ["1002", "2025-12-01", "08:15", "17:00", "late"],
        ],
        { origin: "A2" }
      );

      XLSX.utils.book_append_sheet(wb, ws, "Template Absensi");

      const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="Template_Absensi.xlsx"'
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /import
 * Import Data Absensi dari Excel (LOOKUP BY NIP)
 */
router.post(
  "/import",
  authorizeRole(["admin", "hr_staff"]),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, message: "File tidak ditemukan" });

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Konversi ke JSON, header di baris pertama dianggap key
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      // Proses data
      let successCount = 0;
      let failedCount = 0;

      for (const row of jsonData) {
        // Ambil kolom NIP. Pastikan dikonversi ke String agar cocok dengan database
        const nip = row["NIP"] ? String(row["NIP"]).trim() : null;
        const date = row["Date (YYYY-MM-DD)"];

        const clockInTime = row["Clock In (HH:mm)"];
        const clockOutTime = row["Clock Out (HH:mm)"];
        const status = row["Status (present/late/absent/permission)"];

        if (!nip || !date) {
          failedCount++;
          continue;
        }

        // Cari karyawan berdasarkan NIP
        const employee = await Employee.findOne({ where: { nip: nip } });

        if (employee) {
          // Konversi jam ke DateTime objek JavaScript
          const clockIn = clockInTime
            ? new Date(`${date}T${clockInTime}:00`)
            : null;
          const clockOut = clockOutTime
            ? new Date(`${date}T${clockOutTime}:00`)
            : null;

          await AttendanceLog.create({
            employeeId: employee.id,
            date,
            clockIn,
            clockOut,
            status: status || "absent",
          });
          successCount++;
        } else {
          // Jika NIP tidak ditemukan di database
          failedCount++;
        }
      }

      res.json({
        success: true,
        message: `Import selesai. Sukses: ${successCount}, Gagal: ${failedCount} (NIP tidak ditemukan atau format salah)`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Gagal memproses file excel: " + error.message,
      });
    }
  }
);

export default router;
