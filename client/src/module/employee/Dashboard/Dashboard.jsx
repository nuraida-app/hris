import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Skeleton,
  Alert,
  Empty,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id";
import MainLayout from "../../../component/layout/MainLayout";
import { useGetEmployeeSummaryQuery } from "../../../service/dashboard/ApiDash";
import "./Dashboard.css";

moment.locale("id");

const { Title, Text } = Typography;

const LEAVE_STATUS = {
  approved: { label: "Disetujui", color: "green" },
  rejected: { label: "Ditolak", color: "red" },
  pending: { label: "Menunggu", color: "orange" },
};

const ATTENDANCE_STATUS = {
  present: { label: "Hadir Tepat Waktu", color: "success" },
  late: { label: "Terlambat", color: "warning" },
  absent: { label: "Alpha / Belum Absen", color: "error" },
  permission: { label: "Izin / Sakit", color: "processing" },
  not_present: { label: "Belum Hadir", color: "default" },
};

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  return moment(isoString).format("HH:mm");
};

const formatDateIndo = (dateString) => {
  if (!dateString) return "-";
  return moment(dateString).format("dddd, D MMMM YYYY");
};

const StatCard = ({ label, value, suffix, icon, iconClass, valueClass }) => (
  <div className="emp-dash__stat-card">
    <div className="emp-dash__stat-inner">
      <div>
        <span className="emp-dash__stat-label">{label}</span>
        <span className={`emp-dash__stat-value ${valueClass}`}>
          {value ?? 0}
          {suffix && <span className="emp-dash__stat-suffix">{suffix}</span>}
        </span>
      </div>
      <span className={`emp-dash__stat-icon ${iconClass}`}>{icon}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [now, setNow] = useState(moment());
  const { data: apiResponse, isLoading, error } = useGetEmployeeSummaryQuery();
  const data = apiResponse?.data;

  useEffect(() => {
    const timer = setInterval(() => setNow(moment()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="emp-dash__loading">
          <Skeleton active paragraph={{ rows: 3 }} />
          <Row gutter={[12, 12]}>
            {[1, 2, 3, 4].map((i) => (
              <Col xs={12} md={6} key={i}>
                <Skeleton.Button active block style={{ height: 100 }} />
              </Col>
            ))}
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Col>
            <Col xs={24} md={12}>
              <Skeleton active paragraph={{ rows: 4 }} />
            </Col>
          </Row>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout title="Dashboard">
        <Alert
          message="Gagal memuat data"
          description="Tidak dapat memuat ringkasan dashboard. Silakan coba lagi nanti."
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  const { profile, today, monthlyStats, latestLeave, nextHoliday } = data;
  const statusInfo = ATTENDANCE_STATUS[today?.status] ?? ATTENDANCE_STATUS.not_present;
  const leaveStatus = latestLeave
    ? LEAVE_STATUS[latestLeave.status] ?? {
        label: latestLeave.status,
        color: "default",
      }
    : null;

  return (
    <MainLayout title="Dashboard">
      <div className="emp-dash">
        <div className="emp-dash__hero">
          <Row align="middle" gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Text
                style={{
                  display: "block",
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                Selamat datang, {profile?.name}
              </Text>
              <span className="emp-dash__hero-date">
                {formatDateIndo(today?.date)}
              </span>
              <Title level={2} className="emp-dash__hero-title">
                {now.format("HH:mm")}
                <span className="emp-dash__hero-time"> WIB</span>
              </Title>
              <div className="emp-dash__hero-status">
                <Tag color={statusInfo.color} style={{ fontSize: 13, padding: "4px 12px" }}>
                  {statusInfo.label}
                </Tag>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="emp-dash__clock-grid">
                <div className="emp-dash__clock-item">
                  <ClockCircleOutlined className="emp-dash__clock-item-icon" />
                  <span className="emp-dash__clock-item-label">Jam Masuk</span>
                  <span className="emp-dash__clock-item-value">
                    {formatTime(today?.clockIn)}
                  </span>
                </div>
                <div className="emp-dash__clock-item">
                  <CheckCircleOutlined className="emp-dash__clock-item-icon" />
                  <span className="emp-dash__clock-item-label">Jam Pulang</span>
                  <span className="emp-dash__clock-item-value">
                    {formatTime(today?.clockOut)}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 13, marginBottom: 12, display: "block" }}>
            Rekap absensi bulan {now.format("MMMM YYYY")}
          </Text>
          <div className="emp-dash__stats">
            <StatCard
              label="Hadir"
              value={monthlyStats?.present}
              suffix="hari"
              icon={<CheckCircleOutlined />}
              iconClass="emp-dash__stat-icon--present"
              valueClass="emp-dash__stat-value--present"
            />
            <StatCard
              label="Terlambat"
              value={monthlyStats?.late}
              suffix="kali"
              icon={<WarningOutlined />}
              iconClass="emp-dash__stat-icon--late"
              valueClass="emp-dash__stat-value--late"
            />
            <StatCard
              label="Izin / Sakit"
              value={monthlyStats?.permission}
              suffix="hari"
              icon={<InfoCircleOutlined />}
              iconClass="emp-dash__stat-icon--permission"
              valueClass="emp-dash__stat-value--permission"
            />
            <StatCard
              label="Alpha"
              value={monthlyStats?.absent}
              suffix="hari"
              icon={<CloseCircleOutlined />}
              iconClass="emp-dash__stat-icon--absent"
              valueClass="emp-dash__stat-value--absent"
            />
          </div>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              className="emp-dash__panel"
              title={
                <span>
                  <InfoCircleOutlined className="emp-dash__panel-title-icon" />
                  Status Cuti Terakhir
                </span>
              }
            >
              {latestLeave ? (
                <>
                  <div className="emp-dash__leave-row">
                    <Text strong style={{ fontSize: 16 }}>
                      {latestLeave.leaveType?.name}
                    </Text>
                    {leaveStatus && (
                      <Tag color={leaveStatus.color}>{leaveStatus.label}</Tag>
                    )}
                  </div>
                  <div className="emp-dash__leave-dates">
                    <CalendarOutlined />
                    <span>
                      {moment(latestLeave.startDate).format("DD MMM YYYY")} –{" "}
                      {moment(latestLeave.endDate).format("DD MMM YYYY")}
                    </span>
                  </div>
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Belum ada pengajuan cuti"
                />
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              className="emp-dash__panel"
              title={
                <span>
                  <CalendarOutlined className="emp-dash__panel-title-icon" />
                  Hari Libur Terdekat
                </span>
              }
            >
              {nextHoliday ? (
                <Alert
                  className="emp-dash__holiday-alert"
                  message={
                    <Text strong style={{ fontSize: 16 }}>
                      {nextHoliday.name}
                    </Text>
                  }
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Tag color="purple">
                        {moment(nextHoliday.startDate).format("DD MMMM YYYY")}
                      </Tag>
                      {nextHoliday.isCutiBersama && (
                        <Tag color="magenta">Cuti Bersama</Tag>
                      )}
                    </div>
                  }
                  type="info"
                  showIcon
                  icon={<CalendarOutlined />}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Tidak ada hari libur terdekat"
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
