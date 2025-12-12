import React from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  List,
  Avatar,
  Tag,
  Typography,
  Spin,
  Alert,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  useGetAttendanceTodayQuery,
  useGetDashboardSummaryQuery,
  useGetEmployeeDemographicsQuery,
  useGetNewHiresQuery,
  useGetPendingLeavesQuery,
} from "../../../service/dashboard/ApiDash";

const { Title, Text } = Typography;

const AdminDash = () => {
  // 1. Fetching Data dari semua Endpoint
  const { data: summaryData, isLoading: loadSummary } =
    useGetDashboardSummaryQuery();
  const { data: attendanceData, isLoading: loadAttendance } =
    useGetAttendanceTodayQuery();
  const { data: demoData, isLoading: loadDemo } =
    useGetEmployeeDemographicsQuery();
  const { data: leavesData, isLoading: loadLeaves } =
    useGetPendingLeavesQuery();
  const { data: hiresData, isLoading: loadHires } = useGetNewHiresQuery();

  // Loading State Global Sederhana
  const isLoading =
    loadSummary || loadAttendance || loadDemo || loadLeaves || loadHires;

  if (isLoading) {
    return (
      <MainLayout title="Admin Dashboard">
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <Spin size="large" />
        </div>
      </MainLayout>
    );
  }

  // Error Handling (Optional, jika data kosong/error)
  if (!summaryData || !attendanceData) {
    return (
      <MainLayout title="Admin Dashboard">
        <Alert
          message="Gagal memuat data"
          description="Silakan periksa koneksi server atau coba muat ulang."
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  // --- Helpers untuk Data ---
  const summary = summaryData?.data || {};
  const attendance = attendanceData?.data || {};
  const pendingLeaves = leavesData?.data || [];
  const newHires = hiresData?.data || [];

  // Format Data Demografi untuk Table Kecil
  const statusDataSource = demoData?.data?.byStatus?.map((item, idx) => ({
    key: idx,
    status: item.status,
    count: item.count,
  }));

  // --- Column Definitions ---

  // Kolom untuk Tabel Cuti Pending
  const leaveColumns = [
    {
      title: "Nama Pegawai",
      dataIndex: ["Employee", "fullName"],
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Departemen",
      dataIndex: ["Employee", "department", "name"],
      key: "dept",
      responsive: ["md"], // Sembunyikan di layar kecil
    },
    {
      title: "Tipe Cuti",
      dataIndex: "leaveType",
      key: "type",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Tanggal",
      key: "date",
      render: (_, record) => (
        <span>
          {record.startDate} s/d {record.endDate}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: () => <Tag color="orange">Menunggu</Tag>,
    },
  ];

  return (
    <MainLayout title={"Admin Dashboard"}>
      <div style={{ padding: "0 10px" }}>
        {/* SECTION 1: SUMMARY CARDS */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Total Pegawai"
                value={summary.totalEmployees}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Pegawai Aktif"
                value={summary.activeEmployees}
                prefix={<UserOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Departemen"
                value={summary.totalDepartments}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Cuti Pending"
                value={summary.pendingLeaves}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#cf1322" }}
              />
            </Card>
          </Col>
        </Row>

        {/* SECTION 2: ATTENDANCE & DEMOGRAPHICS */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* 2.1 Statistik Absensi Hari Ini */}
          <Col xs={24} md={16}>
            <Card title={`Kehadiran Hari Ini (${attendanceData?.date})`}>
              <Row gutter={[16, 16]} justify="space-around">
                <Col span={4} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Hadir"
                    value={attendance.present || 0}
                    valueStyle={{ color: "#3f8600" }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={4} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Telat"
                    value={attendance.late || 0}
                    valueStyle={{ color: "#faad14" }}
                    prefix={<WarningOutlined />}
                  />
                </Col>
                <Col span={4} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Absen/Alpha"
                    value={attendance.absent || 0}
                    valueStyle={{ color: "#cf1322" }}
                    prefix={<CloseCircleOutlined />}
                  />
                </Col>
                <Col span={4} style={{ textAlign: "center" }}>
                  <Statistic
                    title="Belum Absen"
                    value={attendance.not_clocked_in || 0}
                    valueStyle={{ color: "#8c8c8c" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 2.2 Karyawan Baru */}
          <Col xs={24} md={8}>
            <Card title="Karyawan Baru Bulan Ini" style={{ height: "100%" }}>
              <List
                itemLayout="horizontal"
                dataSource={newHires}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ backgroundColor: "#87d068" }}
                          icon={<UserOutlined />}
                        />
                      }
                      title={item.fullName}
                      description={`${item.position?.name} • Join: ${item.joinDate}`}
                    />
                  </List.Item>
                )}
                locale={{ emptyText: "Tidak ada karyawan baru" }}
              />
            </Card>
          </Col>
        </Row>

        {/* SECTION 3: PENDING LEAVES TABLE & STATUS */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title="Pengajuan Cuti Menunggu Persetujuan">
              <Table
                columns={leaveColumns}
                dataSource={pendingLeaves}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: "Tidak ada pengajuan cuti pending" }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Status Kepegawaian">
              <Table
                dataSource={statusDataSource}
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (text) => text.toUpperCase(),
                  },
                  { title: "Jumlah", dataIndex: "count", key: "count" },
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default AdminDash;
