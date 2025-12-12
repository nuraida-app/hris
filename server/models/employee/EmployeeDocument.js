import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class EmployeeDocument extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, { foreignKey: "employeeId" });
  }
}

EmployeeDocument.init(
  {
    documentType: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Contoh: "KTP", "Ijazah", "Kontrak Kerja"
    filePath: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    expiryDate: { type: DataTypes.DATEONLY }, // Berguna untuk kontrak/SIP/STR
  },
  {
    sequelize: db,
    modelName: "EmployeeDocument",
    tableName: "employee_documents",
    underscored: true,
  }
);

export default EmployeeDocument;
