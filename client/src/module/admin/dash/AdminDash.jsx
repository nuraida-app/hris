import React, { useMemo } from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  Row,
  Col,
  Card,
  Table,
  List,
  Avatar,
  Tag,
  Typography,
  Alert,
  Skeleton,
  Empty,
  Progress,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  RiseOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id";
import { useSelector } from "react-redux";
import {
  useGetAttendanceTodayQuery,
  useGetDashboardSummaryQuery,
  useGetEmployeeDemographicsQuery,
  useGetNewHiresQuery,
  useGetPendingLeavesQuery,
} from "../../../service/dashboard/ApiDash";
import "./AdminDash.css";

moment.locale("id");

const { Title, Text } = Typography;

const STATUS_LABELS = {
  permanent: "Tetap",
  contract: "Kontrak",
  probation: "Masa Percobaan",
  internship: "Magang",
  resigned: "Resign",
  active: "Aktif",
  inactive: "Nonaktif",
};

const GENDER_LABELS = {
  male: "Laki-laki",
  female: "Perempuan",
};

const formatLabel = (value, map) =>
  map[value?.toLowerCase?.()] ?? value?.replace?.(/_/g, " ") ?? "-";

const formatDate = (date) =>
  date ? moment(date).format("DD MMM YYYY") : "-";

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "P";

const StatCard = ({ label, value, hint, icon, iconClass, loading }) => (
  <Card className="admin-dash__stat-card" bordered={false}>
    {loading ? (
      <Skeleton active paragraph={{ rows: 2 }} />
    ) : (
      <div className="admin-dash__stat-inner">
        <div className="admin-dash__stat-content">
          <span className="admin-dash__stat-label">{label}</span>
          <span className="admin-dash__stat-value">{value ?? 0}</span>
          {hint && <span className="admin-dash__stat-hint">{hint}</span>}
        </div>
        <div className={`admin-dash__stat-icon ${iconClass}`}>{icon}</div>
      </div>
    )}
  </Card>
);

const DemographicBar = ({ label, count, total, tagColor }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="admin-dash__demo-item">
      <div className="admin-dash__demo-item-info">
        <Tag color={tagColor}>{label}</Tag>
      </div>
      <div className="admin-dash__demo-bar-wrap">
        <div className="admin-dash__demo-bar">
          <div
            className="admin-dash__demo-bar-fill"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="admin-dash__demo-count">{count}</span>
    </div>
  );
};

