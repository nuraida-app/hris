import React, { useState } from "react";
import {
  Timeline,
  Card,
  Tag,
  Typography,
  Empty,
  Flex,
  Button,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Popconfirm,
} from "antd";
import {
  ClockCircleOutlined,
  RiseOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  FallOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id";
import {
  useSaveCareerHistoryMutation,
  useDeleteCareerHistoryMutation,
} from "../../service/account/ApiEmployee"; // Sesuaikan path
import { useDepFilterQuery } from "../../service/master/ApiDep"; // Sesuaikan path
import { useSelector } from "react-redux";

const { Text, Title } = Typography;
const { TextArea } = Input;

const TabCareerHistory = ({ data }) => {
  const histories = data?.CareerHistories || [];
  const employeeId = data?.id;

  const { user } = useSelector((state) => state.user);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form] = Form.useForm();

  // State Filter Jabatan (Nested Select)
  const [positionList, setPositionList] = useState([]);

  // API Hooks
  const { data: depsData } = useDepFilterQuery();
  const [saveCareer, { isLoading: isSaving }] = useSaveCareerHistoryMutation();
  const [deleteCareer] = useDeleteCareerHistoryMutation();

  // --- HANDLER MODAL ---
  const handleOpenModal = (record = null) => {
    setEditData(record);
    setIsModalOpen(true);
    if (record) {
      // Logic populate form & position list saat edit
      const dept = depsData?.find((d) => d.id === record.departmentId);
      setPositionList(dept?.Positions || dept?.positions || []);

      form.setFieldsValue({
        departmentId: record.departmentId,
        positionId: record.positionId,
        type: record.type,
        startDate: moment(record.startDate),
        endDate: record.endDate ? moment(record.endDate) : null,
        notes: record.notes,
      });
    } else {
      form.resetFields();
      setPositionList([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
    form.resetFields();
  };

  // --- LOGIKA FILTER DEPT -> POSISI ---
  const handleDeptChange = (val) => {
    const dept = depsData?.find((d) => d.id === val);
    setPositionList(dept?.Positions || dept?.positions || []);
    form.setFieldValue("positionId", null);
  };

  // --- SUBMIT ---
  const onFinish = async (values) => {
    try {
      const payload = {
        id: editData?.id, // undefined jika create
        employeeId: employeeId,
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
      };

      await saveCareer(payload).unwrap();
      message.success("Berhasil menyimpan riwayat jabatan");
      handleCloseModal();
    } catch (error) {
      message.error("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCareer(id).unwrap();
      message.success("Data dihapus");
    } catch (error) {
      message.error("Gagal menghapus");
    }
  };

  // Helper Config Icon (Sama seperti sebelumnya)
  const getTypeConfig = (type) => {
    switch (type) {
      case "hired":
        return {
          color: "green",
          icon: <CheckCircleOutlined />,
          label: "Diterima (Hired)",
        };
      case "promoted":
        return { color: "blue", icon: <RiseOutlined />, label: "Promosi" };
      case "transfer":
        return {
          color: "orange",
          icon: <SwapOutlined />,
          label: "Mutasi / Rotasi",
        };
      case "demoted":
        return { color: "red", icon: <FallOutlined />, label: "Demosi" };
      default:
        return { color: "gray", icon: <ClockCircleOutlined />, label: type };
    }
  };

  return (
    <Card
      variant="borderless"
      title="Perjalanan Karir"
      extra={
        user?.role === "admin" && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
          >
            Tambah
          </Button>
        )
      }
    >
      {histories.length === 0 ? (
        <Empty description="Belum ada riwayat" />
      ) : (
        <Timeline mode="left">
          {histories.map((item) => {
            const config = getTypeConfig(item.type);
            const isCurrent = !item.endDate;

            return (
              <Timeline.Item
                key={item.id}
                color={config.color}
                dot={config.icon}
                label={
                  <Text type="secondary">
                    {moment(item.startDate).format("DD MMM YYYY")}
                  </Text>
                }
              >
                <Card
                  size="small"
                  style={{
                    marginBottom: 10,
                    borderColor: isCurrent ? "#1890ff" : "#f0f0f0",
                    backgroundColor: isCurrent ? "#f0f5ff" : "#fff",
                  }}
                >
                  <Flex justify="space-between" align="start">
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {item.Position?.name || "Posisi ?"}
                      </Title>
                      <Text type="secondary">{item.Department?.name}</Text>
                      {item.notes && (
                        <div style={{ marginTop: 4 }}>
                          <Text
                            type="secondary"
                            italic
                            style={{ fontSize: 12 }}
                          >
                            "{item.notes}"
                          </Text>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Tag color={config.color} style={{ marginRight: 0 }}>
                        {config.label}
                      </Tag>
                      <div style={{ marginTop: 5, marginBottom: 8 }}>
                        {isCurrent ? (
                          <Tag color="processing">Aktif</Tag>
                        ) : (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            s.d {moment(item.endDate).format("DD MMM YYYY")}
                          </Text>
                        )}
                      </div>

                      {/* Tombol Aksi Kecil */}
                      <Flex gap="small" justify="flex-end">
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleOpenModal(item)}
                        />
                        <Popconfirm
                          title="Hapus riwayat ini?"
                          onConfirm={() => handleDelete(item.id)}
                        >
                          <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Popconfirm>
                      </Flex>
                    </div>
                  </Flex>
                </Card>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}

      {/* --- MODAL FORM --- */}
      <Modal
        title={editData ? "Edit Riwayat" : "Tambah Riwayat Manual"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={() => form.submit()}
        confirmLoading={isSaving}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="departmentId"
            label="Departemen"
            rules={[{ required: true }]}
          >
            <Select onChange={handleDeptChange} placeholder="Pilih Dept">
              {depsData?.map((d) => (
                <Select.Option key={d.id} value={d.id}>
                  {d.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="positionId"
            label="Jabatan"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Pilih Jabatan"
              disabled={positionList.length === 0}
            >
              {positionList.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Flex gap="middle">
            <Form.Item
              name="startDate"
              label="Tanggal Mulai"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Tanggal Selesai (Opsional)"
              style={{ flex: 1 }}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                placeholder="Kosong = Masih Aktif"
              />
            </Form.Item>
          </Flex>

          <Form.Item
            name="type"
            label="Jenis Perubahan"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="hired">Diterima (Hired)</Select.Option>
              <Select.Option value="promoted">Promosi</Select.Option>
              <Select.Option value="transfer">Mutasi / Rotasi</Select.Option>
              <Select.Option value="demoted">Demosi</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Catatan">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default TabCareerHistory;
