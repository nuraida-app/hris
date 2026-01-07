import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  useSaveFamilyMutation,
  useDeleteFamilyMutation,
} from "../../service/account/ApiEmployee";

const TabFamily = ({ data, employeeId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [saveFamily, { isLoading: isSaving }] = useSaveFamilyMutation();
  const [deleteFamily] = useDeleteFamilyMutation();

  const handleAdd = async (values) => {
    try {
      await saveFamily({
        ...values,
        employeeId,
        dob: values.dob ? values.dob.format("YYYY-MM-DD") : null,
      }).unwrap();
      message.success("Anggota keluarga ditambahkan");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("Gagal menambahkan");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFamily(id).unwrap();
      message.success("Data dihapus");
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  const columns = [
    { title: "Nama", dataIndex: "name", key: "name" },
    {
      title: "Hubungan",
      dataIndex: "relation",
      key: "relation",
      render: (text) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    { title: "Jenis Kelamin", dataIndex: "gender", key: "gender" },
    { title: "Tgl Lahir", dataIndex: "dob", key: "dob" },
    {
      title: "Darurat?",
      dataIndex: "isEmergencyContact",
      key: "isEmergencyContact",
      render: (val) => (val ? <Tag color="red">DARURAT</Tag> : "-"),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Hapus data ini?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Tambah Keluarga
      </Button>
      <Table
        columns={columns}
        dataSource={data.FamilyMembers}
        rowKey="id"
        pagination={false}
        scroll={{ x: 600 }}
      />

      <Modal
        title="Tambah Anggota Keluarga"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="name"
            label="Nama Lengkap"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="relation"
            label="Hubungan"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="spouse">
                Pasangan (Suami/Istri)
              </Select.Option>
              <Select.Option value="child">Anak</Select.Option>
              <Select.Option value="parent">Orang Tua</Select.Option>
              <Select.Option value="sibling">Saudara Kandung</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="gender" label="Jenis Kelamin">
            <Select>
              <Select.Option value="Laki-laki">Laki-laki</Select.Option>
              <Select.Option value="Perempuan">Perempuan</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dob" label="Tanggal Lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="phone" label="No HP (Jika Ada)">
            <Input />
          </Form.Item>
          <Form.Item name="isEmergencyContact" valuePropName="checked">
            {/* Menggunakan Checkbox atau Switch ant design */}
            {/* Sederhananya pakai Select saja untuk form modal */}
            <Select placeholder="Kontak Darurat?">
              <Select.Option value={false}>Bukan</Select.Option>
              <Select.Option value={true}>Ya, Kontak Darurat</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TabFamily;
