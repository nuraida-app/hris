import React from "react";
import { useSelector } from "react-redux";
import { Button, Flex, Spin, Tabs, Typography, Card, Result } from "antd";

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

const { Title, Text } = Typography;

const Profile = () => {
  const { user } = useSelector((state) => state.user);

  const {
    data: response,
    isLoading,
    isError,
  } = useGetEmployeeDetailQuery(user?.id, {
    skip: !user?.id,
  });
  const employeeData = response?.data;

  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ height: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );

  if (isError || !employeeData)
    return <Result status="404" title="Data Tidak Ditemukan" />;

  const items = [
    {
      key: "1",
      label: "Profil & Pekerjaan",
      children: <TabProfile data={employeeData} />,
    },
    {
      key: "2",
      label: "Riwayat Jabatan", // <-- TAB BARU DISINI (Biasanya urutan ke-2 penting)
      children: <TabCareerHistory data={employeeData} />,
    },
    {
      key: "3",
      label: "Payroll & Legal",
      children: <TabPayroll data={employeeData} />,
    },
    {
      key: "4",
      label: "Keluarga",
      children: <TabFamily data={employeeData} employeeId={user?.id} />,
    },
    {
      key: "5",
      label: "Dokumen",
      children: <TabDocuments data={employeeData} employeeId={user?.id} />,
    },
    {
      key: "6",
      label: "Pendidikan",
      children: <TabEducation data={employeeData} employeeId={user?.id} />,
    },
    {
      key: "7",
      label: "Pelatihan",
      children: <TabTraning data={employeeData} employeeId={user?.id} />,
    },
    {
      key: "8",
      label: "Curriculum Vitae",
      children: <TabCv data={employeeData} employeeId={user?.id} />,
    },
  ];

  return (
    <MainLayout title={`Profil ${user?.name}`}>
      <Flex vertical gap="middle">
        {/* Header Section */}
        <Card size="small">
          <Flex align="center" gap="middle">
            <Flex vertical>
              <Title level={4} style={{ margin: 0 }}>
                {employeeData.fullName}
              </Title>
              <Text type="secondary">
                {employeeData.nip} | {employeeData.position?.name} -{" "}
                {employeeData.department?.name}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Tabs Content */}
        <Card>
          <Tabs defaultActiveKey="1" items={items} />
        </Card>
      </Flex>
    </MainLayout>
  );
};

export default Profile;
