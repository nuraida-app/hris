import db from "../config/config.js";

// --- 1. Import Master Data Models ---
import Department from "./master/Department.js";
import Position from "./master/Position.js";
import Holiday from "./master/Holiday.js";
import LeaveRequest from "./master/LeaveRequest.js";
import User from "./master/User.js";
import LeaveType from "./master/LeaveType.js";

// --- 2. Import Employee Core Data Models ---
import Employee from "./employee/Employee.js";
import AttendanceLog from "./employee/AttendanceLog.js";

// Model Baru (Core HR)
import FamilyMember from "./employee/FamilyMember.js";
import EmployeeDocument from "./employee/EmployeeDocument.js";
import CareerHistory from "./employee/CareerHistory.js";
import EducationHistory from "./employee/EducationHistory.js";
import TrainingHistory from "./employee/TrainingHistory.js";

// --- 3. Daftarkan model ke dalam object ---
const models = {
  // Master
  Department,
  Position,
  User,
  Holiday,
  LeaveType,

  // Transactional / Employee Related
  Employee,
  AttendanceLog,
  LeaveRequest,

  // New Core HR Models
  FamilyMember,
  EmployeeDocument,
  CareerHistory,
  EducationHistory,
  TrainingHistory,
};

// --- 4. Jalankan Asosiasi (Relasi) ---
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// --- 5. Export Database & Models ---
export {
  db,
  // Master
  Department,
  Position,
  User,
  Holiday,
  LeaveType,

  // Employee
  Employee,
  AttendanceLog,
  LeaveRequest,
  FamilyMember,
  EmployeeDocument,
  CareerHistory,
  EducationHistory,
  TrainingHistory,
};
