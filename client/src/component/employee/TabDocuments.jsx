import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Upload, // Import komponen Upload
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  InboxOutlined, // Icon untuk area upload
} from "@ant-design/icons";
import {
  useSaveDocumentMutation,
  useDeleteDocumentMutation,
} from "../../service/account/ApiEmployee";

const { Dragger } = Upload; // Gunakan Dragger untuk UX yang lebih bagus

const TabDocuments = ({ data, employeeId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]); // State untuk menampung file sementara

  const [saveDoc, { isLoading }] = useSaveDocumentMutation();
  const [deleteDoc] = useDeleteDocumentMutation();

  // Konfigurasi properti Upload AntD
  const uploadProps = {
    onRemove: (file) => {
      setFileList([]);
    },
    beforeUpload: (file) => {
      // Mencegah auto upload (kita upload manual saat submit form)
      setFileList([file]);
      return false;
    },
    fileList,
    maxCount: 1, // Hanya boleh 1 file per input
  };

  const handleAdd = async (values) => {
    if (fileList.length === 0) {
      message.error("Mohon pilih file dokumen terlebih dahulu!");
      return;
    }

    try {
      // Gunakan FormData untuk mengirim file
      const formData = new FormData();
      formData.append("employeeId", employeeId);
      formData.append("documentType", values.documentType);
      formData.append("description", values.description || "");
      if (values.expiryDate) {
        formData.append("expiryDate", values.expiryDate.format("YYYY-MM-DD"));
      }
      // "file" harus sesuai dengan nama field di upload.single("file") backend
      formData.append("file", fileList[0]);

      // Kirim FormData ke RTK Query
      await saveDoc(formData).unwrap();

      message.success("Dokumen berhasil diupload");
      setIsModalOpen(false);
      form.resetFields();
      setFileList([]); // Reset file
    } catch (error) {
      console.error(error);
      message.error(error?.data?.message || "Gagal menyimpan dokumen");
    }
  };

  const columns = [
    { title: "Tipe Dokumen", dataIndex: "documentType", key: "type" },
    { title: "Keterangan", dataIndex: "description", key: "desc" },
    { title: "Masa Berlaku", dataIndex: "expiryDate", key: "exp" },
    {
      title: "File",
      key: "file",
      render: (_, record) => (
        // Asumsi Anda sudah men-serve folder 'server/assets' sebagai static file di express
        // app.use('/assets', express.static('server/assets'));
        <Button
          icon={<FileTextOutlined />}
          size="small"
          href={record.filePath} // Sesuaikan URL Backend Anda
          target="_blank"
        >
          Lihat
        </Button>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Hapus dokumen?"
          description="File fisik juga akan dihapus permanen."
          onConfirm={() => deleteDoc(record.id)}
          okText="Ya"
          cancelText="Batal"
        >
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ marginBottom: 16 }}
      >
        Upload Dokumen
      </Button>
      <Table
        columns={columns}
        dataSource={data.EmployeeDocuments}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="Upload Dokumen Baru"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setFileList([]);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={isLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Form.Item
            name="documentType"
            label="Jenis Dokumen"
            rules={[{ required: true, message: "Jenis dokumen wajib diisi" }]}
          >
            <Input placeholder="Contoh: KTP, Ijazah, Kontrak" />
          </Form.Item>

          <Form.Item name="description" label="Keterangan">
            <Input.TextArea rows={2} placeholder="Keterangan tambahan..." />
          </Form.Item>

          <Form.Item name="expiryDate" label="Berlaku Sampai (Opsional)">
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item label="File Dokumen" required>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Klik atau tarik file ke sini</p>
              <p className="ant-upload-hint">
                Support PDF, Gambar, Word. Max 5MB.
              </p>
            </Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TabDocuments;
