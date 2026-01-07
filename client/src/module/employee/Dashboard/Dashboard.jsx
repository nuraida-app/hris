import React from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Tag,
  Skeleton,
  Alert,
  Empty,
  Divider,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import MainLayout from "../../../component/layout/MainLayout";
import { useGetEmployeeSummaryQuery } from "../../../service/dashboard/ApiDash";

const { Title, Text } = Typography;

const Dashboard = () => {
  // 1. Mengambil data dari API
  const { data: apiResponse, isLoading, error } = useGetEmployeeSummaryQuery();
  const data = apiResponse?.data;

  // Helper untuk format jam
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return moment(isoString).format("HH:mm");
  };

  // Helper untuk format tanggal indonesia
  const formatDateIndo = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).locale("id").format("dddd, D MMMM YYYY");
  };

  // Helper warna status
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "success";
      case "late":
        return "warning";
      case "absent":
        return "error";
      case "permission":
        return "processing";
      default:
        return "default";
    }
  };

  // Helper text status
  const getStatusText = (status) => {
    switch (status) {
      case "present":
        return "Hadir Tepat Waktu";
      case "late":
        return "Terlambat";
      case "absent":
        return "Alpha / Belum Absen";
      case "permission":
        return "Izin / Sakit";
      default:
        return "Belum Hadir";
    }
  };

  // Tampilan Loading
  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div style={{ padding: 24 }}>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
          <br />
          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Skeleton.Button
                active
                block
                shape="square"
                style={{ height: 100 }}
              />
            </Col>
            <Col span={6}>
              <Skeleton.Button
                active
                block
                shape="square"
                style={{ height: 100 }}
              />
            </Col>
            <Col span={6}>
              <Skeleton.Button
                active
                block
                shape="square"
                style={{ height: 100 }}
              />
            </Col>
            <Col span={6}>
              <Skeleton.Button
                active
                block
                shape="square"
                style={{ height: 100 }}
              />
            </Col>
          </Row>
        </div>
      </MainLayout>
    );
  }

  // Tampilan Error
  if (error || !data) {
    return (
      <MainLayout title="Dashboard">
        <Alert
          message="Error"
          description="Gagal memuat data dashboard. Silakan coba lagi nanti."
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  // Destructure data agar lebih rapi
  const { profile, today, monthlyStats, latestLeave, nextHoliday } = data;

  return (
    <MainLayout title={`Halo, ${profile?.name} 👋`}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* SECTION 1: ABSENSI HARI INI */}
        <Card
          style={{
            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            color: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 15px rgba(24, 144, 255, 0.3)",
          }}
        >
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
                {formatDateIndo(today?.date)}
              </Text>
              <Title level={2} style={{ color: "#fff", margin: "8px 0" }}>
                {formatTime(new Date())}{" "}
                <span style={{ fontSize: "1rem", fontWeight: 400 }}>WIB</span>
              </Title>
              <Tag
                color={today?.status === "late" ? "volcano" : "green"}
                style={{ fontSize: 14, padding: "4px 10px" }}
              >
                Status: {getStatusText(today?.status)}
              </Tag>
            </Col>

            <Col xs={24} md={12}>
              <Row gutter={16} style={{ textAlign: "center" }}>
                <Col span={12}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ fontSize: 24, color: "#fff", marginBottom: 8 }}
                    />
                    <div style={{ color: "rgba(255,255,255,0.8)" }}>
                      Jam Masuk
                    </div>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>
                      {formatTime(today?.clockIn)}
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: 16,
                      borderRadius: 8,
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: 24, color: "#fff", marginBottom: 8 }}
                    />
                    <div style={{ color: "rgba(255,255,255,0.8)" }}>
                      Jam Pulang
                    </div>
                    <div style={{ fontSize: 20, fontWeight: "bold" }}>
                      {formatTime(today?.clockOut)}
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>

        {/* SECTION 2: STATISTIK BULANAN */}
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Hadir"
                value={monthlyStats?.present || 0}
                valueStyle={{ color: "#3f8600" }}
                prefix={<CheckCircleOutlined />}
                suffix="Hari"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Terlambat"
                value={monthlyStats?.late || 0}
                valueStyle={{ color: "#faad14" }}
                prefix={<WarningOutlined />}
                suffix="Kali"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Izin / Sakit"
                value={monthlyStats?.permission || 0}
                valueStyle={{ color: "#1890ff" }}
                prefix={<InfoCircleOutlined />}
                suffix="Hari"
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card hoverable>
              <Statistic
                title="Alpha"
                value={monthlyStats?.absent || 0}
                valueStyle={{ color: "#cf1322" }}
                prefix={<CloseCircleOutlined />}
                suffix="Hari"
              />
            </Card>
          </Col>
        </Row>

        {/* SECTION 3: INFORMASI LAINNYA */}
        <Row gutter={[16, 16]}>
          {/* Status Cuti Terakhir */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span>
                  <InfoCircleOutlined /> Status Cuti Terakhir
                </span>
              }
              style={{ height: "100%" }}
            >
              {latestLeave ? (
                <div>
                  <Row justify="space-between" align="middle">
                    <Text strong style={{ fontSize: 16 }}>
                      {latestLeave.leaveType?.name}
                    </Text>
                    <Tag
                      color={
                        latestLeave.status === "approved"
                          ? "green"
                          : latestLeave.status === "rejected"
                          ? "red"
                          : "orange"
                      }
                    >
                      {latestLeave.status.toUpperCase()}
                    </Tag>
                  </Row>
                  <Divider style={{ margin: "12px 0" }} />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#555",
                    }}
                  >
                    <CalendarOutlined />
                    <Text>
                      {formatDateIndo(latestLeave.startDate)} s/d{" "}
                      {formatDateIndo(latestLeave.endDate)}
                    </Text>
                  </div>
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Belum ada pengajuan cuti"
                />
              )}
            </Card>
          </Col>

          {/* Hari Libur Selanjutnya */}
          <Col xs={24} md={12}>
            <Card
              title={
                <span>
                  <CalendarOutlined /> Hari Libur Terdekat
                </span>
              }
              style={{ height: "100%" }}
            >
              {nextHoliday ? (
                <Alert
                  message={
                    <Text strong style={{ fontSize: 16 }}>
                      {nextHoliday.name}
                    </Text>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Tag color="blue">
                        {formatDateIndo(nextHoliday.startDate)}
                      </Tag>
                      {nextHoliday.isCutiBersama && (
                        <Tag color="purple">Cuti Bersama</Tag>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<CalendarOutlined style={{ fontSize: 24 }} />}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Tidak ada hari libur dekat"
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
