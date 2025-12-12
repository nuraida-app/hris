import React, { useState } from "react";
import {
  Card,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  useSaveTrainingMutation,
  useDeleteTrainingMutation,
} from "../../service/admin/account/ApiEmployee";
// ^ Sesuaikan path import API Anda

const { TextArea } = Input;
const { Text } = Typography;

const TabTraning = ({ data, employeeId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // --- DATA PROCESSING (FIX READ-ONLY ERROR) ---
  // Gunakan spread syntax [...] sebelum sort
  const trainingList = [...(data?.trainings || [])].sort(
    (a, b) => b.year - a.year
  );

  // --- API HOOKS ---
  const [saveTraining, { isLoading: isSaving }] = useSaveTrainingMutation();
  const [deleteTraining] = useDeleteTrainingMutation();

  // --- HANDLERS ---
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteTraining(id).unwrap();
      message.success("Data pelatihan dihapus");
    } catch (error) {
      message.error("Gagal menghapus data");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        employeeId: employeeId,
        id: editingItem?.id || null,
      };
      await saveTraining(payload).unwrap();
      message.success("Data berhasil disimpan");
      handleCancel();
    } catch (error) {
      message.error("Gagal menyimpan data");
    }
  };

  // --- TABLE COLUMNS ---
  const columns = [
    {
      title: "Nama Pelatihan / Sertifikasi",
      dataIndex: "trainingName",
      key: "trainingName",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Penyelenggara",
      dataIndex: "organizer",
      key: "organizer",
    },
    {
      title: "Tahun",
      dataIndex: "year",
      key: "year",
      width: 100,
      align: "center",
    },
    {
      title: "Keterangan / No. Sertifikat",
      key: "notes",
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          {record.certificateNo && (
            <div>
              <SafetyCertificateOutlined style={{ color: "green" }} /> No:{" "}
              {record.certificateNo}
            </div>
          )}
          {record.notes && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              {record.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Hapus data ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Pelatihan & Sertifikasi"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah
        </Button>
      }
    >
      <Table
        dataSource={trainingList}
        columns={columns}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: "Belum ada data pelatihan" }}
        size="middle"
        scroll={{ x: 600 }} // Agar responsive di mobile
      />

      {/* --- MODAL FORM --- */}
      <Modal
        title={editingItem ? "Edit Pelatihan" : "Tambah Pelatihan"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={isSaving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="trainingName"
            label="Nama Pelatihan / Sertifikasi"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <Input placeholder="Contoh: Pelatihan K3 Umum" />
          </Form.Item>

          <Form.Item
            name="organizer"
            label="Penyelenggara"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <Input placeholder="Contoh: Kemnaker RI / BNSP" />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="year"
              label="Tahun"
              style={{ flex: 1 }}
              rules={[{ required: true, message: "Isi tahun" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1980}
                max={new Date().getFullYear() + 1}
                placeholder="2023"
              />
            </Form.Item>

            <Form.Item
              name="certificateNo"
              label="Nomor Sertifikat (Opsional)"
              style={{ flex: 2 }}
            >
              <Input placeholder="No. Sertifikat jika ada" />
            </Form.Item>
          </div>

          <Form.Item name="notes" label="Keterangan Tambahan">
            <TextArea rows={2} placeholder="Catatan..." />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TabTraning;
