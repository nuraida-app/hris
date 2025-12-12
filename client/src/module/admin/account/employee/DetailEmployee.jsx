import React from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Flex, Spin, Tabs, Typography, Card, Result } from "antd";
import { useSearchParams } from "react-router-dom";
import { useGetEmployeeDetailQuery } from "../../../../service/admin/account/ApiEmployee";

// Import Komponen Tab Terpisah
import TabProfile from "../../../../component/employee/TabProfile";
import TabPayroll from "../../../../component/employee/TabPayroll";
import TabFamily from "../../../../component/employee/TabFamily";
import TabDocuments from "../../../../component/employee/TabDocuments";
import TabCareerHistory from "../../../../component/employee/TabCareerHistory";
import TabEducation from "../../../../component/employee/TabEducation";
import TabCv from "../../../../component/employee/TabCv";
import TabTraning from "../../../../component/employee/TabTraning";

const { Title, Text } = Typography;

const DetailEmployee = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeid");

  // Fetch Data Detail
  const {
    data: response,
    isLoading,
    isError,
  } = useGetEmployeeDetailQuery(employeeId, {
    skip: !employeeId, // Jangan fetch jika ID kosong
  });

  const employeeData = response?.data;

  const handleBack = () => {
    setSearchParams({}); // Hapus params untuk kembali ke list
  };

  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ height: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );

  if (isError || !employeeData)
    return (
      <Result
        status="404"
        title="Data Tidak Ditemukan"
        extra={<Button onClick={handleBack}>Kembali</Button>}
      />
    );

  // Definisi Tabs
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
      children: <TabFamily data={employeeData} employeeId={employeeId} />,
    },
    {
      key: "5",
      label: "Dokumen",
      children: <TabDocuments data={employeeData} employeeId={employeeId} />,
    },
    {
      key: "6",
      label: "Pendidikan",
      children: <TabEducation data={employeeData} employeeId={employeeId} />,
    },
    {
      key: "7",
      label: "Pelatihan",
      children: <TabTraning data={employeeData} employeeId={employeeId} />,
    },
    {
      key: "8",
      label: "Curriculum Vitae",
      children: <TabCv data={employeeData} employeeId={employeeId} />,
    },
  ];

  return (
    <Flex vertical gap="middle">
      {/* Header Section */}
      <Card size="small">
        <Flex align="center" gap="middle">
          <Button
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          />
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
  );
};

export default DetailEmployee;
