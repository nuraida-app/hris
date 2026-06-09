import React, { useMemo, useState } from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  ApartmentOutlined,
  CloudSyncOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { Tabs, Typography } from "antd";
import BackupNRestore from "./BackupNRestore";
import ManageDb from "./ManageDb";
import "./Database.css";

const { Title, Text } = Typography;

const STORAGE_KEY = "database-active-tab";
const DEFAULT_TAB = "backup";

const TAB_CONFIG = [
  {
    key: "backup",
    label: "Backup & Restore",
    icon: CloudSyncOutlined,
    description: "Cadangkan dan pulihkan data sistem",
    children: <BackupNRestore />,
  },
  {
    key: "manage",
    label: "Kelola Tabel",
    icon: ApartmentOutlined,
    description: "Pantau dan kosongkan tabel database",
    children: <ManageDb />,
  },
];

const Database = () => {
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
    <MainLayout title="Manajemen Database">
      <div className="database-page">
        <div className="database-page__intro">
          <Title level={4} className="database-page__intro-title">
            <DatabaseOutlined style={{ marginRight: 8 }} />
            Manajemen Database
          </Title>
          <Text className="database-page__intro-desc">
            Kelola cadangan data HRIS dan operasi database. Lakukan backup
            berkala dan gunakan fitur restore atau kosongkan tabel dengan
            hati-hati.
          </Text>
        </div>

        <div
          className="database-page__nav"
          role="tablist"
          aria-label="Menu manajemen database"
        >
          {TAB_CONFIG.map(({ key, label, icon: Icon, description }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeTab === key}
              className={`database-page__nav-card${
                activeTab === key ? " database-page__nav-card--active" : ""
              }`}
              onClick={() => handleTabChange(key)}
            >
              <span className="database-page__nav-icon">
                <Icon />
              </span>
              <span className="database-page__nav-content">
                <span className="database-page__nav-label">{label}</span>
                <span className="database-page__nav-desc">{description}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="database-page__content">
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="database-tabs"
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

export default Database;
