import { Router } from "express";
import { Op, Sequelize } from "sequelize";
import {
  Employee,
  Department,
  LeaveRequest,
  AttendanceLog,
  User,
  Position,
} from "../../models/index.js"; // Pastikan path model benar

const router = Router();

// Helper untuk format tanggal YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split("T")[0];

/**
 * GET /api/dashboard/summary
 * Mengambil angka ringkasan (Total Pegawai, Total Dept, Cuti Pending)
 */
router.get("/summary", async (req, res) => {
  try {
    const [totalEmployees, activeEmployees, totalDepartments, pendingLeaves] =
      await Promise.all([
        // 1. Total Semua Pegawai
        Employee.count(),

        // 2. Pegawai Aktif (Tidak Resign)
        Employee.count({
          where: { status: { [Op.ne]: "resigned" } },
        }),

        // 3. Total Departemen
        Department.count(),

        // 4. Jumlah Cuti Menunggu Approval
        LeaveRequest.count({
          where: { status: "pending" },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        totalDepartments,
        pendingLeaves,
      },
    });
  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ message: "Gagal mengambil data summary" });
  }
});

/**
 * GET /api/dashboard/attendance-today
 * Statistik Absensi HARI INI
 */
router.get("/attendance-today", async (req, res) => {
  try {
    const today = getTodayDate();

    // Hitung kehadiran berdasarkan status hari ini
    const attendanceStats = await AttendanceLog.findAll({
      where: { date: today },
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "total"],
      ],
      group: ["status"],
    });

    const formattedStats = {
      present: 0,
      late: 0,
      absent: 0,
      permission: 0,
    };

    attendanceStats.forEach((item) => {
      const status = item.getDataValue("status");
      const total = Number(item.getDataValue("total"));
      if (formattedStats[status] !== undefined) {
        formattedStats[status] = total;
      }
    });

    // Hitung yang BELUM absen
    const totalActive = await Employee.count({
      where: { status: { [Op.ne]: "resigned" } },
    });
    const recordedAttendance =
      formattedStats.present +
      formattedStats.late +
      formattedStats.permission +
      formattedStats.absent;
    const notClockedIn = Math.max(0, totalActive - recordedAttendance);

    res.json({
      success: true,
      date: today,
      data: {
        ...formattedStats,
        not_clocked_in: notClockedIn,
      },
    });
  } catch (error) {
    console.error("Attendance Stats Error:", error);
    res.status(500).json({ message: "Gagal mengambil statistik absensi" });
  }
});

/**
 * GET /api/dashboard/employee-demographics
 */
router.get("/employee-demographics", async (req, res) => {
  try {
    // 1. Group by Employment Status
    const statusStats = await Employee.findAll({
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // 2. Group by Gender
    const genderStats = await Employee.findAll({
      attributes: [
        "gender",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["gender"],
    });

    res.json({
      success: true,
      data: {
        byStatus: statusStats,
        byGender: genderStats,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil demografi pegawai" });
  }
});

/**
 * GET /api/dashboard/pending-leaves
 * List 5 pengajuan cuti terbaru yang statusnya 'pending'
 */
router.get("/pending-leaves", async (req, res) => {
  try {
    const requests = await LeaveRequest.findAll({
      where: { status: "pending" },
      limit: 5,
      // Menggunakan 'created_at' karena model di-set underscored: true
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Employee,
          as: "employee", // <--- PERBAIKAN DI SINI (Wajib pakai alias)
          attributes: ["fullName", "nip"],
          include: [
            { model: Department, as: "department", attributes: ["name"] },
          ],
        },
      ],
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Pending Leaves Error:", error);
    res.status(500).json({ message: "Gagal mengambil data cuti" });
  }
});

/**
 * GET /api/dashboard/new-hires
 */
router.get("/new-hires", async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const newEmployees = await Employee.findAll({
      where: {
        joinDate: {
          [Op.gte]: startOfMonth,
        },
      },
      limit: 5,
      order: [["joinDate", "DESC"]],
      attributes: ["fullName", "joinDate", "status"],
      include: [{ model: Position, as: "position", attributes: ["name"] }],
    });

    res.json({
      success: true,
      data: newEmployees,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Gagal mengambil data karyawan baru" });
  }
});

export default router;
