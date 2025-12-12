import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Router
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
  // ➡️ Gunakan instance db dari models/index.js
  await models.db.authenticate();
  console.log("Database connected...");

  // ➡️ Panggil sync() setelah semua model diinisialisasi dan diasosiasikan
  // Jika Anda hanya ingin membuat tabel yang belum ada, gunakan { alter: true } atau biarkan kosong
  await models.db.sync({ alter: true });
} catch (error) {
  console.error("Connection error:", error);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(express.static(path.join(__dirname, "../client/dist")));
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

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

export default app;
