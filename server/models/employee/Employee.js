import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class Employee extends Model {
  static associate(models) {
    // Relasi ke User & Organisasi
    this.belongsTo(models.User, { foreignKey: "userId", as: "account" });
    this.belongsTo(models.Department, {
      foreignKey: "departmentId",
      as: "department",
    });
    this.belongsTo(models.Position, {
      foreignKey: "positionId",
      as: "position",
    });

    // Relasi ke Absensi & Cuti
    this.hasMany(models.AttendanceLog, { foreignKey: "employeeId" });
    this.hasMany(models.LeaveRequest, { foreignKey: "employeeId" });

    // --- RELASI BARU (CORE HR) ---
    // 1. Employee punya banyak Anggota Keluarga
    this.hasMany(models.FamilyMember, {
      foreignKey: "employeeId",
      onDelete: "CASCADE", // Hapus data keluarga jika pegawai dihapus
    });

    // 2. Employee punya banyak Dokumen
    this.hasMany(models.EmployeeDocument, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
    });

    // 3. Employee punya banyak Riwayat Karir
    this.hasMany(models.CareerHistory, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
    });

    // --- RELASI BARU ---
    this.hasMany(models.EducationHistory, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
      as: "educations", // Alias untuk memudahkan include
    });

    this.hasMany(models.TrainingHistory, {
      foreignKey: "employeeId",
      onDelete: "CASCADE",
      as: "trainings", // Alias untuk memudahkan include
    });
  }
}

Employee.init(
  {
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    nuptk: {
      type: DataTypes.STRING(25),
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("contract", "permanent", "probation", "resigned"),
      defaultValue: "probation",
    },
    gender: {
      type: DataTypes.ENUM("Laki-laki", "Perempuan"),
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    address: {
      type: DataTypes.TEXT,
    },

    // --- TAMBAHAN CORE HR: DATA KELAHIRAN ---
    // (Penting agar data profil lengkap)
    placeOfBirth: {
      type: DataTypes.STRING,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
    },

    // --- DATA FINANSIAL (PAYROLL) ---
    bankName: { type: DataTypes.STRING },
    bankAccountNumber: { type: DataTypes.STRING },
    bankAccountHolder: { type: DataTypes.STRING },

    // --- DATA LEGAL & IDENTITAS ---
    identityNumber: { type: DataTypes.STRING(20) }, // KTP/NIK
    npwp: { type: DataTypes.STRING(25) },
    bpjsKetenagakerjaan: { type: DataTypes.STRING(20) },
    bpjsKesehatan: { type: DataTypes.STRING(20) },

    // --- DATA PRIBADI TAMBAHAN ---
    maritalStatus: {
      type: DataTypes.ENUM("single", "married", "widow", "widower"),
      defaultValue: "single",
    },
    bloodType: { type: DataTypes.STRING(3) }, // A, B, AB, O
    religion: { type: DataTypes.STRING(20) },
  },
  {
    sequelize: db,
    modelName: "Employee",
    tableName: "employees",
    underscored: true,
  }
);

export default Employee;
