import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class User extends Model {
  static associate(models) {
    // Relasi 1:1 ke Employee
    this.hasOne(models.Employee, { foreignKey: "userId", as: "profile" });
  }
}

User.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Ingat: Simpan hash password!
    },
    role: {
      type: DataTypes.ENUM("admin", "employee", "hr_staff"),
      defaultValue: "employee",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: "User",
    tableName: "users",
    underscored: true,
  }
);

export default User;
