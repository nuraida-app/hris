import { Tabs } from "antd";
import MainLayout from "../../../component/layout/MainLayout";
import { IdcardOutlined, UserOutlined } from "@ant-design/icons";
import Admin from "./admin/Admin";
import Employee from "./employee/Employee";
import { useSearchParams } from "react-router-dom";
import DetailEmployee from "./employee/DetailEmployee";

const Account = () => {
  const [searchParams] = useSearchParams();

  const employeeId = searchParams.get("employeeid");

  const items = [
    { label: "Admin", icon: <IdcardOutlined />, children: <Admin />, key: "1" },
    {
      label: "Pegawai",
      icon: <UserOutlined />,
      children: <Employee />,
      key: "2",
    },
  ];
  return (
    <MainLayout title="Management Pegawai">
      {employeeId ? <DetailEmployee /> : <Tabs items={items} />}
    </MainLayout>
  );
};

export default Account;
