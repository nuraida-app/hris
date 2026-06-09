// Attendence
import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class AttendanceLog extends Model {
  static associate(models) {
    this.belongsTo(models.Employee, { foreignKey: "employeeId" });
  }
}

AttendanceLog.init(
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    clockIn: {
      type: DataTypes.DATE, // Menyimpan Tanggal + Jam
    },
    clockOut: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM("present", "late", "absent", "permission"),
      defaultValue: "absent",
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
  },
  {
    sequelize: db,
    modelName: "AttendanceLog",
    tableName: "attendance_logs",
    underscored: true,
  }
);

// Carrer
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

// Education
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

// Employee
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
``;
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

// employee doc
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

// Family
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

// Training
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

// Department
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

// Holiday
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

// Permintaan cuti
import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class LeaveRequest extends Model {
  static associate(models) {
    // 1. Yang mengajukan cuti
    this.belongsTo(models.Employee, {
      foreignKey: "employeeId",
      as: "employee",
    });

    // 2. Jenis Cuti (Relasi ke tabel baru)
    this.belongsTo(models.LeaveType, {
      foreignKey: "leaveTypeId",
      as: "leaveType",
    });

    // 3. Pegawai Pengganti (Relasi ke Employee juga, tapi sebagai substitute)
    this.belongsTo(models.Employee, {
      foreignKey: "substituteEmployeeId",
      as: "substitute",
    });

    // 4. Yang menyetujui (User/Admin)
    this.belongsTo(models.User, { foreignKey: "approvedBy", as: "approver" });
  }
}

LeaveRequest.init(
  {
    // Hapus 'leaveType' string lama, ganti relasi di associate di atas
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
    },
    rejectionReason: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize: db,
    modelName: "LeaveRequest",
    tableName: "leave_requests",
    underscored: true,
  }
);

// Cuti
import { Model, DataTypes } from "sequelize";
import db from "../../config/config.js";

class LeaveType extends Model {
  static associate(models) {
    // Satu jenis cuti bisa digunakan di banyak pengajuan
    this.hasMany(models.LeaveRequest, { foreignKey: "leaveTypeId" });
  }
}

LeaveType.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Opsional: Jatah hari default (misal: Tahunan = 12)
    defaultQuota: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: db,
    modelName: "LeaveType",
    tableName: "leave_types",
    underscored: true,
  }
);

// Position
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

// User
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
