import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Avatar,
  Tabs,
  Typography,
  Tag,
  Skeleton,
  Result,
  Button,
} from "antd";
import {
  UserOutlined,
  RiseOutlined,
  BankOutlined,
  TeamOutlined,
  FileOutlined,
  ReadOutlined,
  TrophyOutlined,
  SolutionOutlined,
  IdcardOutlined,
  CalendarOutlined,
  ApartmentOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id";
import { useGetEmployeeDetailQuery } from "../../../service/account/ApiEmployee";
import MainLayout from "../../../component/layout/MainLayout";
import TabProfile from "../../../component/employee/TabProfile";
import TabPayroll from "../../../component/employee/TabPayroll";
import TabFamily from "../../../component/employee/TabFamily";
import TabDocuments from "../../../component/employee/TabDocuments";
import TabCareerHistory from "../../../component/employee/TabCareerHistory";
import TabEducation from "../../../component/employee/TabEducation";
import TabCv from "../../../component/employee/TabCv";
import TabTraning from "../../../component/employee/TabTraning";
import "../../admin/account/employee/DetailEmployee.css";

moment.locale("id");

const { Title, Text } = Typography;

const STORAGE_KEY = "employee-profile-tab";
const DEFAULT_TAB = "profile";

const STATUS_CONFIG = {
  probation: { label: "Masa Percobaan", color: "orange" },
  contract: { label: "Kontrak", color: "blue" },
  permanent: { label: "Pegawai Tetap", color: "green" },
  resigned: { label: "Resign", color: "red" },
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

const TAB_CONFIG = [
  {
    key: "profile",
    label: "Profil & Pekerjaan",
    icon: UserOutlined,
    render: (data) => <TabProfile data={data} />,
  },
  {
    key: "career",
    label: "Riwayat Jabatan",
    icon: RiseOutlined,
    render: (data) => <TabCareerHistory data={data} />,
  },
  {
    key: "payroll",
    label: "Payroll & Legal",
    icon: BankOutlined,
    render: (data) => <TabPayroll data={data} />,
  },
  {
    key: "family",
    label: "Keluarga",
    icon: TeamOutlined,
    render: (data, employeeId) => (
      <TabFamily data={data} employeeId={employeeId} />
    ),
  },
  {
    key: "documents",
    label: "Dokumen",
    icon: FileOutlined,
    render: (data, employeeId) => (
      <TabDocuments data={data} employeeId={employeeId} />
    ),
  },
  {
    key: "education",
    label: "Pendidikan",
    icon: ReadOutlined,
    render: (data, employeeId) => (
      <TabEducation data={data} employeeId={employeeId} />
    ),
  },
  {
    key: "training",
    label: "Pelatihan",
    icon: TrophyOutlined,
    render: (data, employeeId) => (
      <TabTraning data={data} employeeId={employeeId} />
    ),
  },
  {
    key: "cv",
    label: "Curriculum Vitae",
    icon: SolutionOutlined,
    render: (data, employeeId) => (
      <TabCv data={data} employeeId={employeeId} />
    ),
  },
];

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const employeeId = user?.employeeId;

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const validKeys = TAB_CONFIG.map((tab) => tab.key);
    return saved && validKeys.includes(saved) ? saved : DEFAULT_TAB;
  });

  const {
    data: response,
    isLoading,
    isError,
  } = useGetEmployeeDetailQuery(employeeId, {
    skip: !employeeId,
  });

  const employeeData = response?.data;

  const handleTabChange = (key) => {
    setActiveTab(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  const tabItems = useMemo(() => {
    if (!employeeData) return [];

    return TAB_CONFIG.map(({ key, label, icon: Icon, render }) => ({
      key,
      label: (
        <span>
          <Icon />
          {label}
        </span>
      ),
      children: render(employeeData, employeeId),
    }));
  }, [employeeData, employeeId]);

  if (isLoading) {
    return (
      <MainLayout title="Profil Saya">
        <div className="employee-detail">
          <div className="employee-detail__loading">
            <Skeleton.Avatar active size={64} style={{ marginBottom: 16 }} />
            <Skeleton active paragraph={{ rows: 2 }} />
            <div style={{ marginTop: 24 }}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError || !employeeData) {
    return (
      <MainLayout title="Profil Saya">
        <div className="employee-detail__error">
          <Result
            status="404"
            title="Data Profil Tidak Ditemukan"
            subTitle="Profil pegawai tidak tersedia atau belum terhubung dengan akun Anda."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Muat Ulang
              </Button>
            }
          />
        </div>
      </MainLayout>
    );
  }

  const statusInfo = STATUS_CONFIG[employeeData.status] ?? {
    label: employeeData.status,
    color: "default",
  };

  return (
    <MainLayout title="Profil Saya">
      <div className="employee-detail">
        <header className="employee-detail__header">
          <div className="employee-detail__profile">
            <Avatar size={64} className="employee-detail__avatar">
              {getInitials(employeeData.fullName)}
            </Avatar>

            <div className="employee-detail__info">
              <Title level={4} className="employee-detail__name">
                {employeeData.fullName}
              </Title>

              <div className="employee-detail__meta">
                <Text className="employee-detail__nip">
                  <IdcardOutlined style={{ marginRight: 6 }} />
                  {employeeData.nip}
                </Text>
                <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
              </div>

              <div className="employee-detail__chips">
                <span className="employee-detail__chip">
                  <ApartmentOutlined />
                  {employeeData.department?.name ?? "Departemen belum diatur"}
                </span>
                <span className="employee-detail__chip">
                  <UserOutlined />
                  {employeeData.position?.name ?? "Jabatan belum diatur"}
                </span>
                {employeeData.joinDate && (
                  <span className="employee-detail__chip">
                    <CalendarOutlined />
                    Bergabung {moment(employeeData.joinDate).format("DD MMM YYYY")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="employee-detail__tabs-wrap">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="employee-detail__tabs"
            destroyInactiveTabPane={false}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
