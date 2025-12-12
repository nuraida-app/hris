import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Popconfirm,
  message,
  Tag,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

// Sesuaikan path import ini dengan struktur folder Anda
import {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
} from "../../../../service/master/ApiLeave";

const Leave = () => {
  // --- State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // --- RTK Query Hooks ---
  const {
    data: leaveTypes,
    isLoading,
    isError,
    refetch,
  } = useGetLeaveTypesQuery();
  const [createLeaveType, { isLoading: isCreating }] =
    useCreateLeaveTypeMutation();
  const [updateLeaveType, { isLoading: isUpdating }] =
    useUpdateLeaveTypeMutation();
  const [deleteLeaveType, { isLoading: isDeleting }] =
    useDeleteLeaveTypeMutation();

  // --- Handlers ---

  // Buka Modal (Mode Tambah atau Edit)
  const showModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item); // Isi form jika edit
    } else {
      form.resetFields(); // Reset form jika tambah baru
      form.setFieldsValue({ isActive: true, defaultQuota: 12 }); // Default values
    }
    setIsModalOpen(true);
  };

  // Submit Form (Create / Update)
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingItem) {
        // Mode Edit
        await updateLeaveType({ id: editingItem.id, ...values }).unwrap();
        message.success("Jenis cuti berhasil diperbarui");
      } else {
        // Mode Create
        await createLeaveType(values).unwrap();
        message.success("Jenis cuti berhasil ditambahkan");
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Failed:", error);
      message.error(error?.data?.message || "Terjadi kesalahan sistem");
    }
  };

  // Hapus Data
  const handleDelete = async (id) => {
    try {
      await deleteLeaveType(id).unwrap();
      message.success("Data berhasil dihapus");
    } catch (error) {
      message.error(error?.data?.message || "Gagal menghapus data");
    }
  };

  // --- Columns Configuration ---
  const columns = [
    {
      title: "Nama Cuti",
      dataIndex: "name",
      key: "name",
      width: 200,
      fixed: "left", // Sticky column di mobile
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Kuota Default",
      dataIndex: "defaultQuota",
      key: "defaultQuota",
      width: 120,
      render: (val) => <Tag color="blue">{val} Hari</Tag>,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (description) => (
        <Tooltip placement="topLeft" title={description}>
          {description || "-"}
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "error"}>
          {isActive ? "Aktif" : "Non-Aktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-500" />}
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Hapus Jenis Cuti"
            description={`Apakah anda yakin menghapus ${record.name}?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Batal"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-0 md:p-4">
      <Card
        title="Master Jenis Cuti"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={refetch} />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Tambah Baru
            </Button>
          </Space>
        }
        variant="borderless"
        className="shadow-sm rounded-lg"
      >
        <Table
          columns={columns}
          dataSource={leaveTypes}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }} // Membuat tabel scrollable horizontal di mobile
          size="middle"
        />
      </Card>

      {/* --- Modal Form --- */}
      <Modal
        title={editingItem ? "Edit Jenis Cuti" : "Tambah Jenis Cuti"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating || isUpdating}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form form={form} layout="vertical" name="leaveForm">
          <Form.Item
            name="name"
            label="Nama Cuti"
            rules={[{ required: true, message: "Nama cuti wajib diisi!" }]}
          >
            <Input placeholder="Contoh: Cuti Tahunan" />
          </Form.Item>

          <Form.Item
            name="defaultQuota"
            label="Kuota (Hari)"
            rules={[{ required: true, message: "Masukkan jumlah kuota!" }]}
            help="Masukkan 0 jika tidak memotong jatah cuti (unlimited)"
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>

          <Form.Item name="description" label="Keterangan">
            <Input.TextArea rows={3} placeholder="Penjelasan singkat..." />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status Aktif"
            valuePropName="checked"
          >
            <Switch checkedChildren="Aktif" unCheckedChildren="Non-Aktif" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Leave;
