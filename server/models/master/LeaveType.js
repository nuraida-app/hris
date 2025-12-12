import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class LeaveType extends Model {
  static associate(models) {
    // Satu jenis cuti bisa digunakan di banyak pengajuan
    this.hasMany(models.LeaveRequest, { foreignKey: "leaveTypeId" });
  }
}

LeaveType.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Opsional: Jatah hari default (misal: Tahunan = 12)
    defaultQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: "LeaveType",
    tableName: "leave_types",
    underscored: true,
  }
);

export default LeaveType;
