import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../component/layout/MainLayout";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Select,
  Upload,
  message,
  Card,
  Row,
  Col,
  Typography,
  Tooltip,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  CarryOutOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  useGetAbsentsQuery,
  useSaveAbsentMutation,
  useUpdateAbsentMutation,
  useDeleteAbsentMutation,
  useImportAbsentMutation,
} from "../../../service/absent/ApiAbsent";
import { useGetEmployeesQuery } from "../../../service/account/ApiEmployee";
import "./Absent.css";

dayjs.locale("id");

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: "present", label: "Hadir", color: "green" },
  { value: "late", label: "Terlambat", color: "orange" },
  { value: "permission", label: "Izin", color: "blue" },
  { value: "absent", label: "Alpha", color: "red" },
];

const STATUS_MAP = Object.fromEntries(
  STATUS_OPTIONS.map((item) => [item.value, item])
);

const combineDateTime = (date, time) => {
  if (!date || !time) return null;
  return date
    .hour(time.hour())
    .minute(time.minute())
    .second(0)
    .millisecond(0)
    .toDate();
};

const Absent = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useGetAbsentsQuery({
    page,
    limit,
    search: debouncedSearch,
    startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
    endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
  });

  const { data: employeeData, isLoading: loadingEmployees } =
    useGetEmployeesQuery({ page: 1, limit: 100 }, { skip: !isModalOpen });

  const [saveAbsent, { isLoading: isSaving }] = useSaveAbsentMutation();
  const [updateAbsent, { isLoading: isUpdating }] = useUpdateAbsentMutation();
  const [deleteAbsent] = useDeleteAbsentMutation();
  const [importAbsent, { isLoading: isImporting }] = useImportAbsentMutation();

  const records = data?.data ?? [];

  const pageStats = useMemo(() => {
    const stats = { present: 0, late: 0, permission: 0, absent: 0 };
    records.forEach((item) => {
      if (stats[item.status] !== undefined) {
        stats[item.status] += 1;
      }
    });
    return stats;
  }, [records]);

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Hapus data absensi?",
      content: "Tindakan ini tidak dapat dibatalkan.",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      centered: true,
      onOk: async () => {
        try {
          await deleteAbsent(id).unwrap();
          message.success("Data absensi berhasil dihapus");
        } catch {
          message.error("Gagal menghapus data absensi");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      employeeId: record.employeeId,
      date: dayjs(record.date),
      clockIn: record.clockIn ? dayjs(record.clockIn) : null,
      clockOut: record.clockOut ? dayjs(record.clockOut) : null,
      status: record.status,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ status: "present" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      clockIn: combineDateTime(values.date, values.clockIn),
      clockOut: combineDateTime(values.date, values.clockOut),
    };

    try {
      if (editingRecord) {
        await updateAbsent({ id: editingRecord.id, ...payload }).unwrap();
        message.success("Data absensi berhasil diperbarui");
      } else {
        await saveAbsent(payload).unwrap();
        message.success("Data absensi berhasil disimpan");
      }
      handleCloseModal();
    } catch {
      message.error("Gagal menyimpan data absensi");
    }
  };

  const handleImport = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await importAbsent(formData).unwrap();
      message.success(res.message || "Import berhasil");
      setIsImportModalOpen(false);
      onSuccess("ok");
    } catch (err) {
      message.error(err?.data?.message || "Gagal mengunggah file Excel");
      onError(err);
    }
  };

  const downloadTemplate = () => {
    window.open("/api/absent/template", "_blank");
  };

  const clearDateFilter = () => {
    setDateRange([null, null]);
    setPage(1);
  };

  const columns = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      width: 130,
      render: (text) => (
        <Text strong>{dayjs(text).format("DD MMM YYYY")}</Text>
      ),
    },
    {
      title: "NIP",
      dataIndex: ["Employee", "nip"],
      key: "nip",
      width: 110,
      responsive: ["md"],
      render: (text) => text || "-",
    },
    {
      title: "Nama Pegawai",
      dataIndex: ["Employee", "fullName"],
      key: "employeeName",
      ellipsis: true,
    },
    {
      title: "Jam Masuk",
      dataIndex: "clockIn",
      key: "clockIn",
      width: 100,
      render: (text) =>
        text ? (
          <Tag icon={<ClockCircleOutlined />} color="default">
            {dayjs(text).format("HH:mm")}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Jam Keluar",
      dataIndex: "clockOut",
      key: "clockOut",
      width: 100,
      render: (text) =>
        text ? (
          <Tag icon={<ClockCircleOutlined />} color="default">
            {dayjs(text).format("HH:mm")}
          </Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const info = STATUS_MAP[status] ?? {
          label: status,
          color: "default",
        };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Hapus">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const hasDateFilter = dateRange[0] && dateRange[1];
  const hasSearchFilter = Boolean(debouncedSearch);

  return (
    <MainLayout title="Manajemen Absensi">
      <div className="absent-page">
        <div className="absent-page__intro">
          <Title level={4} className="absent-page__intro-title">
            <CarryOutOutlined style={{ marginRight: 8 }} />
            Manajemen Absensi Pegawai
          </Title>
          <Text className="absent-page__intro-desc">
            Pantau, input manual, dan impor data kehadiran pegawai. Gunakan
            filter tanggal dan pencarian nama untuk menemukan data lebih cepat.
          </Text>
        </div>

        <div className="absent-page__stats">
          <div className="absent-page__stat absent-page__stat--total">
            <span className="absent-page__stat-label">Total Data</span>
            <span className="absent-page__stat-value">{data?.total ?? 0}</span>
          </div>
          <div className="absent-page__stat absent-page__stat--present">
            <span className="absent-page__stat-label">Hadir (halaman ini)</span>
            <span className="absent-page__stat-value">
              {pageStats.present}
            </span>
          </div>
          <div className="absent-page__stat absent-page__stat--late">
            <span className="absent-page__stat-label">
              Terlambat (halaman ini)
            </span>
            <span className="absent-page__stat-value">{pageStats.late}</span>
          </div>
          <div className="absent-page__stat absent-page__stat--permission">
            <span className="absent-page__stat-label">Izin (halaman ini)</span>
            <span className="absent-page__stat-value">
              {pageStats.permission}
            </span>
          </div>
          <div className="absent-page__stat absent-page__stat--absent">
            <span className="absent-page__stat-label">Alpha (halaman ini)</span>
            <span className="absent-page__stat-value">{pageStats.absent}</span>
          </div>
        </div>

        <Card className="absent-page__panel" title="Data Absensi">
          <div className="absent-page__toolbar">
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} lg={8}>
                <Input
                  placeholder="Cari nama pegawai..."
                  prefix={<SearchOutlined />}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} lg={10}>
                <RangePicker
                  style={{ width: "100%" }}
                  value={dateRange}
                  format="DD MMM YYYY"
                  placeholder={["Tanggal mulai", "Tanggal akhir"]}
                  onChange={(dates) => {
                    setDateRange(dates ?? [null, null]);
                    setPage(1);
                  }}
                />
              </Col>
              <Col xs={24} lg={6}>
                <div className="absent-page__actions">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    Input Manual
                  </Button>
                  <Button
                    icon={<FileExcelOutlined />}
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    Import Excel
                  </Button>
                </div>
              </Col>
            </Row>

            {(hasSearchFilter || hasDateFilter) && (
              <div className="absent-page__filters">
                {hasSearchFilter && (
                  <Tag closable onClose={() => setSearch("")} color="purple">
                    Pencarian: {debouncedSearch}
                  </Tag>
                )}
                {hasDateFilter && (
                  <Tag closable onClose={clearDateFilter} color="purple">
                    <CalendarOutlined style={{ marginRight: 4 }} />
                    {dateRange[0].format("DD MMM YYYY")} –{" "}
                    {dateRange[1].format("DD MMM YYYY")}
                  </Tag>
                )}
              </div>
            )}
          </div>

          <Table
            className="absent-page__table"
            columns={columns}
            dataSource={records}
            loading={isLoading || isFetching}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.total || 0,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} data`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 900 }}
            locale={{ emptyText: "Belum ada data absensi" }}
          />
        </Card>
      </div>

      <Modal
        title={editingRecord ? "Edit Absensi" : "Tambah Absensi Manual"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
        confirmLoading={isSaving || isUpdating}
        width={520}
        centered
        destroyOnHidden
        className="absent-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          requiredMark="optional"
          scrollToFirstError
        >
          <Form.Item
            name="employeeId"
            label="Pegawai"
            rules={[{ required: true, message: "Pilih pegawai" }]}
          >
            <Select
              placeholder="Pilih pegawai"
              loading={loadingEmployees}
              disabled={Boolean(editingRecord)}
              showSearch
              optionFilterProp="children"
            >
              {employeeData?.data?.map((emp) => (
                <Select.Option key={emp.id} value={emp.id}>
                  {emp.fullName} {emp.nip ? `(${emp.nip})` : ""}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Tanggal"
            rules={[{ required: true, message: "Pilih tanggal" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD MMM YYYY"
              placeholder="Pilih tanggal"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clockIn" label="Jam Masuk">
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="--:--"
                  needConfirm={false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clockOut" label="Jam Keluar">
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="--:--"
                  needConfirm={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Status Kehadiran"
            rules={[{ required: true, message: "Pilih status" }]}
            initialValue="present"
          >
            <Select placeholder="Pilih status">
              {STATUS_OPTIONS.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  <Space>
                    {opt.value === "present" && (
                      <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    )}
                    {opt.value === "late" && (
                      <WarningOutlined style={{ color: "#faad14" }} />
                    )}
                    {opt.value === "permission" && (
                      <ClockCircleOutlined style={{ color: "#1677ff" }} />
                    )}
                    {opt.value === "absent" && (
                      <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                    )}
                    {opt.label}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import Data Absensi"
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsImportModalOpen(false)}>
            Tutup
          </Button>,
        ]}
        width={560}
        centered
        destroyOnHidden
        className="absent-modal"
      >
        <div className="absent-import__steps">
          <Text className="absent-import__steps-title">
            Panduan Import Excel
          </Text>
          <ol className="absent-import__steps-list">
            <li>Unduh template Excel terlebih dahulu.</li>
            <li>
              Isi kolom <strong>NIP Pegawai</strong> sesuai data di sistem.
            </li>
            <li>Gunakan format tanggal <strong>YYYY-MM-DD</strong>.</li>
            <li>Status: present, late, permission, atau absent.</li>
            <li>Unggah file yang sudah diisi melalui area di bawah.</li>
          </ol>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
            className="absent-import__template-btn"
          >
            Download Template_Absensi.xlsx
          </Button>
        </div>

        <Upload.Dragger
          className="absent-import__dragger"
          customRequest={handleImport}
          showUploadList={false}
          accept=".xlsx,.xls"
          disabled={isImporting}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: "#6a2e6f" }} />
          </p>
          <p className="ant-upload-text">
            Klik atau tarik file Excel ke sini
          </p>
          <p className="ant-upload-hint">Format .xlsx atau .xls</p>
        </Upload.Dragger>

        {isImporting && (
          <div className="absent-import__loading">
            <Spin size="small" />
            Sedang memproses file...
          </div>
        )}
      </Modal>
    </MainLayout>
  );
};

export default Absent;