const AdminDash = () => {
  const { user } = useSelector((state) => state.user);

  const {
    data: summaryData,
    isLoading: loadSummary,
    isError: errorSummary,
  } = useGetDashboardSummaryQuery();
  const {
    data: attendanceData,
    isLoading: loadAttendance,
    isError: errorAttendance,
  } = useGetAttendanceTodayQuery();
  const {
    data: demoData,
    isLoading: loadDemo,
    isError: errorDemo,
  } = useGetEmployeeDemographicsQuery();
  const {
    data: leavesData,
    isLoading: loadLeaves,
    isError: errorLeaves,
  } = useGetPendingLeavesQuery();
  const {
    data: hiresData,
    isLoading: loadHires,
    isError: errorHires,
  } = useGetNewHiresQuery();

  const summary = summaryData?.data ?? {};
  const attendance = attendanceData?.data ?? {};
  const pendingLeaves = leavesData?.data ?? [];
  const newHires = hiresData?.data ?? [];

  const activeEmployees = summary.activeEmployees ?? 0;
  const attendedToday =
    (attendance.present ?? 0) +
    (attendance.late ?? 0) +
    (attendance.permission ?? 0);
  const attendanceRate =
    activeEmployees > 0
      ? Math.round((attendedToday / activeEmployees) * 100)
      : 0;

  const statusItems = useMemo(() => {
    const items = demoData?.data?.byStatus ?? [];
    return items.map((item, idx) => ({
      key: idx,
      label: formatLabel(item.status, STATUS_LABELS),
      count: Number(item.count ?? 0),
    }));
  }, [demoData]);

  const genderItems = useMemo(() => {
    const items = demoData?.data?.byGender ?? [];
    return items.map((item, idx) => ({
      key: idx,
      label: formatLabel(item.gender, GENDER_LABELS),
      count: Number(item.count ?? 0),
    }));
  }, [demoData]);

  const statusTotal = statusItems.reduce((sum, item) => sum + item.count, 0);
  const genderTotal = genderItems.reduce((sum, item) => sum + item.count, 0);

  const leaveColumns = [
    {
      title: "Nama Pegawai",
      dataIndex: ["employee", "fullName"],
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Departemen",
      dataIndex: ["employee", "department", "name"],
      key: "dept",
      responsive: ["md"],
      render: (text) => text || "-",
    },
    {
      title: "Tipe Cuti",
      key: "type",
      render: (_, record) => (
        <Tag color="purple">{record.leaveType?.name ?? "-"}</Tag>
      ),
    },
    {
      title: "Periode",
      key: "date",
      render: (_, record) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {formatDate(record.startDate)} – {formatDate(record.endDate)}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="orange">Menunggu</Tag>,
    },
  ];

  const hasCriticalError = errorSummary && errorAttendance;
  const displayName =
    user?.displayName || user?.name || user?.username || "Admin";

  if (hasCriticalError) {
    return (
      <MainLayout title="Admin Dashboard">
        <Alert
          message="Gagal memuat data"
          description="Silakan periksa koneksi server atau coba muat ulang halaman."
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Admin Dashboard">
      <div className="admin-dash">
        <div className="admin-dash__hero">
          <span className="admin-dash__hero-date">
            {moment().format("dddd, D MMMM YYYY")}
          </span>
          <Title level={3} className="admin-dash__hero-title">
            Selamat datang, {displayName}
          </Title>
          <Text className="admin-dash__hero-desc">
            Pantau ringkasan kepegawaian, kehadiran hari ini, dan pengajuan cuti
            yang memerlukan tindakan Anda.
          </Text>
        </div>

        {(errorSummary || errorAttendance) && (
          <Alert
            message="Beberapa data tidak dapat dimuat"
            description="Dashboard tetap menampilkan data yang tersedia."
            type="warning"
            showIcon
            closable
          />
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              label="Total Pegawai"
              value={summary.totalEmployees}
              hint="Seluruh data pegawai terdaftar"
              icon={<TeamOutlined />}
              iconClass="admin-dash__stat-icon--employees"
              loading={loadSummary}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              label="Pegawai Aktif"
              value={summary.activeEmployees}
              hint="Belum resign atau nonaktif"
              icon={<UserOutlined />}
              iconClass="admin-dash__stat-icon--active"
              loading={loadSummary}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              label="Departemen"
              value={summary.totalDepartments}
              hint="Unit kerja terdaftar"
              icon={<BankOutlined />}
              iconClass="admin-dash__stat-icon--departments"
              loading={loadSummary}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              label="Cuti Pending"
              value={summary.pendingLeaves}
              hint="Menunggu persetujuan"
              icon={<CalendarOutlined />}
              iconClass="admin-dash__stat-icon--leaves"
              loading={loadSummary}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              className="admin-dash__panel"
              title="Kehadiran Hari Ini"
              extra={
                <span className="admin-dash__panel-extra">
                  {attendanceData?.date
                    ? moment(attendanceData.date).format("DD MMM YYYY")
                    : moment().format("DD MMM YYYY")}
                </span>
              }
            >
              {loadAttendance ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : errorAttendance ? (
                <Empty description="Data kehadiran tidak tersedia" />
              ) : (
                <>
                  <div className="admin-dash__attendance-rate">
                    <div className="admin-dash__attendance-rate-label">
                      <span>Tingkat kehadiran pegawai aktif</span>
                      <span className="admin-dash__attendance-rate-value">
                        {attendanceRate}%
                      </span>
                    </div>
                    <Progress
                      percent={attendanceRate}
                      showInfo={false}
                      strokeColor={{ from: "#8e5f92", to: "#6a2e6f" }}
                      trailColor="rgba(106, 46, 111, 0.12)"
                    />
                  </div>

                  <div className="admin-dash__attendance-grid">
                    <div className="admin-dash__attendance-item admin-dash__attendance-item--present">
                      <CheckCircleOutlined className="admin-dash__attendance-item-icon" />
                      <span className="admin-dash__attendance-item-value">
                        {attendance.present ?? 0}
                      </span>
                      <span className="admin-dash__attendance-item-label">
                        Hadir
                      </span>
                    </div>
                    <div className="admin-dash__attendance-item admin-dash__attendance-item--late">
                      <WarningOutlined className="admin-dash__attendance-item-icon" />
                      <span className="admin-dash__attendance-item-value">
                        {attendance.late ?? 0}
                      </span>
                      <span className="admin-dash__attendance-item-label">
                        Terlambat
                      </span>
                    </div>
                    <div className="admin-dash__attendance-item admin-dash__attendance-item--absent">
                      <CloseCircleOutlined className="admin-dash__attendance-item-icon" />
                      <span className="admin-dash__attendance-item-value">
                        {attendance.absent ?? 0}
                      </span>
                      <span className="admin-dash__attendance-item-label">
                        Alpha
                      </span>
                    </div>
                    <div className="admin-dash__attendance-item admin-dash__attendance-item--pending">
                      <ClockCircleOutlined className="admin-dash__attendance-item-icon" />
                      <span className="admin-dash__attendance-item-value">
                        {attendance.not_clocked_in ?? 0}
                      </span>
                      <span className="admin-dash__attendance-item-label">
                        Belum Absen
                      </span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              className="admin-dash__panel"
              title={
                <span>
                  <RiseOutlined style={{ marginRight: 8, color: "#6a2e6f" }} />
                  Karyawan Baru
                </span>
              }
              extra={
                <span className="admin-dash__panel-extra">Bulan ini</span>
              }
            >
              {loadHires ? (
                <Skeleton active avatar paragraph={{ rows: 3 }} />
              ) : errorHires ? (
                <Empty description="Data karyawan baru tidak tersedia" />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={newHires}
                  className="admin-dash__hire-list"
                  renderItem={(item) => (
                    <List.Item className="admin-dash__hire-item">
                      <List.Item.Meta
                        avatar={
                          <Avatar className="admin-dash__hire-avatar">
                            {getInitials(item.fullName)}
                          </Avatar>
                        }
                        title={item.fullName}
                        description={
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {item.position?.name ?? "Posisi belum diatur"}
                            {" · "}
                            Bergabung {formatDate(item.joinDate)}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: "Belum ada karyawan baru bulan ini" }}
                />
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              className="admin-dash__panel"
              title="Pengajuan Cuti Menunggu Persetujuan"
              extra={
                !loadLeaves && (
                  <span className="admin-dash__badge-count">
                    {pendingLeaves.length}
                  </span>
                )
              }
            >
              {loadLeaves ? (
                <Skeleton active paragraph={{ rows: 5 }} />
              ) : errorLeaves ? (
                <Empty description="Data cuti tidak tersedia" />
              ) : (
                <Table
                  className="admin-dash__table"
                  columns={leaveColumns}
                  dataSource={pendingLeaves}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                  scroll={{ x: 640 }}
                  locale={{ emptyText: "Tidak ada pengajuan cuti pending" }}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="admin-dash__panel" title="Demografi Pegawai">
              {loadDemo ? (
                <Skeleton active paragraph={{ rows: 6 }} />
              ) : errorDemo ? (
                <Empty description="Data demografi tidak tersedia" />
              ) : (
                <div className="admin-dash__demo-list">
                  <div>
                    <Title level={5} className="admin-dash__section-title">
                      Status Kepegawaian
                    </Title>
                    {statusItems.length > 0 ? (
                      statusItems.map((item) => (
                        <DemographicBar
                          key={item.key}
                          label={item.label}
                          count={item.count}
                          total={statusTotal}
                          tagColor="purple"
                        />
                      ))
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Belum ada data"
                      />
                    )}
                  </div>

                  {genderItems.length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <Title level={5} className="admin-dash__section-title">
                        Jenis Kelamin
                      </Title>
                      {genderItems.map((item) => (
                        <DemographicBar
                          key={item.key}
                          label={item.label}
                          count={item.count}
                          total={genderTotal}
                          tagColor="magenta"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default AdminDash;
