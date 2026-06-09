import React, { useState } from "react";
import {
  Card,
  Button,
  Upload,
  message,
  Alert,
  Spin,
  Modal,
  Typography,
} from "antd";
import {
  CloudDownloadOutlined,
  InboxOutlined,
  CloudSyncOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useRestoreDbMutation } from "../../../service/database/ApiDatabase";
import "./Database.css";

const { Dragger } = Upload;
const { Text } = Typography;

const BackupNRestore = () => {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [restoreDb, { isLoading: isRestoring }] = useRestoreDbMutation();

  const handleBackup = async () => {
    setLoadingBackup(true);
    try {
      const response = await fetch("/api/database/backup", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || "Backup gagal");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success("Backup berhasil diunduh");
    } catch (error) {
      message.error(`Gagal melakukan backup: ${error.message}`);
    } finally {
      setLoadingBackup(false);
    }
  };

  const processRestore = async (file) => {
    const formData = new FormData();
    formData.append("backupFile", file);

    try {
      const res = await restoreDb(formData).unwrap();
      message.success(res.message || "Database berhasil dipulihkan");
    } catch (error) {
      message.error(error?.data?.message || "Gagal restore database");
    }
  };

  const handleRestore = (file) => {
    Modal.confirm({
      title: "Restore Database?",
      icon: <WarningOutlined style={{ color: "#faad14" }} />,
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            Proses ini akan <strong>mengganti seluruh data saat ini</strong>{" "}
            dengan isi file backup:
          </p>
          <Text code>{file.name}</Text>
          <p style={{ marginTop: 12, marginBottom: 0, color: "rgba(0,0,0,0.55)" }}>
            Pastikan Anda sudah memiliki backup terbaru sebelum melanjutkan.
          </p>
        </div>
      ),
      okText: "Ya, Restore",
      cancelText: "Batal",
      okType: "danger",
      centered: true,
      onOk: () => processRestore(file),
    });
    return false;
  };

  return (
    <div className="db-backup">
      <div className="db-backup__grid">
        <Card
          className="db-backup__card"
          title={
            <span>
              <CloudDownloadOutlined style={{ marginRight: 8, color: "#6a2e6f" }} />
              Backup Data
            </span>
          }
        >
          <Alert
            message="Informasi Backup"
            description="Mengunduh database SQL dan folder assets (gambar/dokumen) dalam format .zip."
            type="info"
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
          />

          <div className="db-backup__action">
            <div className="db-backup__icon-wrap db-backup__icon-wrap--backup">
              <CloudDownloadOutlined />
            </div>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              size="large"
              onClick={handleBackup}
              loading={loadingBackup}
              style={{
                background: "#6a2e6f",
                borderColor: "#6a2e6f",
                borderRadius: 10,
                height: 44,
                paddingInline: 24,
              }}
            >
              Download Backup (.zip)
            </Button>
            <span className="db-backup__hint">
              Disarankan melakukan backup secara berkala
            </span>
          </div>
        </Card>

        <Card
          className="db-backup__card"
          title={
            <span>
              <CloudSyncOutlined style={{ marginRight: 8, color: "#d48806" }} />
              Restore Data
            </span>
          }
        >
          <Alert
            message="Zona Berbahaya"
            description="Restore akan menghapus data saat ini dan menggantinya dengan isi file backup."
            type="warning"
            showIcon
            style={{ marginBottom: 16, borderRadius: 10 }}
          />

          <Dragger
            className="db-backup__dragger"
            name="file"
            multiple={false}
            beforeUpload={handleRestore}
            showUploadList={false}
            disabled={isRestoring}
            accept=".zip"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: "#6a2e6f" }} />
            </p>
            <p className="ant-upload-text">
              Klik atau tarik file .zip ke sini
            </p>
            <p className="ant-upload-hint">
              Hanya file backup yang dihasilkan sistem ini
            </p>
          </Dragger>

          {isRestoring && (
            <div className="db-backup__loading">
              <Spin size="small" />
              Sedang merestore database...
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BackupNRestore;
