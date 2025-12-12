import React from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  BranchesOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  TagOutlined,
} from "@ant-design/icons";
import { Tabs } from "antd";
import Department from "./department/Department";
import Position from "./position/Position";
import Holidays from "./holidays/Holidays";
import Leave from "./leave/Leave";

const Master = () => {
  const items = [
    {
      key: "1",
      label: "Departemen",
      icon: <BranchesOutlined />,
      children: <Department />,
    },
    {
      key: "2",
      label: "Jabatan",
      icon: <IdcardOutlined />,
      children: <Position />,
    },
    {
      key: "3",
      label: "Jenis Cuti",
      icon: <TagOutlined />,
      children: <Leave />,
    },
    {
      key: "4",
      label: "Kalender Libur",
      icon: <ScheduleOutlined />,
      children: <Holidays />,
    },
  ];
  return (
    <MainLayout title="Data Master">
      <Tabs items={items} />
    </MainLayout>
  );
};

export default Master;
