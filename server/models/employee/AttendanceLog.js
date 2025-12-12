import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class AttendanceLog extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, { foreignKey: "employeeId" });
  }
}

AttendanceLog.init(
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    clockIn: {
      type: DataTypes.DATE, // Menyimpan Tanggal + Jam
    },
    clockOut: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM("present", "late", "absent", "permission"),
      defaultValue: "absent",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
  },
  {
    sequelize: db,
    modelName: "AttendanceLog",
    tableName: "attendance_logs",
    underscored: true,
  }
);

export default AttendanceLog;
