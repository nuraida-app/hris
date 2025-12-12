import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class LeaveRequest extends Model {
  static associate(models) {
    // 1. Yang mengajukan cuti
    this.belongsTo(models.Employee, {
      foreignKey: "employeeId",
      as: "employee",
    });

    // 2. Jenis Cuti (Relasi ke tabel baru)
    this.belongsTo(models.LeaveType, {
      foreignKey: "leaveTypeId",
      as: "leaveType",
    });

    // 3. Pegawai Pengganti (Relasi ke Employee juga, tapi sebagai substitute)
    this.belongsTo(models.Employee, {
      foreignKey: "substituteEmployeeId",
      as: "substitute",
    });

    // 4. Yang menyetujui (User/Admin)
    this.belongsTo(models.User, { foreignKey: "approvedBy", as: "approver" });
  }
}

LeaveRequest.init(
  {
    // Hapus 'leaveType' string lama, ganti relasi di associate di atas
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    rejectionReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize: db,
    modelName: "LeaveRequest",
    tableName: "leave_requests",
    underscored: true,
  }
);

export default LeaveRequest;
