import { Router } from "express";
import { Op } from "sequelize";
import db from "../../../config/config.js";
import {
  LeaveRequest,
  LeaveType,
  Employee,
  User,
  Department,
  Position,
} from "../../../models/index.js";
// Import String Constants dari Messages.js
import {
  created,
  notFound,
  removed,
  updated,
} from "../../../utils/Messages.js"; //
import authorizeRole from "../../../middleware/authorizeRole.js";

const router = Router();

/**
 * =====================================================================
 * BAGIAN 1: MASTER DATA JENIS CUTI (Leave Types)
 * Path: /types
 * =====================================================================
 */

// [GET] List Semua Jenis Cuti
router.get("/types", authorizeRole(["admin", "hr_staff"]), async (req, res) => {
  try {
    const whereClause = req.user.role === "admin" ? {} : { isActive: true };
    const types = await LeaveType.findAll({
      where: whereClause,
      order: [["name", "ASC"]],
    });
    res.status(200).json(types);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// [POST] Tambah Jenis Cuti Baru (Admin Only)
router.post(
  "/types",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { name, description, defaultQuota } = req.body;
      const newType = await LeaveType.create({
        name,
        description,
        defaultQuota,
      });

      // Perbaikan: Menggunakan string 'created' dari Messages.js
      res.status(201).json({ message: created, data: newType });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// [PUT] Edit Jenis Cuti
router.put(
  "/types/:id",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, defaultQuota, isActive } = req.body;

      const type = await LeaveType.findByPk(id);
      if (!type) {
        // Perbaikan: Menggunakan string 'notFound'
        return res.status(404).json({ message: notFound });
      }

      await type.update({ name, description, defaultQuota, isActive });

      // Perbaikan: Menggunakan string 'updated'
      res.status(200).json({ message: updated, data: type });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// [DELETE] Hapus Jenis Cuti
router.delete(
  "/types/:id",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const isUsed = await LeaveRequest.count({ where: { leaveTypeId: id } });
      if (isUsed > 0) {
        return res.status(400).json({
          message:
            "Gagal hapus. Jenis cuti ini sudah digunakan dalam transaksi.",
        });
      }

      const type = await LeaveType.findByPk(id);
      if (!type) {
        return res.status(404).json({ message: notFound });
      }

      await type.destroy();

      // Perbaikan: Menggunakan string 'removed'
      res.status(200).json({ message: removed });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * =====================================================================
 * BAGIAN 2: TRANSAKSI PENGAJUAN CUTI (Leave Requests)
 * =====================================================================
 */

// [GET] Helper: List Pegawai Pengganti
router.get(
  "/substitutes",
  authorizeRole(["admin", "hr_staff", "employee"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const employees = await Employee.findAll({
        include: [
          {
            model: User,
            as: "account",
            where: { id: { [Op.ne]: userId } },
            attributes: [],
          },
        ],
        attributes: ["id", "fullName", "nip"],
      });
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// [POST] Buat Pengajuan Cuti (Transaction)
router.post(
  "/request",
  authorizeRole(["admin", "hr_staff", "employee"]),
  async (req, res) => {
    const t = await db.transaction();
    try {
      ``;
      const userId = req.user.id;
      const employee = await Employee.findOne({ where: { userId } });

      if (!employee) {
        await t.rollback();
        return res
          .status(404)
          .json({ message: "Data pegawai tidak ditemukan" });
      }

      const { leaveTypeId, substituteEmployeeId, startDate, endDate, reason } =
        req.body;

      // Validasi Jenis Cuti
      const typeExists = await LeaveType.findByPk(leaveTypeId, {
        transaction: t,
      });
      if (!typeExists || !typeExists.isActive) {
        await t.rollback();
        return res.status(400).json({ message: "Jenis cuti tidak valid" });
      }

      // Validasi Pengganti
      if (substituteEmployeeId) {
        const subExists = await Employee.findByPk(substituteEmployeeId, {
          transaction: t,
        });
        if (!subExists) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: "Pegawai pengganti tidak ditemukan" });
        }
        if (subExists.id === employee.id) {
          await t.rollback();
          return res
            .status(400)
            .json({ message: "Pengganti tidak boleh diri sendiri" });
        }
      }

      const newLeave = await LeaveRequest.create(
        {
          employeeId: employee.id,
          leaveTypeId,
          substituteEmployeeId,
          startDate,
          endDate,
          reason,
          status: "pending",
        },
        { transaction: t }
      );

      await t.commit();

      // Perbaikan: Menggunakan string 'created'
      res.status(201).json({ message: created, data: newLeave });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }
);

// [GET] Riwayat Saya
router.get(
  "/my-history",
  authorizeRole(["admin", "hr_staff", "employee"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const employee = await Employee.findOne({ where: { userId } });

      if (!employee) return res.status(404).json({ message: notFound });

      const history = await LeaveRequest.findAll({
        where: { employeeId: employee.id },
        order: [["created_at", "DESC"]],
        include: [
          { model: LeaveType, as: "leaveType", attributes: ["name"] },
          { model: Employee, as: "substitute", attributes: ["fullName"] },
          { model: User, as: "approver", attributes: ["name"] },
        ],
      });

      res.status(200).json(history);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * =====================================================================
 * BAGIAN 3: APPROVAL (Admin / HR)
 * =====================================================================
 */

// [GET] Semua Request
router.get(
  "/all-requests",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    try {
      const requests = await LeaveRequest.findAll({
        order: [["created_at", "DESC"]],
        include: [
          {
            model: Employee,
            as: "employee",
            attributes: ["fullName", "nip"],
            include: [
              { model: Department, as: "department", attributes: ["name"] },
              { model: Position, as: "position", attributes: ["name"] },
            ],
          },
          { model: LeaveType, as: "leaveType", attributes: ["name"] },
          { model: Employee, as: "substitute", attributes: ["fullName"] },
          { model: User, as: "approver", attributes: ["name"] },
        ],
      });
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// [PUT] Approval
router.put(
  "/approval/:id",
  authorizeRole(["admin", "hr_staff"]),
  async (req, res) => {
    const t = await db.transaction();
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      const leaveRequest = await LeaveRequest.findByPk(id, { transaction: t });
      if (!leaveRequest) {
        await t.rollback();
        return res.status(404).json({ message: notFound });
      }

      if (!["approved", "rejected"].includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: "Status invalid" });
      }

      leaveRequest.status = status;
      leaveRequest.approvedBy = req.user.id;
      leaveRequest.rejectionReason =
        status === "rejected" ? rejectionReason : null;

      await leaveRequest.save({ transaction: t });
      await t.commit();

      // Perbaikan: Menggunakan string 'updated'
      res.status(200).json({ message: updated, data: leaveRequest });
    } catch (error) {
      await t.rollback();
      res.status(500).json({ message: error.message });
    }
  }
);

// [GET] Detail
router.get(
  "/detail/:id",
  authorizeRole(["admin", "hr_staff", "employee"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = await LeaveRequest.findByPk(id, {
        include: [
          { model: Employee, as: "employee", attributes: ["fullName", "nip"] },
          {
            model: LeaveType,
            as: "leaveType",
            attributes: ["name", "description"],
          },
          { model: Employee, as: "substitute", attributes: ["fullName"] },
        ],
      });

      if (!data) return res.status(404).json({ message: notFound });

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
