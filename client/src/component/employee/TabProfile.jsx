import React, { useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Flex,
} from "antd";
import moment from "moment";
import { useSaveEmployeeMutation } from "../../service/account/ApiEmployee";

const TabProfile = ({ data }) => {
  const [form] = Form.useForm();
  const [saveEmployee, { isLoading }] = useSaveEmployeeMutation();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        ...data,
        joinDate: data.joinDate ? moment(data.joinDate) : null,
        dateOfBirth: data.dateOfBirth ? moment(data.dateOfBirth) : null,
        // Mapping nested object untuk ditampilkan saja (jika perlu)
      });
    }
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      const payload = {
        id: data.id,
        ...values,
        joinDate: values.joinDate?.format("YYYY-MM-DD"),
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
      };
      await saveEmployee(payload).unwrap();
      message.success("Profil berhasil diperbarui");
    } catch (error) {
      message.error(error?.data?.message || "Gagal memperbarui profil");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={24}>
        {/* Kolom Kiri: Data Pribadi */}
        <Col xs={24} md={12}>
          <Form.Item label="NIP" name="nip" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="NUPTK" name="nuptk">
            <Input placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan (opsional)" />
          </Form.Item>
          <Form.Item
            label="Nama Lengkap"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Tempat Lahir" name="placeOfBirth">
            <Input />
          </Form.Item>
          <Form.Item label="Tanggal Lahir" name="dateOfBirth">
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item label="Agama" name="religion">
            <Select>
              <Select.Option value="Islam">Islam</Select.Option>
              <Select.Option value="Kristen">Kristen</Select.Option>
              <Select.Option value="Katolik">Katolik</Select.Option>
              <Select.Option value="Hindu">Hindu</Select.Option>
              <Select.Option value="Buddha">Buddha</Select.Option>
            </Select>
          </Form.Item>
        </Col>

        {/* Kolom Kanan: Kontak & Alamat */}
        <Col xs={24} md={12}>
          <Form.Item label="Status Pernikahan" name="maritalStatus">
            <Select>
              <Select.Option value="single">Single</Select.Option>
              <Select.Option value="married">Married</Select.Option>
              <Select.Option value="widow">Janda</Select.Option>
              <Select.Option value="widower">Duda</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Nomor Telepon" name="phone">
            <Input />
          </Form.Item>
          <Form.Item label="Alamat Domisili" name="address">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Email Akun" name={["account", "email"]}>
            <Input disabled />
            {/* Email diedit lewat manajemen user atau logic khusus */}
          </Form.Item>
        </Col>
      </Row>
      <Flex justify="end">
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Simpan Perubahan Profil
        </Button>
      </Flex>
    </Form>
  );
};

export default TabProfile;
