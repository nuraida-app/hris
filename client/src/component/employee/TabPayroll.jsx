import React, { useEffect } from "react";
import { Form, Input, Button, Row, Col, message, Flex } from "antd";
import { useSaveEmployeeMutation } from "../../service/account/ApiEmployee";

const TabPayroll = ({ data }) => {
  const [form] = Form.useForm();
  const [saveEmployee, { isLoading }] = useSaveEmployeeMutation();

  useEffect(() => {
    if (data) form.setFieldsValue(data);
  }, [data, form]);

  const onFinish = async (values) => {
    try {
      await saveEmployee({ id: data.id, ...values }).unwrap();
      message.success("Data Payroll & Legal diperbarui");
    } catch (error) {
      message.error(error?.data?.message || "Gagal update data");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={24}>
        <Col xs={24} md={12}>
          <h4 style={{ marginBottom: 16 }}>Informasi Bank</h4>
          <Form.Item label="Nama Bank" name="bankName">
            <Input placeholder="Contoh: BCA / Mandiri" />
          </Form.Item>
          <Form.Item label="Nomor Rekening" name="bankAccountNumber">
            <Input />
          </Form.Item>
          <Form.Item label="Atas Nama" name="bankAccountHolder">
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <h4 style={{ marginBottom: 16 }}>Identitas & Pajak</h4>
          <Form.Item label="Nomor KTP (NIK)" name="identityNumber">
            <Input />
          </Form.Item>
          <Form.Item label="NPWP" name="npwp">
            <Input />
          </Form.Item>
          <Form.Item label="BPJS Ketenagakerjaan" name="bpjsKetenagakerjaan">
            <Input />
          </Form.Item>
          <Form.Item label="BPJS Kesehatan" name="bpjsKesehatan">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Flex justify="end">
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Simpan Data Payroll
        </Button>
      </Flex>
    </Form>
  );
};

export default TabPayroll;
