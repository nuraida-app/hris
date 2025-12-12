import React, { useState } from "react";
import {
  List,
  Card,
  Typography,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Space,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReadOutlined,
  BankOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {
  useSaveEduMutation,
  useDeleteEduMutation,
} from "../../service/admin/account/ApiEmployee";

const { Text, Title } = Typography;
const { TextArea } = Input;

const TabEducation = ({ data, employeeId }) => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // --- DATA DARI PROPS ---
  // Mengambil data dari relasi 'educations' (sesuai alias di backend)
  // Urutkan ulang di frontend untuk memastikan descending by year (optional, jaga-jaga)
  const educationList = [...(data?.educations || [])].sort(
    (a, b) => b.graduationYear - a.graduationYear
  );

  // --- API HOOKS (Placeholder / Mockup) ---
  // Anda perlu menghubungkan ini dengan Redux Toolkit Query Anda
  const [saveEducation, { isLoading: isSaving }] = useSaveEduMutation();
  const [deleteEducation, { isLoading: isDeleting }] = useDeleteEduMutation();

  // --- HANDLERS ---
  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteEducation(id).unwrap();
    message.success(
      "Fitur delete belum terhubung API (Hapus baris ini jika sudah)"
    );
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
        id: editingItem?.id || null, // Jika ada ID berarti update
      };

      await saveEducation(payload).unwrap();

      message.success("Data berhasil disimpan (Mockup)");
      handleCancel();
    } catch (error) {
      message.error("Gagal menyimpan data");
    }
  };

  // --- HELPER UI ---
  const getLevelColor = (level) => {
    switch (level) {
      case "S3":
        return "purple";
      case "S2":
        return "geekblue";
      case "S1":
        return "blue";
      case "D3":
        return "cyan";
      case "SMA/SMK":
        return "green";
      case "SMP":
        return "orange";
      case "SD":
        return "gold";
      default:
        return "default";
    }
  };

  return (
    <Card
      title="Riwayat Pendidikan"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah
        </Button>
      }
      styles={{ body: { padding: "0 24px" } }}
    >
      <List
        itemLayout="vertical"
        dataSource={educationList}
        locale={{ emptyText: "Belum ada data pendidikan" }}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(item)}
                key="edit"
              >
                Edit
              </Button>,
              <Popconfirm
                title="Hapus data ini?"
                onConfirm={() => handleDelete(item.id)}
                okText="Ya"
                cancelText="Batal"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  key="delete"
                >
                  Hapus
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div
                  style={{
                    backgroundColor: "#f0f5ff",
                    padding: 12,
                    borderRadius: "50%",
                    color: "#1890ff",
                  }}
                >
                  <ReadOutlined style={{ fontSize: 24 }} />
                </div>
              }
              title={
                <Space wrap>
                  <Text strong style={{ fontSize: 16 }}>
                    {item.institutionName}
                  </Text>
                  <Tag color={getLevelColor(item.level)}>{item.level}</Tag>
                </Space>
              }
              description={
                <div style={{ marginTop: 8 }}>
                  <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary" style={{ display: "block" }}>
                        <BankOutlined /> Jurusan
                      </Text>
                      <Text strong>{item.major || "-"}</Text>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Text type="secondary" style={{ display: "block" }}>
                        Tahun Lulus
                      </Text>
                      <Text strong>{item.graduationYear}</Text>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                      <Text type="secondary" style={{ display: "block" }}>
                        IPK/Nilai
                      </Text>
                      <Text>{item.gpa ? item.gpa.toFixed(2) : "-"}</Text>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text type="secondary" style={{ display: "block" }}>
                        <EnvironmentOutlined /> Kota
                      </Text>
                      <Text>{item.city || "-"}</Text>
                    </Col>
                  </Row>
                  {item.notes && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "8px 12px",
                        backgroundColor: "#fafafa",
                        borderRadius: 4,
                        fontSize: 13,
                        color: "#666",
                      }}
                    >
                      <Text italic>Catatan: {item.notes}</Text>
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />

      {/* --- MODAL FORM ADD/EDIT --- */}
      <Modal
        title={editingItem ? "Edit Pendidikan" : "Tambah Pendidikan"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={() => form.submit()}
        confirmLoading={isSaving}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="level"
                label="Jenjang"
                rules={[{ required: true, message: "Pilih jenjang" }]}
              >
                <Select placeholder="Pilih Jenjang">
                  <Select.Option value="SD">SD</Select.Option>
                  <Select.Option value="SMP">SMP</Select.Option>
                  <Select.Option value="SMA/SMK">SMA/SMK</Select.Option>
                  <Select.Option value="D3">D3</Select.Option>
                  <Select.Option value="S1">S1</Select.Option>
                  <Select.Option value="S2">S2</Select.Option>
                  <Select.Option value="S3">S3</Select.Option>
                  <Select.Option value="Non-Formal">Non-Formal</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="graduationYear"
                label="Tahun Lulus"
                rules={[{ required: true, message: "Isi tahun lulus" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Contoh: 2015"
                  min={1900}
                  max={new Date().getFullYear() + 5}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="institutionName"
            label="Nama Institusi / Sekolah"
            rules={[{ required: true, message: "Wajib diisi" }]}
          >
            <Input placeholder="Contoh: Universitas Indonesia" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="major" label="Jurusan / Prodi">
                <Input placeholder="Contoh: Teknik Informatika" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="gpa" label="IPK / Nilai Akhir">
                <InputNumber
                  style={{ width: "100%" }}
                  step="0.01"
                  placeholder="3.50"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="city" label="Kota / Lokasi">
            <Input placeholder="Contoh: Jakarta Selatan" />
          </Form.Item>

          <Form.Item name="notes" label="Catatan Tambahan">
            <TextArea rows={2} placeholder="Keterangan (jika ada)" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TabEducation;
