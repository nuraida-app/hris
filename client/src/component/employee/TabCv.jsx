import React from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Table,
  Typography,
  Avatar,
  Space,
  Tag,
  Alert,
} from "antd";
import {
  DownloadOutlined, // Ganti icon print jadi download
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CvPdfDocument from "./CvPdfDocument"; // Import komponen PDF yang baru dibuat

const { Title, Text } = Typography;

const TabCv = ({ data }) => {
  // --- DATA PREPARATION UNTUK UI HTML ---
  // (Data processing untuk PDF sudah dilakukan di dalam CvPdfDocument.jsx)

  // 1. Pendidikan Formal (UI HTML)
  const formalEducation = [...(data?.educations || [])]
    .filter((item) => item.level !== "Non-Formal")
    .sort((a, b) => b.graduationYear - a.graduationYear);

  // 2. Data Pelatihan (UI HTML)
  const trainingHistory = [...(data?.trainings || [])].sort(
    (a, b) => b.year - a.year
  );

  // 3. Data Riwayat Jabatan (UI HTML)
  const careerHistory = [...(data?.CareerHistories || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  // --- DEFINISI KOLOM TABLE (UI HTML) ---
  // ... (Sama seperti sebelumnya / Kode kolom existing tidak perlu diubah) ...
  const eduColumns = [
    {
      title: "Jenjang",
      dataIndex: "level",
      key: "level",
      width: 100,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    { title: "Nama Institusi", dataIndex: "institutionName", key: "inst" },
    { title: "Jurusan", dataIndex: "major", key: "major" },
    { title: "Tahun", dataIndex: "graduationYear", key: "year" },
  ];

  const careerColumns = [
    { title: "Jabatan", dataIndex: ["Position", "name"], key: "pos" },
    { title: "Departemen", dataIndex: ["Department", "name"], key: "dept" },
    {
      title: "Periode",
      render: (_, r) =>
        `${moment(r.startDate).format("MMM YYYY")} - ${
          r.endDate ? moment(r.endDate).format("MMM YYYY") : "Now"
        }`,
    },
  ];

  const trainingColumns = [
    { title: "Pelatihan", dataIndex: "trainingName", key: "name" },
    { title: "Penyelenggara", dataIndex: "organizer", key: "org" },
    { title: "Tahun", dataIndex: "year", key: "yr" },
  ];

  return (
    <div className="cv-wrapper">
      <div style={{ textAlign: "right", marginBottom: 20 }}>
        {/* COMPONENT DOWNLOAD PDF */}
        <PDFDownloadLink
          document={<CvPdfDocument data={data} />}
          fileName={`CV_${data?.fullName?.replace(/\s+/g, "_")}.pdf`}
        >
          {({ blob, url, loading, error }) => (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={loading}
            >
              {loading ? "Menyiapkan Dokumen..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* --- PREVIEW UI (HTML VERSION) --- */}
      {/* Ini tetap ditampilkan agar user bisa lihat sebelum download */}
      <Card className="cv-paper" bordered={false}>
        {/* ... (Konten UI HTML Anda yang lama tetap disini untuk preview) ... */}

        {/* HEADER */}
        <Row gutter={24} align="middle">
          <Col span={6} style={{ textAlign: "center" }}>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={data?.profilePicture}
            />
          </Col>
          <Col span={18}>
            <Title level={2}>{data?.fullName}</Title>
            <Text>
              {data?.position?.name} - {data?.department?.name}
            </Text>
            <br />
            <Space split="|">
              <Text>{data?.email}</Text>
              <Text>{data?.phone}</Text>
            </Space>
          </Col>
        </Row>
        <Divider />

        <Title level={5}>A. DATA PRIBADI</Title>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="NIP">{data?.nip}</Descriptions.Item>
          <Descriptions.Item label="Jenis Kelamin">
            {data?.gender}
          </Descriptions.Item>
          {/* ... field lainnya ... */}
        </Descriptions>

        <Title level={5} style={{ marginTop: 20 }}>
          B. PENDIDIKAN
        </Title>
        <Table
          dataSource={formalEducation}
          columns={eduColumns}
          pagination={false}
          size="small"
          rowKey="id"
        />

        <Title level={5} style={{ marginTop: 20 }}>
          C. KARIR
        </Title>
        <Table
          dataSource={careerHistory}
          columns={careerColumns}
          pagination={false}
          size="small"
          rowKey="id"
        />

        <Title level={5} style={{ marginTop: 20 }}>
          D. PELATIHAN
        </Title>
        <Table
          dataSource={trainingHistory}
          columns={trainingColumns}
          pagination={false}
          size="small"
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default TabCv;
