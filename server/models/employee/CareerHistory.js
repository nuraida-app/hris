import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class CareerHistory extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, { foreignKey: "employeeId" });
    this.belongsTo(models.Department, { foreignKey: "departmentId" });
    this.belongsTo(models.Position, { foreignKey: "positionId" });
  }
}

CareerHistory.init(
  {
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY }, // Null jika ini posisi saat ini
    type: {
      type: DataTypes.ENUM("hired", "promoted", "demoted", "transfer"),
      allowNull: false,
    },
    notes: { type: DataTypes.TEXT },
  },
  {
    sequelize: db,
    modelName: "CareerHistory",
    tableName: "career_histories",
    underscored: true,
  }
);

export default CareerHistory;
