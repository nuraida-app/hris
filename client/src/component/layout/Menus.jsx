import {
  WindowsOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
  LogoutOutlined,
  DatabaseOutlined,
  CarryOutOutlined,
  CloudServerOutlined,
  UserOutlined,
} from "@ant-design/icons";

export const adminMenus = [
  {
    label: "Dashboard",
    key: "/admin-dashboard",
    icon: <WindowsOutlined />,
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
  {
    label: "Logout",
    key: "logout",
    icon: <LogoutOutlined />,
    danger: true,
  },
];

export const userMenus = [
  {
    label: "Dashboard",
    key: "/dashboard",
    icon: <WindowsOutlined />,
  },
  {
    label: "Profile",
    key: "/profile",
    icon: <UserOutlined />,
  },
];
