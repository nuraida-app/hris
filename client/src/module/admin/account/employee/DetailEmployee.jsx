import React, { useMemo, useState } from "react";
import {
  ArrowLeftOutlined,
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
import {
  Avatar,
  Button,
  Tabs,
  Typography,
  Result,
  Tag,
  Skeleton,
} from "antd";
import moment from "moment";
import "moment/locale/id";
import { useSearchParams } from "react-router-dom";
import { useGetEmployeeDetailQuery } from "../../../../service/account/ApiEmployee";
import TabProfile from "../../../../component/employee/TabProfile";
import TabPayroll from "../../../../component/employee/TabPayroll";
import TabFamily from "../../../../component/employee/TabFamily";
import TabDocuments from "../../../../component/employee/TabDocuments";
import TabCareerHistory from "../../../../component/employee/TabCareerHistory";
import TabEducation from "../../../../component/employee/TabEducation";
import TabCv from "../../../../component/employee/TabCv";
import TabTraning from "../../../../component/employee/TabTraning";
import "./DetailEmployee.css";

moment.locale("id");

const { Title, Text } = Typography;

const STORAGE_KEY = "employee-detail-tab";
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

const DetailEmployee = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeid");

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

  const handleBack = () => {
    setSearchParams({});
  };

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
      <div className="employee-detail">
        <div className="employee-detail__loading">
          <Skeleton.Avatar active size={64} style={{ marginBottom: 16 }} />
          <Skeleton active paragraph={{ rows: 2 }} />
          <div style={{ marginTop: 24 }}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !employeeData) {
    return (
      <div className="employee-detail__error">
        <Result
          status="404"
          title="Data Pegawai Tidak Ditemukan"
          subTitle="Pegawai mungkin telah dihapus atau ID tidak valid."
          extra={
            <Button type="primary" onClick={handleBack}>
              Kembali ke Daftar
            </Button>
          }
        />
      </div>
    );
  }

  const statusInfo = STATUS_CONFIG[employeeData.status] ?? {
    label: employeeData.status,
    color: "default",
  };

  return (
    <div className="employee-detail">
      <header className="employee-detail__header">
        <Button
          className="employee-detail__back"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          aria-label="Kembali ke daftar pegawai"
        />

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
                NIP: {employeeData.nip}
              </Text>
              {employeeData.nuptk && (
                <Text className="employee-detail__nip">
                  <IdcardOutlined style={{ marginRight: 6 }} />
                  NUPTK: {employeeData.nuptk}
                </Text>
              )}
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
  );
};

export default DetailEmployee;
