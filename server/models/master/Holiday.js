import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class Holiday extends Model {}

Holiday.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    isCutiBersama: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: "Holiday",
    tableName: "holidays",
    underscored: true,
  }
);

export default Holiday;
