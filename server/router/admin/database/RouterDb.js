import { Router } from "express";
import authorizeRole from "../../../middleware/authorizeRole.js"; // Sesuaikan path
import { db } from "../../../models/index.js";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import unzipper from "unzipper";
import multer from "multer";
import { spawn } from "child_process";

// Konfigurasi Multer untuk upload file restore
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(process.cwd(), "temp_uploads");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Tambahkan timestamp agar nama file unik
    cb(null, `restore-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const router = Router();

const getCommandPath = (toolName) => {
  // Path spesifik server aaPanel/Linux Anda
  const serverBinPath = `/www/server/pgsql/bin/${toolName}`;

  // Logika IF ELSE:
  // Jika file spesifik di server ada, pakai itu. Jika tidak, pakai command global.
  if (fs.existsSync(serverBinPath)) {
    return serverBinPath;
  } else {
    // Fallback untuk Windows Localhost (asumsi sudah di PATH environment)
    return toolName;
  }
};

// --- Helper: Get Env Variables ---
const { P_DATABASE, P_USER, P_PASSWORD, P_HOST, P_PORT } = process.env;
const PG_PORT = P_PORT || 5432;

// --- 1. ROUTER BACKUP ---
router.get("/backup", authorizeRole(["admin"]), async (req, res) => {
  const tempDir = path.join(process.cwd(), "temp_backup");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const sqlFileName = `db_dump_${timestamp}.sql`;
  const sqlFilePath = path.join(tempDir, sqlFileName);
  const zipFileName = `backup_${timestamp}.zip`;

  // DETEKSI COMMAND (pg_dump)
  const PG_DUMP_CMD = getCommandPath("pg_dump");

  try {
    console.log(`[BACKUP] Menggunakan command: ${PG_DUMP_CMD}`);

    const pgEnv = { ...process.env, PGPASSWORD: process.env.P_PASSWORD };

    // --- PROSES DUMP ---
    await new Promise((resolve, reject) => {
      const dumpProcess = spawn(
        PG_DUMP_CMD,
        [
          "-h",
          process.env.P_HOST || "localhost",
          "-p",
          process.env.P_PORT || "5432",
          "-U",
          process.env.P_USER,
          "--clean", // Drop table dulu
          "--if-exists",
          "--format=p", // Plain text SQL
          "--file",
          sqlFilePath,
          process.env.P_DATABASE,
        ],
        { env: pgEnv }
      );

      dumpProcess.stderr.on("data", (data) =>
        console.log(`pg_dump log: ${data}`)
      );

      dumpProcess.on("error", (err) => {
        reject(new Error(`Gagal spawn ${PG_DUMP_CMD}. Error: ${err.message}`));
      });

      dumpProcess.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`pg_dump exited with code ${code}`));
      });
    });

    // --- PROSES ZIP ---
    const archive = archiver("zip", { zlib: { level: 9 } });
    res.attachment(zipFileName);
    archive.pipe(res);

    archive.file(sqlFilePath, { name: "database.sql" });

    const assetsPath = path.join(process.cwd(), "server/assets");
    if (fs.existsSync(assetsPath)) {
      archive.directory(assetsPath, "assets");
    }

    await archive.finalize();

    // Cleanup
    res.on("finish", () => {
      try {
        if (fs.existsSync(sqlFilePath)) fs.unlinkSync(sqlFilePath);
      } catch (e) {}
    });
  } catch (error) {
    console.error("[BACKUP ERROR]", error);
    if (fs.existsSync(sqlFilePath)) fs.unlinkSync(sqlFilePath);
    if (!res.headersSent) res.status(500).json({ message: error.message });
  }
});

// --- 2. ROUTER RESTORE ---
router.post(
  "/restore",
  authorizeRole(["admin"]),
  upload.single("backupFile"),
  async (req, res) => {
    // Validasi file
    if (!req.file) {
      return res.status(400).json({ message: "File backup diperlukan" });
    }

    const zipPath = req.file.path;
    const extractPath = path.join(
      process.cwd(),
      "temp",
      "restore-" + Date.now()
    );

    // Destinasi assets di server Anda (sesuai screenshot: server/assets)
    const assetsDest = path.join(process.cwd(), "server/assets");

    try {
      // 1. Extract Zip
      const directory = await unzipper.Open.file(zipPath);
      await directory.extract({ path: extractPath });

      // 2. Restore Assets
      // PERBAIKAN DI SINI:
      // Di dalam zip, foldernya bernama "assets", BUKAN "server/assets".
      const extractedAssets = path.join(extractPath, "assets");

      if (fs.existsSync(extractedAssets)) {
        console.log("Assets folder found in backup, restoring...");

        // Hapus folder assets tujuan jika ada (Clean Install)
        if (fs.existsSync(assetsDest)) {
          fs.rmSync(assetsDest, { recursive: true, force: true });
        }

        // Buat folder tujuan baru
        fs.mkdirSync(assetsDest, { recursive: true });

        // Copy isi folder dari temp ke destination
        fs.cpSync(extractedAssets, assetsDest, { recursive: true });
      } else {
        console.log("No assets folder found in zip at:", extractedAssets);
      }

      // 3. Restore Database
      const sqlFile = path.join(extractPath, "database.sql");
      if (fs.existsSync(sqlFile)) {
        console.log("Restoring DB...");
        const env = { ...process.env, PGPASSWORD: P_PASSWORD };

        // Drop Schema Public & Create New
        await db.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

        const psql = spawn(
          getCommandPath("psql"),
          [
            "-h",
            P_HOST || "localhost",
            "-p",
            PG_PORT,
            "-U",
            P_USER,
            "-d",
            P_DATABASE,
            "-f",
            sqlFile,
          ],
          { env }
        );

        psql.on("exit", async (code) => {
          // Cleanup Temp Files
          try {
            if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true });
            if (fs.existsSync(extractPath))
              fs.rmSync(extractPath, { recursive: true, force: true });
          } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr);
          }

          if (code !== 0) {
            return res
              .status(500)
              .json({ message: "Gagal restore database via psql" });
          }
          return res.json({
            message: "Restore berhasil! Silakan refresh aplikasi.",
          });
        });
      } else {
        // Cleanup jika gagal cari SQL
        if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true });
        if (fs.existsSync(extractPath))
          fs.rmSync(extractPath, { recursive: true, force: true });

        return res
          .status(400)
          .json({ message: "File database.sql tidak ditemukan dalam zip." });
      }
    } catch (error) {
      console.error("RESTORE ERROR:", error);
      // Cleanup on error
      if (fs.existsSync(zipPath)) fs.rmSync(zipPath, { force: true });
      if (fs.existsSync(extractPath))
        fs.rmSync(extractPath, { recursive: true, force: true });

      res.status(500).json({ message: error.message });
    }
  }
);

// --- Helper: Get List Tables ---
router.get("/tables", authorizeRole(["admin"]), async (req, res) => {
  try {
    // Mendapatkan semua nama tabel dari Sequelize
    const tables = await db.getQueryInterface().showAllTables();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 3. ROUTER DELETE/TRUNCATE TABLE ---
router.post("/clean-tables", authorizeRole(["admin"]), async (req, res) => {
  const { tables } = req.body; // Array of table names e.g. ['Employees', 'AttendanceLogs']

  if (!tables || tables.length === 0) {
    return res
      .status(400)
      .json({ message: "Pilih tabel yang ingin dibersihkan." });
  }

  const transaction = await db.transaction();
  try {
    for (const tableName of tables) {
      if (tableName === "users") {
        // KHUSUS TABEL USERS: Hapus user selain admin
        // Note: ID tidak di-reset (RESTART IDENTITY) agar ID Admin tetap aman
        await db.query(`DELETE FROM "users" WHERE "role" != 'admin';`, {
          transaction,
        });
      } else {
        // TABEL LAIN: Truncate (Hapus semua & Reset ID)
        await db.query(
          `TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;`,
          { transaction }
        );
      }
    }

    await transaction.commit();
    res.json({ message: `${tables.length} tabel berhasil diproses.` });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res
      .status(500)
      .json({ message: "Gagal membersihkan tabel: " + error.message });
  }
});

export default router;
