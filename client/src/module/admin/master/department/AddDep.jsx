import { Form, Input, message, Modal } from "antd";
import React from "react";
import { useAddDepartmentMutation } from "../../../../service/master/ApiDep";
import { useEffect } from "react";

const AddDep = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();
  const [addDepartment, { data, error, isLoading, isSuccess }] =
    useAddDepartmentMutation();

  const handleSubmit = (values) => {
    const data = { id: payload.id, ...values };

    addDepartment(data);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      onClose();
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, error, isSuccess]);

  useEffect(() => {
    if (payload) {
      form.setFieldsValue({
        name: payload.name,
        description: payload.description,
      });
    }
  }, [payload]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      destroyOnHidden
      confirmLoading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name={"name"}
          label="Nama Departemen"
          rules={[{ required: true, message: "Wajib Diisi" }]}
        >
          <Input placeholder="Nama Departemen" />
        </Form.Item>

        <Form.Item name={"description"} label="Penjelasan Departemen">
          <Input.TextArea rows={4} placeholder="Penjelasan Departemen" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDep;
