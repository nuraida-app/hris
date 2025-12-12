import React, { useState } from "react";
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
  Select,
  Upload,
  message,
  Card,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetAbsentsQuery,
  useSaveAbsentMutation,
  useUpdateAbsentMutation,
  useDeleteAbsentMutation,
  useImportAbsentMutation,
} from "../../../service/admin/absent/ApiAbsent";
// Asumsi anda punya hook untuk get list employee untuk dropdown
import { useGetEmployeesQuery } from "../../../service/admin/account/ApiEmployee";

const { RangePicker } = DatePicker;
const { Option } = Select;

const Absent = () => {
  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Queries & Mutations
  const { data, isLoading } = useGetAbsentsQuery({
    page,
    limit,
    search,
    startDate: dateRange[0] ? dateRange[0].format("YYYY-MM-DD") : undefined,
    endDate: dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : undefined,
  });

  // Untuk Dropdown Employee saat Add Manual
  // Jika ApiEmployee belum ada, bagian ini bisa disesuaikan/dihapus
  const { data: employeeData } = useGetEmployeesQuery(
    { page: 1, limit: 100 },
    { skip: !isModalOpen }
  );

  const [saveAbsent, { isLoading: isSaving }] = useSaveAbsentMutation();
  const [updateAbsent, { isLoading: isUpdating }] = useUpdateAbsentMutation();
  const [deleteAbsent] = useDeleteAbsentMutation();
  const [importAbsent, { isLoading: isImporting }] = useImportAbsentMutation();

  // Handlers
  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setLimit(pagination.pageSize);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Hapus Data Absensi?",
      content: "Tindakan ini tidak dapat dibatalkan.",
      okText: "Hapus",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteAbsent(id).unwrap();
          message.success("Berhasil dihapus");
        } catch (err) {
          message.error("Gagal menghapus");
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
    setIsModalOpen(true);
  };

  const handleFinish = async (values) => {
    const payload = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      clockIn: values.clockIn ? values.clockIn.toDate() : null, // Kirim full Date object
      clockOut: values.clockOut ? values.clockOut.toDate() : null,
    };

    try {
      if (editingRecord) {
        await updateAbsent({ id: editingRecord.id, ...payload }).unwrap();
        message.success("Berhasil diperbarui");
      } else {
        await saveAbsent(payload).unwrap();
        message.success("Berhasil disimpan");
      }
      setIsModalOpen(false);
    } catch (error) {
      message.error("Gagal menyimpan data");
    }
  };

  const handleImport = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await importAbsent(formData).unwrap();
      message.success(res.message);
      setIsImportModalOpen(false);
      onSuccess("ok");
    } catch (err) {
      message.error("Gagal upload excel");
      onError(err);
    }
  };

  const downloadTemplate = () => {
    // Download langsung via window location karena ini file statis/stream dari backend
    window.open("/api/absent/template", "_blank");
  };

  // Columns Configuration
  const columns = [
    {
      title: "Tanggal",
      dataIndex: "date",
      key: "date",
      render: (text) => dayjs(text).format("DD MMM YYYY"),
    },
    {
      title: "Nama Pegawai",
      dataIndex: ["Employee", "fullName"],
      key: "employeeName",
    },
    {
      title: "Jam Masuk",
      dataIndex: "clockIn",
      key: "clockIn",
      render: (text) => (text ? dayjs(text).format("HH:mm") : "-"),
    },
    {
      title: "Jam Keluar",
      dataIndex: "clockOut",
      key: "clockOut",
      render: (text) => (text ? dayjs(text).format("HH:mm") : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "present") color = "green";
        if (status === "late") color = "orange";
        if (status === "absent") color = "red";
        if (status === "permission") color = "blue";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            size="small"
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <MainLayout title="Manajemen Absensi">
      <Card title="Data Absensi">
        {/* Toolbar */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Cari Nama Pegawai..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: "100%" }}
              onChange={(dates) => setDateRange(dates)}
            />
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space wrap>
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
            </Space>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total || 0,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          scroll={{ x: 800 }} // Responsive Scroll
        />
      </Card>

      {/* Modal Add/Edit */}
      <Modal
        title={editingRecord ? "Edit Absensi" : "Tambah Absensi Manual"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="employeeId"
            label="Pegawai"
            rules={[{ required: true, message: "Pilih pegawai" }]}
          >
            <Select
              placeholder="Pilih Pegawai"
              loading={!employeeData}
              disabled={!!editingRecord} // Tidak boleh ganti orang saat edit
              showSearch
              optionFilterProp="children"
            >
              {employeeData?.data?.map((emp) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="date" label="Tanggal" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="clockIn" label="Jam Masuk">
                <DatePicker showTime format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="clockOut" label="Jam Keluar">
                <DatePicker showTime format="HH:mm" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="present">Hadir (Present)</Option>
              <Option value="late">Terlambat (Late)</Option>
              <Option value="permission">Izin (Permission)</Option>
              <Option value="absent">Alpha (Absent)</Option>
            </Select>
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            loading={isSaving || isUpdating}
            block
          >
            Simpan
          </Button>
        </Form>
      </Modal>

      {/* Modal Import Excel */}
      <Modal
        title="Import Data Absensi"
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div
            style={{
              background: "#f5f5f5",
              padding: 10,
              borderRadius: 5,
              marginBottom: 10,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Langkah-langkah:</strong>
            </p>
            <ol style={{ paddingLeft: 20, margin: "5px 0" }}>
              <li>Download template excel di bawah ini.</li>
              <li>
                Isi data (<strong>NIP Pegawai</strong> wajib sesuai database).
              </li>
              <li>Pastikan format Tanggal YYYY-MM-DD.</li>
              <li>Upload file yang sudah diisi.</li>
            </ol>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              style={{ padding: 0 }}
            >
              Download Template_Absensi.xlsx
            </Button>
          </div>

          <Upload.Dragger
            customRequest={handleImport}
            showUploadList={false}
            accept=".xlsx, .xls"
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Klik atau tarik file excel ke sini
            </p>
          </Upload.Dragger>

          {isImporting && (
            <p style={{ textAlign: "center", marginTop: 10 }}>
              Sedang memproses...
            </p>
          )}
        </Space>
      </Modal>
    </MainLayout>
  );
};

export default Absent;
