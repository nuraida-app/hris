import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./module/auth/Login";
import { lazy, Suspense, useEffect } from "react";
import { isAuthenticated } from "./utils/auth";
import { useLoadUserQuery } from "./service/auth/ApiAuth";
import LoadingScreen from "./component/loader/LoadingScreen";
import { useDispatch, useSelector } from "react-redux";
import { finishBootstrap } from "./service/auth/Slice";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import PublicRoute from "./component/auth/PublicRoute";

const AdminDash = lazy(() => import("./module/admin/dash/AdminDash"));
const Master = lazy(() => import("./module/admin/master/Master"));
const Account = lazy(() => import("./module/admin/account/Account"));
const Database = lazy(() => import("./module/admin/database/Database"));
const Absent = lazy(() => import("./module/admin/absent/Absent"));
const Dashboard = lazy(() => import("./module/employee/Dashboard/Dashboard"));
const Profile = lazy(() => import("./module/employee/profile/Profile"));

const App = () => {
  const dispatch = useDispatch();
  const isSignin = isAuthenticated();
  const { isBootstrapping } = useSelector((state) => state.user);

  useLoadUserQuery(undefined, { skip: !isSignin });

  useEffect(() => {
    if (!isSignin) {
      dispatch(finishBootstrap());
    }
  }, [isSignin, dispatch]);

  if (isBootstrapping) {
    return (
      <LoadingScreen
        message="Memuat sesi Anda..."
        subMessage="Menyiapkan data pengguna"
      />
    );
  }

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <LoadingScreen
            message="Memuat halaman..."
            subMessage="Menyiapkan komponen aplikasi"
          />
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute adminOnly>
                <AdminDash />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-data-master"
            element={
              <ProtectedRoute adminOnly>
                <Master />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-data-pegawai"
            element={
              <ProtectedRoute adminOnly>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-absensi"
            element={
              <ProtectedRoute adminOnly>
                <Absent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-database"
            element={
              <ProtectedRoute adminOnly>
                <Database />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
