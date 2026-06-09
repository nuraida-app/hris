import {
  Form,
  Input,
  message,
  Modal,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { useSaveEmployeeMutation } from "../../../../service/account/ApiEmployee";
import { useDepFilterQuery } from "../../../../service/master/ApiDep";
import "./AddEmployee.css";

const STATUS_OPTIONS = [
  { value: "probation", label: "Masa Percobaan" },
  { value: "contract", label: "Kontrak" },
  { value: "permanent", label: "Pegawai Tetap" },
  { value: "resigned", label: "Resign" },
];

const SectionTitle = ({ icon, children }) => (
  <span className="add-employee__section-title">
    {icon}
    {children}
  </span>
);

const AddEmployee = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();
  const [positionList, setPositionList] = useState([]);
  const isEdit = Boolean(payload?.id);

  const [saveEmployee, { data, error, isLoading, isSuccess }] =
    useSaveEmployeeMutation();

  const { data: depsData } = useDepFilterQuery();

  const handleSubmit = (values) => {
    const formattedData = {
      id: payload?.id,
      ...values,
      joinDate: values.joinDate ? values.joinDate.format("YYYY-MM-DD") : null,
    };
    saveEmployee(formattedData);
  };

  const handleClose = () => {
    form.resetFields();
    setPositionList([]);
    onClose();
  };

  const handleDepartmentChange = (value) => {
    const selectedDept = depsData?.find((d) => d.id === value);
    const positions =
      selectedDept?.Positions || selectedDept?.positions || [];
    setPositionList(positions);
    form.setFieldsValue({ positionId: null });
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data?.message || "Berhasil menyimpan data");
      handleClose();
    }
    if (error) {
      message.error(error?.data?.message || "Terjadi kesalahan");
    }
  }, [data, error, isSuccess]);

  useEffect(() => {
    if (payload && open && depsData?.length > 0) {
      form.setFieldsValue({
        nip: payload.nip,
        nuptk: payload.nuptk,
        fullName: payload.fullName,
        phone: payload.phone,
        address: payload.address,
        gender: payload.gender,
        status: payload.status,
        joinDate: payload.joinDate ? moment(payload.joinDate) : null,
        username: payload.account?.username,
        email: payload.account?.email,
        password: "",
        departmentId: payload.departmentId,
        positionId: payload.positionId,
      });

      if (payload.departmentId) {
        const selectedDept = depsData?.find(
          (d) => d.id === payload.departmentId
        );
        const positions =
          selectedDept?.Positions || selectedDept?.positions || [];
        setPositionList(positions);
      }
    } else if (!payload && open) {
      form.resetFields();
      setPositionList([]);
    }
  }, [payload, open, depsData, form]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      okText="Simpan"
      cancelText="Batal"
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      width={860}
      destroyOnHidden
      className="add-employee-modal"
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark="optional"
        scrollToFirstError
      >
        <div className="add-employee__section">
          <Divider orientation="left" plain>
            <SectionTitle icon={<UserOutlined />}>
              Informasi Pribadi
            </SectionTitle>
          </Divider>

          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Nama Lengkap"
                rules={[{ required: true, message: "Nama wajib diisi" }]}
              >
                <Input placeholder="Masukkan nama lengkap pegawai" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="nip"
                label="NIP"
                rules={[{ required: true, message: "NIP wajib diisi" }]}
              >
                <Input placeholder="Contoh: 2024001" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="nuptk" label="NUPTK">
                <Input placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan (opsional)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gender"
                label="Jenis Kelamin"
                rules={[{ required: true, message: "Pilih jenis kelamin" }]}
              >
                <Select placeholder="Pilih jenis kelamin">
                  <Select.Option value="Laki-laki">Laki-laki</Select.Option>
                  <Select.Option value="Perempuan">Perempuan</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="No. Telepon">
                <Input placeholder="08xxxxxxxxxx" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Alamat">
                <Input.TextArea
                  rows={2}
                  placeholder="Alamat domisili pegawai (opsional)"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="add-employee__section">
          <Divider orientation="left" plain>
            <SectionTitle icon={<LockOutlined />}>Akun Login</SectionTitle>
          </Divider>

          {isEdit && (
            <span className="add-employee__hint">
              Kosongkan password jika tidak ingin mengubah kata sandi.
            </span>
          )}

          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Email wajib diisi" },
                  { type: "email", message: "Format email tidak valid" },
                ]}
              >
                <Input placeholder="email@nuraida.sch.id" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: "Username wajib diisi" }]}
              >
                <Input placeholder="Username untuk login sistem" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label={isEdit ? "Password Baru" : "Password"}
                rules={[
                  {
                    required: !isEdit,
                    message: "Password wajib diisi untuk pegawai baru",
                  },
                ]}
              >
                <Input.Password
                  placeholder={
                    isEdit ? "Isi jika ingin mengubah password" : "Password"
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <div className="add-employee__section">
          <Divider orientation="left" plain>
            <SectionTitle icon={<BankOutlined />}>
              Data Kepegawaian
            </SectionTitle>
          </Divider>

          <Row gutter={[20, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="departmentId"
                label="Departemen"
                rules={[{ required: true, message: "Pilih departemen" }]}
              >
                <Select
                  placeholder="Pilih departemen"
                  onChange={handleDepartmentChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {depsData?.map((dept) => (
                    <Select.Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="positionId"
                label="Jabatan / Posisi"
                rules={[{ required: true, message: "Pilih jabatan" }]}
              >
                <Select
                  placeholder={
                    positionList.length === 0
                      ? "Pilih departemen terlebih dahulu"
                      : "Pilih jabatan"
                  }
                  disabled={positionList.length === 0}
                  showSearch
                  optionFilterProp="children"
                >
                  {positionList.map((pos) => (
                    <Select.Option key={pos.id} value={pos.id}>
                      {pos.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="joinDate"
                label="Tanggal Bergabung"
                rules={[
                  { required: true, message: "Tanggal bergabung wajib diisi" },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                  placeholder="Pilih tanggal"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status Kepegawaian"
                initialValue="probation"
              >
                <Select placeholder="Pilih status">
                  {STATUS_OPTIONS.map((opt) => (
                    <Select.Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEmployee;
