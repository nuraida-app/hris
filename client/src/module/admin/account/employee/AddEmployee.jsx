import {
  Form,
  Input,
  message,
  Modal,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import React, { useEffect, useState } from "react"; // Tambah useState
import moment from "moment";
import { useSaveEmployeeMutation } from "../../../../service/admin/account/ApiEmployee";
import { useDepFilterQuery } from "../../../../service/master/ApiDep";

const AddEmployee = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();

  // State untuk menyimpan list posisi sesuai departemen yang dipilih
  const [positionList, setPositionList] = useState([]);

  const [saveEmployee, { data, error, isLoading, isSuccess }] =
    useSaveEmployeeMutation();

  // Mengambil data Departemen + Posisi (Nested)
  const { data: depsData } = useDepFilterQuery();
  // Catatan: Pastikan response backend strukturnya { data: [...] } atau sesuaikan aksesnya

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
    setPositionList([]); // Reset list posisi
    onClose();
  };

  // --- LOGIKA FILTER POSISI BERDASARKAN DEPARTEMEN ---
  const handleDepartmentChange = (value) => {
    // 1. Cari data departemen yang dipilih dari list
    const selectedDept = depsData?.find((d) => d.id === value);

    // 2. Set list posisi berdasarkan departemen tersebut (ambil properti Positions/positions sesuai backend)
    // Cek apakah backend mengembalikan 'Positions' (default Sequelize) atau 'positions'
    const positions = selectedDept?.Positions || selectedDept?.positions || [];
    setPositionList(positions);

    // 3. Reset field positionId agar user harus memilih ulang
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

  // --- MENGISI FORM SAAT EDIT (PAYLOAD ADA) ---
  useEffect(() => {
    if (payload && open && depsData?.length > 0) {
      // 1. Set field dasar
      form.setFieldsValue({
        nip: payload.nip,
        fullName: payload.fullName,
        phone: payload.phone,
        address: payload.address,
        gender: payload.gender,
        status: payload.status,
        joinDate: payload.joinDate ? moment(payload.joinDate) : null,

        // Data Login
        username: payload.account?.username,
        email: payload.account?.email,
        password: "",

        // ID Master
        departmentId: payload.departmentId,
        positionId: payload.positionId,
      });

      // 2. LOGIKA PENTING: Isi positionList agar dropdown posisi tidak kosong saat mode edit
      if (payload.departmentId) {
        const selectedDept = depsData?.find(
          (d) => d.id === payload.departmentId
        );
        const positions =
          selectedDept?.Positions || selectedDept?.positions || [];
        setPositionList(positions);
      }
    }
  }, [payload, open, depsData]); // Tambahkan depsData? dependency

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      okText="Simpan"
      cancelText="Batal"
      onOk={() => form.submit()}
      confirmLoading={isLoading}
      width={800} // Sedikit diperlebar agar rapi
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={24}>
          {/* KOLOM KIRI (Data Diri & Akun) */}
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Nama Lengkap"
              rules={[{ required: true, message: "Nama wajib diisi" }]}
            >
              <Input placeholder="Nama Lengkap Pegawai" />
            </Form.Item>

            <Form.Item
              name="nip"
              label="NIP"
              rules={[{ required: true, message: "NIP wajib diisi" }]}
            >
              <Input placeholder="Contoh: 2023001" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Email wajib diisi" },
                { type: "email", message: "Format email tidak valid" },
              ]}
            >
              <Input placeholder="email@perusahaan.com" />
            </Form.Item>

            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: "Username wajib diisi" }]}
            >
              <Input placeholder="Username Login" />
            </Form.Item>

            <Form.Item
              name="password"
              label={payload ? "Password (Isi jika ingin ubah)" : "Password"}
              rules={[
                {
                  required: !payload,
                  message: "Password wajib diisi untuk user baru",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          </Col>

          {/* KOLOM KANAN (Data Pekerjaan & Detail) */}
          <Col span={12}>
            {/* 1. DEPARTMENT DROPDOWN */}
            <Form.Item
              name="departmentId"
              label="Departemen"
              rules={[{ required: true, message: "Pilih Departemen" }]}
            >
              <Select
                placeholder="Pilih Departemen"
                onChange={handleDepartmentChange} // Trigger filter posisi
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

            {/* 2. POSITION DROPDOWN (Isinya tergantung Dept) */}
            <Form.Item
              name="positionId"
              label="Jabatan / Posisi"
              rules={[{ required: true, message: "Pilih Posisi" }]}
            >
              <Select
                placeholder={
                  positionList.length === 0
                    ? "Pilih Departemen dahulu"
                    : "Pilih Posisi"
                }
                disabled={positionList.length === 0} // Disable jika belum pilih dept
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

            <Form.Item
              name="joinDate"
              label="Tanggal Bergabung"
              rules={[{ required: true, message: "Tanggal wajib diisi" }]}
            >
              <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status Kepegawaian"
              initialValue="probation"
            >
              <Select>
                <Select.Option value="probation">Probation</Select.Option>
                <Select.Option value="contract">Contract</Select.Option>
                <Select.Option value="permanent">Permanent</Select.Option>
                <Select.Option value="resigned">Resigned</Select.Option>
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="gender"
                  label="Jenis Kelamin"
                  rules={[{ required: true, message: "Pilih gender" }]}
                >
                  <Select placeholder="Pilih">
                    <Select.Option value="Laki-laki">Laki-laki</Select.Option>
                    <Select.Option value="Perempuan">Perempuan</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="phone" label="No Telepon">
                  <Input placeholder="08xxx" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddEmployee;
