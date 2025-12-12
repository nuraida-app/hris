import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class FamilyMember extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, { foreignKey: "employeeId" });
  }
}

FamilyMember.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    relation: {
      type: DataTypes.ENUM("spouse", "child", "parent", "sibling"),
      allowNull: false,
    },
    dob: { type: DataTypes.DATEONLY }, // Tanggal lahir penting untuk BPJS
    gender: { type: DataTypes.ENUM("Laki-laki", "Perempuan") },
    isEmergencyContact: { type: DataTypes.BOOLEAN, defaultValue: false },
    phone: { type: DataTypes.STRING(20) },
  },
  {
    sequelize: db,
    modelName: "FamilyMember",
    tableName: "family_members",
    underscored: true,
  }
);

export default FamilyMember;
