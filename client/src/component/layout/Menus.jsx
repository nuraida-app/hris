import {
  AppstoreOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  CarryOutOutlined,
  CloudServerOutlined,
  UserOutlined,
  HomeOutlined,
} from "@ant-design/icons";

export const ROLE_LABELS = {
  admin: "Administrator",
  hr_staff: "Staf HR",
  employee: "Pegawai",
};

export const getRoleLabel = (role) => ROLE_LABELS[role] ?? "Pengguna";

export const adminNavItems = [
  {
    label: "Dashboard",
    key: "/admin-dashboard",
    icon: <AppstoreOutlined />,
  },
  {
    label: "Data Master",
    key: "/admin-data-master",
    icon: <DatabaseOutlined />,
  },
  {
    label: "Data Pegawai",
    key: "/admin-data-pegawai",
    icon: <UsergroupAddOutlined />,
  },
  {
    label: "Absensi",
    key: "/admin-absensi",
    icon: <CarryOutOutlined />,
  },
  {
    label: "Rekrutmen",
    key: "/admin-rekrutmen",
    icon: <SolutionOutlined />,
  },
  {
    label: "Database",
    key: "/admin-database",
    icon: <CloudServerOutlined />,
  },
];

export const userNavItems = [
  {
    label: "Dashboard",
    key: "/dashboard",
    icon: <HomeOutlined />,
  },
  {
    label: "Profil",
    key: "/profile",
    icon: <UserOutlined />,
  },
];

export const logoutItem = {
  key: "logout",
  label: "Keluar",
  icon: <LogoutOutlined />,
  danger: true,
};

/** @deprecated Use adminNavItems + logoutItem */
export const adminMenus = [...adminNavItems, logoutItem];

/** @deprecated Use userNavItems + logoutItem */
export const userMenus = [...userNavItems, logoutItem];
