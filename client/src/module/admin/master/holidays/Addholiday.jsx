import { Form, Modal, Input, DatePicker, Checkbox, message } from "antd";
import { useAddHolidayMutation } from "../../../../service/master/ApiHoliday";
import { useEffect } from "react";
import moment from "moment";

const { TextArea } = Input;

const AddHoliday = ({ title, open, onClose, payload }) => {
  const [form] = Form.useForm();

  const [addHoliday, { data, error, isLoading, isSuccess }] =
    useAddHolidayMutation();

  const handleSubmit = async (values) => {
    const data = { id: payload.id, ...values };
    addHoliday(data);
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
        ...payload,
        startDate: moment(payload.startDate),
        endDate: moment(payload.endDate),
      });
    }
  }, [payload]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      okText="Simpan"
      cancelText="Tutup"
      confirmLoading={isLoading}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Nama Hari Libur"
          rules={[
            { required: true, message: "Please input the holiday name!" },
          ]}
        >
          <Input placeholder="Nama hari libur" />
        </Form.Item>
        <Form.Item
          name="startDate"
          label="Tanggal Mulai"
          rules={[{ required: true, message: "Please select the start date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          name="endDate"
          label="Tanggal Selesai"
          rules={[{ required: true, message: "Please select the end date!" }]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item name="isCutiBersama" valuePropName="checked">
          <Checkbox>Cuti Bersama</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddHoliday;
