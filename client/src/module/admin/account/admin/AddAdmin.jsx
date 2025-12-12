import { Form, Input, message, Modal } from "antd";
import React, { useEffect } from "react";
import { useAddAdminMutation } from "../../../../service/admin/account/ApiAdmin";

const AddAdmin = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();

  const [addAdmin, { data, error, isLoading, isSuccess }] =
    useAddAdminMutation();

  const handleSubmit = (values) => {
    const data = { id: payload.id, ...values };
    addAdmin(data);
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      handleClose();
    }

    if (error) {
      message.error(error.message);
    }
  }, [data, error, isSuccess]);

  useEffect(() => {
    if (payload) {
      form.setFieldsValue({
        name: payload.name,
        username: payload.username,
        email: payload.email,
        password: payload.password,
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
      destroyOnHidden
      onOk={() => form.submit()}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name={"name"}
          label="Nama Admin"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Nama Admin" />
        </Form.Item>

        <Form.Item
          name={"username"}
          label="Username"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Username" />
        </Form.Item>

        <Form.Item
          name={"email"}
          label="Email"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Email" />
        </Form.Item>

        <Form.Item
          name={"password"}
          label="Password"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddAdmin;
