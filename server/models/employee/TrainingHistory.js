import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class TrainingHistory extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
    });
  }
}

TrainingHistory.init(
  {
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "employees",
        key: "id",
      },
    },
    trainingName: {
      type: DataTypes.STRING,
      allowNull: false, // Nama Pelatihan / Sertifikasi
    },
    organizer: {
      type: DataTypes.STRING, // Penyelenggara
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER, // Tahun
      allowNull: false,
    },
    certificateNo: {
      type: DataTypes.STRING, // Opsional: Nomor Sertifikat
    },
    notes: {
      type: DataTypes.TEXT, // Keterangan tambahan
    },
  },
  {
    sequelize: db,
    modelName: "TrainingHistory",
    tableName: "training_histories",
    underscored: true,
  }
);

export default TrainingHistory;
