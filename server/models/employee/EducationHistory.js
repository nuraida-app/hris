import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class EducationHistory extends Model {
  static associate(models) {
    // Relasi: Dimiliki oleh Employee
    this.belongsTo(models.Employee, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
    });
  }
}

EducationHistory.init(
  {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    level: {
      type: DataTypes.ENUM(
        "SD",
        "SMP",
        "SMA/SMK",
        "D3",
        "S1",
        "S2",
        "S3",
        "Non-Formal"
      ),
      allowNull: false,
    },
    institutionName: {
      type: DataTypes.STRING,
      allowNull: false, // Nama Sekolah / Universitas
    },
    major: {
      type: DataTypes.STRING, // Jurusan (Bisa null untuk SD/SMP)
    },
    graduationYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gpa: {
      type: DataTypes.FLOAT, // IPK / Nilai Akhir
    },
    city: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize: db,
    modelName: "EducationHistory",
    tableName: "education_histories",
    underscored: true,
  }
);

export default EducationHistory;
