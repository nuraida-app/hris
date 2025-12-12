import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Router Imports
import * as models from "./models/index.js";
import RouterAuth from "./router/auth/RouterAuth.js";
import RouterDep from "./router/admin/master/RouterDep.js";
import RouterPos from "./router/admin/master/RouterPos.js";
import RouterHoliday from "./router/admin/master/RouterHoliday.js";
import RouterAdmin from "./router/admin/account/RouterAdmin.js";
import RouterEmployee from "./router/admin/account/RouterEmployess.js";
import RouterAbsent from "./router/absent/RouterAbsent.js";
import RouterDash from "./router/dashboard/RouterDash.js";
import RouterLeave from "./router/admin/master/RouterLeave.js";
import RouterDb from "./router/admin/database/RouterDb.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  await models.db.authenticate();
  console.log("Database connected...");
  await models.db.sync({ alter: true });
} catch (error) {
  console.error("Connection error:", error);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- PERBAIKAN: API ROUTES DITARUH DI ATAS ---
// Request API harus diproses DULUAN sebelum request file statis/html
app.use("/api/auth", RouterAuth);
app.use("/api/department", RouterDep);
app.use("/api/position", RouterPos);
app.use("/api/holiday", RouterHoliday);
app.use("/api/admin", RouterAdmin);
app.use("/api/employee", RouterEmployee);
app.use("/api/absent", RouterAbsent);
app.use("/api/dashboard", RouterDash);
app.use("/api/leave", RouterLeave);
app.use("/api/database", RouterDb);

// --- STATIC FILES & CATCH-ALL (DITARUH DI BAWAH) ---
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "../client/dist")));

// Ubah "/{*splat}" menjadi "*" (standar Express)
// Route ini menangani halaman React jika route API tidak cocok
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

export default app;
