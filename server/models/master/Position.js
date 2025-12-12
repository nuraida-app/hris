import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class Position extends Model {
  static associate(models) {
    this.belongsTo(models.Department, { foreignKey: "departmentId" });
    this.hasMany(models.Employee, { foreignKey: "positionId" });
  }
}

Position.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    level: {
      type: DataTypes.INTEGER, // 1: Staff, 2: SPV, 3: Manager
      defaultValue: 1,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "Position",
    tableName: "positions",
    underscored: true,
  }
);

export default Position;
