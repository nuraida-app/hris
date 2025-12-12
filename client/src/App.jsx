import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./module/auth/Login";
import { lazy } from "react";
import { isAuthenticated } from "./utils/auth";
import { useLoadUserQuery } from "./service/auth/ApiAuth";
import LoadingUser from "./component/loader/LoadingUser";
import { Suspense } from "react";
import LoadingScreen from "./component/loader/LoadingScreen";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setUser } from "./service/auth/Slice";
import Absent from "./module/admin/absent/Absent";

const AdminDash = lazy(() => import("./module/admin/dash/AdminDash"));
const Master = lazy(() => import("./module/admin/master/Master"));
const Account = lazy(() => import("./module/admin/account/Account"));
const Database = lazy(() => import("./module/admin/database/Database"));

const App = () => {
  const dispatch = useDispatch();

  const isSignin = isAuthenticated();
  const { user } = useSelector((state) => state.user);

  const { data, isLoading } = useLoadUserQuery(undefined, {
    skip: !isSignin,
  });

  useEffect(() => {
    // 1. Sinkronisasi Data ke Redux
    if (data && !user) {
      dispatch(setUser(data));
    }

    // 2. Ambil path saat ini
    const currentPath = window.location.pathname;

    // 3. Logika Redirect
    if (!isSignin) {
      // Jika tidak login dan bukan di halaman login, tendang ke login
      if (currentPath !== "/") {
        window.location.href = "/";
      }
    } else if (isSignin && data) {
      // PENTING: Gunakan 'data' langsung dari API hook, jangan 'user' dari Redux
      // untuk menghindari delay (race condition) saat reload.

      // Jika user Login tapi masih di halaman "/" (Login Page), arahkan sesuai role
      if (currentPath === "/") {
        if (data.role === "admin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/dashboard";
        }
      }

      // OPTIONAL: Keamanan Tambahan
      // Jika user biasa mencoba akses admin dashboard secara manual
      if (currentPath.startsWith("/admin") && data.role !== "admin") {
        window.location.href = "/dashboard";
      }
    }
  }, [data, user, isSignin]);

  if (isLoading) {
    return <LoadingUser />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="*" element={<Login />} />

          <Route path="/" element={<Login />} />

          <Route path="/admin-dashboard" element={<AdminDash />} />

          <Route path="/admin-data-master" element={<Master />} />

          <Route path="/admin-data-pegawai" element={<Account />} />

          <Route path="/admin-absensi" element={<Absent />} />

          <Route path="/admin-database" element={<Database />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
