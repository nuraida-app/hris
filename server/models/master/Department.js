import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class Department extends Model {
  static associate(models) {
    // 1 Departemen punya banyak Posisi & Karyawan
    this.hasMany(models.Position, { foreignKey: "departmentId" });
    this.hasMany(models.Employee, { foreignKey: "departmentId" });
  }
}

Department.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize: db,
    modelName: "Department",
    tableName: "departments",
    underscored: true, // Agar kolom created_at otomatis pakai underscore
  }
);

export default Department;
