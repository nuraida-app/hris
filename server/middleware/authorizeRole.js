import jwt from "jsonwebtoken";

/**
 * Middleware untuk memverifikasi token dan mengotorisasi akses berdasarkan peran (role).
 * @param {string[]} allowedRoles - Array dari peran ('role') yang diizinkan untuk mengakses endpoint ini.
 */
export default function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    // 1. Ambil Token dari Cookies (Sesuai implementasi Anda)
    const token = req.cookies.token;

    // 2. Periksa keberadaan token (Autentikasi)
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Tidak ada token otorisasi.",
      });
    }

    // 3. Verifikasi Token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Simpan data user yang sudah di-decode
      req.user = decoded.user;
      // req.user diharapkan memiliki properti .role (misalnya: 'admin', 'hr_staff', 'employee')

      // 4. Periksa Role (Otorisasi)
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        // 403 Forbidden: Token valid, tetapi role tidak memiliki izin
        return res.status(403).json({
          success: false,
          message: `Akses terlarang. Diperlukan peran: ${allowedRoles.join(
            " atau "
          )}. Peran Anda: ${userRole}.`,
        });
      }

      // Jika token valid dan role diizinkan, lanjutkan
      next();
    } catch (err) {
      // 401 Unauthorized: Token tidak valid/kedaluwarsa
      console.error("Kesalahan verifikasi token:", err.message);
      res.status(401).json({
        success: false,
        message: "Token tidak valid atau telah kedaluwarsa.",
      });
    }
  };
}
