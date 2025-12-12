import {
  Department,
  Position,
  User,
  Holiday,
  Employee,
  AttendanceLog,
  LeaveRequest,
  FamilyMember,
  EmployeeDocument,
  Career,
} from "./models/index.js"; // SESUAIKAN PATH INI DENGAN FILE INDEX MODEL ANDA
import db from "./config/config.js";

// --- HELPER DATA ---
const firstNames = [
  "Budi",
  "Siti",
  "Agus",
  "Rina",
  "Dewi",
  "Joko",
  "Sari",
  "Eko",
  "Dian",
  "Tono",
  "Andi",
  "Maya",
  "Rizky",
  "Nur",
  "Hendra",
  "Lestari",
  "Bayu",
  "Indah",
  "Adi",
  "Putri",
  "Gilang",
  "Cahya",
  "Fajar",
  "Wulan",
  "Bambang",
  "Yuni",
  "Dedi",
  "Kurnia",
  "Gita",
  "Reza",
  "Tia",
  "Feri",
  "Nia",
  "Doni",
  "Vina",
  "Rudi",
  "Tina",
  "Aris",
  "Lina",
  "Yoga",
  "Adit",
  "Bella",
  "Dimas",
  "Citra",
  "Ega",
  "Fanny",
  "Gunawan",
  "Hani",
  "Ivan",
  "Julia",
];
const lastNames = [
  "Santoso",
  "Wijaya",
  "Saputra",
  "Utami",
  "Hidayat",
  "Nugroho",
  "Pratama",
  "Kusuma",
  "Lestari",
  "Wibowo",
  "Susanto",
  "Sihombing",
  "Siregar",
  "Nasution",
  "Panggabean",
  "Sinaga",
  "Setiawan",
  "Ramadhan",
  "Permana",
  "Mulyadi",
  "Hartono",
  "Wahyuni",
  "Irawan",
  "Kurniawan",
  "Suryadi",
  "Anggraini",
  "Mahardika",
  "Puspasari",
  "Firmansyah",
  "Yuliana",
  "Sanjaya",
  "Novita",
  "Wibisono",
  "Astuti",
  "Rahmawati",
  "Hakim",
  "Zulkifli",
  "Hasan",
  "Basri",
  "Fauzi",
];

// Hash dummy untuk password "123456" (generated via bcrypt)
// Jika Anda belum setup bcrypt hook di model User, string ini akan masuk apa adanya.
const DUMMY_HASH =
  "$2a$12$EdskvANfDvBpKQwHus70VuQvXaAp7RYIBs/VfWIxxY696skH88QhW";

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};
const formatDate = (date) => date.toISOString().split("T")[0];

