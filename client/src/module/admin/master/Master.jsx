import React, { useMemo, useState } from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  BranchesOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  TagOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Tabs, Typography } from "antd";
import Department from "./department/Department";
import Position from "./position/Position";
import Holidays from "./holidays/Holidays";
import Leave from "./leave/Leave";
import "./Master.css";

const { Title, Text } = Typography;

const STORAGE_KEY = "master-active-tab";
const DEFAULT_TAB = "department";

const TAB_CONFIG = [
  {
    key: "department",
    label: "Departemen",
    icon: BranchesOutlined,
    description: "Kelola unit kerja dan struktur organisasi",
    children: <Department />,
  },
  {
    key: "position",
    label: "Jabatan",
    icon: IdcardOutlined,
    description: "Atur posisi dan level jabatan pegawai",
    children: <Position />,
  },
  {
    key: "leave",
    label: "Jenis Cuti",
    icon: TagOutlined,
    description: "Konfigurasi tipe dan kuota cuti",
    children: <Leave />,
  },
  {
    key: "holidays",
    label: "Kalender Libur",
    icon: ScheduleOutlined,
    description: "Jadwal hari libur dan cuti bersama",
    children: <Holidays />,
  },
];

const Master = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const validKeys = TAB_CONFIG.map((tab) => tab.key);
    return saved && validKeys.includes(saved) ? saved : DEFAULT_TAB;
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    localStorage.setItem(STORAGE_KEY, key);
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

  return (
    <MainLayout title="Data Master">
      <div className="master-page">
        <div className="master-page__intro">
          <Title level={4} className="master-page__intro-title">
            <DatabaseOutlined style={{ marginRight: 8 }} />
            Manajemen Data Master
          </Title>
          <Text className="master-page__intro-desc">
            Pusat pengaturan data referensi HRIS. Kelola departemen, jabatan,
            jenis cuti, dan kalender libur sebagai fondasi proses kepegawaian.
          </Text>
        </div>

        <div className="master-page__nav" role="tablist" aria-label="Menu data master">
          {TAB_CONFIG.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={`master-page__nav-card${
                activeTab === key ? " master-page__nav-card--active" : ""
              }`}
              onClick={() => handleTabChange(key)}
            >
              <span className="master-page__nav-icon">
                <Icon />
              </span>
              <span className="master-page__nav-content">
                <span className="master-page__nav-label">{label}</span>
                <span className="master-page__nav-desc">{description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="master-page__content">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="master-tabs"
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

export default Master;
