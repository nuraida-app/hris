import React, { useState } from "react";
import { Card, Button, Upload, message, Alert, Spin, Row, Col } from "antd";
import {
  CloudDownloadOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useRestoreDbMutation } from "../../../service/admin/database/ApiDatabase";

const { Dragger } = Upload;

const BackupNRestore = () => {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [restoreDb, { isLoading: isRestoring }] = useRestoreDbMutation();

  // Handle Download Backup Manual (Tanpa RTK Query agar Blob handled correctly)
  const handleBackup = async () => {
    setLoadingBackup(true);
    try {
      const response = await fetch("/api/database/backup", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Backup failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Clean up the object URL
      message.success("Backup berhasil diunduh!");
    } catch (error) {
      console.error(error);
      message.error("Gagal melakukan backup: " + error.message);
    } finally {
      setLoadingBackup(false);
    }
  };

  // Handle Upload Restore
  const handleRestore = async (file) => {
    const formData = new FormData();
    formData.append("backupFile", file);

    try {
      const res = await restoreDb(formData).unwrap();
      message.success(res.message);
    } catch (error) {
      message.error(error?.data?.message || "Gagal restore database.");
    }
    return false; // Prevent auto upload by Antd
  };

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[24, 24]}>
        {/* Kolom Backup */}
        <Col xs={24} md={12}>
          <Card title="Backup Data" bordered={false} className="shadow-sm">
            <Alert
              message="Informasi Backup"
              description="Proses ini akan mengunduh database SQL dan folder Assets (gambar/dokumen) dalam format .zip."
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                size="large"
                onClick={handleBackup}
                loading={loadingBackup}
              >
                Download Backup (.zip)
              </Button>
            </div>
          </Card>
        </Col>

        {/* Kolom Restore */}
        <Col xs={24} md={12}>
          <Card title="Restore Data" bordered={false} className="shadow-sm">
            <Alert
              message="Perhatian!"
              description="Restore akan MENGHAPUS data saat ini dan menggantinya dengan data dari file backup. Pastikan Anda yakin."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Spin spinning={isRestoring} tip="Sedang merestore database...">
              <Dragger
                name="file"
                multiple={false}
                beforeUpload={handleRestore}
                showUploadList={false}
                disabled={isRestoring}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Klik atau tarik file .zip ke sini
                </p>
                <p className="ant-upload-hint">
                  Hanya support file hasil backup dari sistem ini.
                </p>
              </Dragger>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BackupNRestore;