// --- SEEDING FUNCTION ---
const seedDatabase = async () => {
  try {
    console.log("🔄 Menghubungkan ke Database...");
    // PENTING: { force: true } AKAN MENGHAPUS SEMUA DATA LAMA!
    await db.sync({ force: true });
    console.log("✅ Database diset ulang.");

    // ==========================================
    // 1. MASTER DATA: DEPARTEMEN & POSISI
    // ==========================================
    console.log("🌱 Seeding Departments & Positions...");

    const deptNames = [
      "IT & Engineering",
      "Human Resources",
      "Finance & Accounting",
      "Sales & Marketing",
      "Operations",
    ];
    const departments = [];
    const positions = [];

    for (const name of deptNames) {
      const dept = await Department.create({
        name: name,
        description: `Departemen ${name} pusat.`,
      });
      departments.push(dept);

      // Create Positions per Dept
      const posLevels = [
        { name: `Staff ${name}`, level: 1 },
        { name: `Supervisor ${name}`, level: 2 },
        { name: `Manager ${name}`, level: 3 },
      ];

      for (const p of posLevels) {
        const pos = await Position.create({
          name: p.name,
          level: p.level,
          departmentId: dept.id,
          description: `Posisi ${p.name} di perusahaan`,
        });
        positions.push(pos);
      }
    }

    // ==========================================
    // 2. MASTER DATA: HARI LIBUR
    // ==========================================
    console.log("🌱 Seeding Holidays...");
    await Holiday.bulkCreate([
      {
        name: "Tahun Baru Masehi",
        startDate: "2025-01-01",
        endDate: "2025-01-01",
        isCutiBersama: false,
      },
      {
        name: "Imlek",
        startDate: "2025-01-29",
        endDate: "2025-01-29",
        isCutiBersama: false,
      },
      {
        name: "Cuti Bersama Imlek",
        startDate: "2025-01-28",
        endDate: "2025-01-28",
        isCutiBersama: true,
      },
      {
        name: "Idul Fitri",
        startDate: "2025-03-31",
        endDate: "2025-04-01",
        isCutiBersama: false,
      },
      {
        name: "Cuti Bersama Lebaran",
        startDate: "2025-04-02",
        endDate: "2025-04-07",
        isCutiBersama: true,
      },
    ]);

    // ==========================================
    // 3. GENERATE 50 PEGAWAI (USERS & EMPLOYEES)
    // ==========================================
    console.log("🌱 Seeding 50 Employees...");

    // Ambil semua posisi untuk di-random
    const allPositions = await Position.findAll();

    for (let i = 0; i < 50; i++) {
      const fName = firstNames[i];
      const lName = getRandomElement(lastNames);
      const fullName = `${fName} ${lName}`;
      const username = `${fName.toLowerCase()}${i + 1}`;
      const email = `${username}@perusahaan.com`;
      const gender = i % 3 === 0 ? "Perempuan" : "Laki-laki"; // Random-ish

      // Pilih posisi random
      const selectedPos = getRandomElement(allPositions);
      const role =
        selectedPos.level === 3 ? "admin" : i < 3 ? "hr_staff" : "employee"; // Beberapa jadi admin/hr

      // A. Buat User
      const user = await User.create({
        name: fullName,
        username: username,
        email: email,
        password: DUMMY_HASH, // "123456"
        role: role,
        isActive: true,
      });

      // B. Buat Employee Profile
      const joinDate = getRandomDate(
        new Date(2020, 0, 1),
        new Date(2024, 11, 31)
      );
      const dob = getRandomDate(new Date(1980, 0, 1), new Date(2000, 11, 31));

      const employee = await Employee.create({
        userId: user.id,
        departmentId: selectedPos.departmentId,
        positionId: selectedPos.id,
        nip: `EMP2025${(i + 1).toString().padStart(3, "0")}`,
        fullName: fullName,
        joinDate: formatDate(joinDate),
        status: i < 5 ? "contract" : "permanent", // 5 orang pertama kontrak
        gender: gender,
        phone: `0812345678${i}`,
        address: `Jl. Raya No. ${i + 1}, Jakarta`,
        placeOfBirth: "Jakarta",
        dateOfBirth: formatDate(dob),
        bankName: i % 2 === 0 ? "BCA" : "Mandiri",
        bankAccountNumber: `123000${i}555`,
        bankAccountHolder: fullName,
        identityNumber: `317101${i}0001`, // KTP Dummy
        npwp: `88.999.111.2-${i}.000`,
        maritalStatus: i > 10 ? "married" : "single",
        religion: "Islam",
      });

      // ==========================================
      // 4. DATA PENDUKUNG (FAMILY, DOCS, CAREER)
      // ==========================================

      // C. Keluarga (Jika menikah)
      if (employee.maritalStatus === "married") {
        await FamilyMember.create({
          employeeId: employee.id,
          name: `Pasangan ${fName}`,
          relation: "spouse",
          gender: gender === "Laki-laki" ? "Perempuan" : "Laki-laki",
          isEmergencyContact: true,
          phone: "0899991111",
        });
        // Anak
        await FamilyMember.create({
          employeeId: employee.id,
          name: `Anak ${fName}`,
          relation: "child",
          dob: "2018-05-20",
          gender: "Laki-laki",
        });
      }

      // D. Dokumen
      await EmployeeDocument.create({
        employeeId: employee.id,
        documentType: "KTP",
        filePath: `/uploads/${username}/ktp.jpg`,
        description: "Scan KTP Asli",
      });
      await EmployeeDocument.create({
        employeeId: employee.id,
        documentType: "Kontrak Kerja",
        filePath: `/uploads/${username}/contract.pdf`,
        expiryDate: "2026-12-31",
      });

      // E. History Karir (Initial Hire)
      await Career.create({
        employeeId: employee.id,
        departmentId: selectedPos.departmentId,
        positionId: selectedPos.id,
        startDate: formatDate(joinDate),
        type: "hired",
        notes: "Bergabung pertama kali",
      });

      // ==========================================
      // 5. TRANSACTIONAL (ABSENSI & CUTI)
      // ==========================================

      // F. Absensi 30 Hari Terakhir
      // Kita buat loop mundur 30 hari
      for (let d = 30; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const day = date.getDay(); // 0 = Minggu, 6 = Sabtu

        // Skip weekend (Simpel logic)
        if (day !== 0 && day !== 6) {
          // Randomize kehadiran: 90% Hadir, 5% Telat, 5% Absen/Sakit
          const rand = Math.random();
          let status = "present";
          let clockIn = "08:00:00";
          let clockOut = "17:00:00";

          if (rand > 0.95) {
            status = "absent";
            clockIn = null;
            clockOut = null;
          } else if (rand > 0.9) {
            status = "late";
            clockIn = "08:45:00";
          }

          if (status !== "absent") {
            // Tambah sedikit variasi menit di jam masuk
            const randomMin = Math.floor(Math.random() * 15);
            const baseTime = status === "late" ? 8 : 7; // Masuk jam 7 atau 8
            // (Logic jam di JS Date perlu set hours manual, disini kita mock string/date obj sesuai model)
            // Untuk simplifikasi sequelize DATE, kita pakai new Date(timestamp)

            const logDateIn = new Date(date);
            logDateIn.setHours(status === "late" ? 9 : 8, randomMin, 0); // Telat jam 9, ontime jam 8

            const logDateOut = new Date(date);
            logDateOut.setHours(17, randomMin, 0);

            await AttendanceLog.create({
              employeeId: employee.id,
              date: formatDate(date),
              clockIn: logDateIn,
              clockOut: logDateOut,
              status: status,
              latitude: -6.2 + Math.random() * 0.01,
              longitude: 106.816666 + Math.random() * 0.01,
            });
          }
        }
      }

      // G. Cuti (Random 1-2 request)
      if (i % 5 === 0) {
        // Setiap pegawai ke-5
        await LeaveRequest.create({
          employeeId: employee.id,
          leaveType: "Tahunan",
          startDate: "2025-05-10",
          endDate: "2025-05-12",
          reason: "Liburan keluarga",
          status: "pending", // Biar HR bisa approve nanti
        });
      }
    }

    console.log("✅ SEEDING SELESAI! Database siap digunakan.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Gagal Seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
