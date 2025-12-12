import React from "react";
import MainLayout from "../../../component/layout/MainLayout";
import { ApartmentOutlined, CloudSyncOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import BackupNRestore from "./BackupNRestore";
import ManageDb from "./ManageDb";

const Database = () => {
  const items = [
    {
      key: "1",
      label: "Backup & Restore",
      icon: <CloudSyncOutlined />,
      children: <BackupNRestore />, // Integrasi Komponen
    },
    {
      key: "2",
      label: "Manage Database",
      icon: <ApartmentOutlined />,
      children: <ManageDb />, // Integrasi Komponen
    },
  ];

  return (
    <MainLayout title={`Manajemen Database`}>
      <Tabs defaultActiveKey="1" items={items} type="card" />
    </MainLayout>
  );
};

export default Database;
