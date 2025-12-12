import { Form, Input, message, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { useGetDepartmentsQuery } from "../../../../service/master/ApiDep";
import { useSavePositionMutation } from "../../../../service/master/ApiPos";

const AddPosition = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();

  const { data: deps } = useGetDepartmentsQuery();
  const options = deps?.map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const [savePosition, { data, error, isLoading, isSuccess }] =
    useSavePositionMutation();

  const handleSubmit = (values) => {
    const data = { id: payload.id, ...values };

    savePosition(data);
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
      message.error(error.data.message);
    }
  }, [data, error, isSuccess]);

  useEffect(() => {
    if (payload) {
      form.setFieldsValue({
        departmentId: payload.Department.id,
        name: payload.name,
        description: payload.description,
        level: payload.level,
      });
    }
  }, [payload]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      okText="Simpan"
      cancelText="Tutup"
      onOk={() => form.submit()}
      destroyOnHidden
      confirmLoading={isLoading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="departmentId"
          label="Pilih Departemen"
          rules={[{ required: true, message: "Wajib dipilih" }]}
        >
          <Select placeholder="Pilih Departemen" options={options} allowClear />
        </Form.Item>

        <Form.Item
          name={"name"}
          label="Jabatan"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input placeholder="Nama Jabatan" />
        </Form.Item>

        <Form.Item
          name={"level"}
          label="Level"
          rules={[{ required: true, message: "Wajib dipilih" }]}
        >
          <Select
            placeholder="Pilih Level"
            allowClear
            options={[
              { label: "Supervisor", value: 1 },
              { label: "Staff", value: 2 },
            ]}
          />
        </Form.Item>

        <Form.Item
          name={"description"}
          label="Job Desc"
          rules={[{ required: true, message: "Wajib diisi" }]}
        >
          <Input.TextArea rows={4} placeholder="Job Desc" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddPosition;
