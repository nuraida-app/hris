import React, { useMemo, useState } from "react";
import { Tabs, Typography } from "antd";
import {
  IdcardOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import MainLayout from "../../../component/layout/MainLayout";
import Admin from "./admin/Admin";
import Employee from "./employee/Employee";
import DetailEmployee from "./employee/DetailEmployee";
import "./Account.css";

const { Title, Text } = Typography;

const STORAGE_KEY = "account-active-tab";
const DEFAULT_TAB = "employee";

const TAB_CONFIG = [
  {
    key: "admin",
    label: "Admin",
    icon: IdcardOutlined,
    description: "Kelola akun pengguna dengan akses sistem",
    children: <Admin />,
  },
  {
    key: "employee",
    label: "Pegawai",
    icon: TeamOutlined,
    description: "Data lengkap pegawai dan profil kepegawaian",
    children: <Employee />,
  },
];

const Account = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeid");
  const employeeName = searchParams.get("employeeName");

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const validKeys = TAB_CONFIG.map((tab) => tab.key);
    return saved && validKeys.includes(saved) ? saved : DEFAULT_TAB;
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    localStorage.setItem(STORAGE_KEY, key);
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  const tabItems = useMemo(
    () =>
      TAB_CONFIG.map(({ key, label, icon: Icon, children }) => ({
        key,
        label: (
          <span>
            <Icon />
            {label}
          </span>
        ),
        children,
      })),
    []
  );

  const activeConfig = TAB_CONFIG.find((tab) => tab.key === activeTab);
  const detailTitle = employeeName
    ? employeeName.replace(/-/g, " ")
    : "Detail Pegawai";

  if (employeeId) {
    return (
      <MainLayout title="Manajemen Pegawai">
        <div className="account-page account-page--detail">
          <nav className="account-page__breadcrumb" aria-label="Breadcrumb">
            <button
              type="button"
              className="account-page__breadcrumb-link"
              onClick={handleBackToList}
            >
              Manajemen Pegawai
            </button>
            <span className="account-page__breadcrumb-sep">/</span>
            <span className="account-page__breadcrumb-current">
              {detailTitle}
            </span>
          </nav>

          <div className="account-page__detail-panel">
            <DetailEmployee />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Manajemen Pegawai">
      <div className="account-page">
        <div className="account-page__intro">
          <Title level={4} className="account-page__intro-title">
            <UserSwitchOutlined style={{ marginRight: 8 }} />
            Manajemen Akun & Pegawai
          </Title>
          <Text className="account-page__intro-desc">
            Kelola akun admin sistem dan data pegawai secara terpusat. Tambah,
            ubah, dan pantau informasi kepegawaian dari satu halaman.
          </Text>
        </div>

        <div
          className="account-page__nav"
          role="tablist"
          aria-label="Menu manajemen pegawai"
        >
          {TAB_CONFIG.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={`account-page__nav-card${
                activeTab === key ? " account-page__nav-card--active" : ""
              }`}
              onClick={() => handleTabChange(key)}
            >
              <span className="account-page__nav-icon">
                <Icon />
              </span>
              <span className="account-page__nav-content">
                <span className="account-page__nav-label">{label}</span>
                <span className="account-page__nav-desc">{description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="account-page__content">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="account-tabs"
            destroyInactiveTabPane={false}
            tabBarExtraContent={
              activeConfig ? (
                <Text type="secondary" style={{ fontSize: 13, paddingRight: 4 }}>
                  {activeConfig.description}
                </Text>
              ) : null
            }
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Account;
