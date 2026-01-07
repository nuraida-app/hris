import React, { useState } from "react";
import { Table, Button, Popconfirm, Card, message, Alert, Tag } from "antd";
import { DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  useGetTablesQuery,
  useCleanTablesMutation,
} from "../../../service/database/ApiDatabase"; // Sesuaikan path

const ManageDb = () => {
  const { data: tablesData, isLoading, refetch } = useGetTablesQuery();
  const [cleanTables, { isLoading: isCleaning }] = useCleanTablesMutation();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const columns = [
    {
      title: "Nama Tabel",
      dataIndex: "tableName",
      key: "tableName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: () => <Tag color="blue">Active</Tag>,
    },
  ];

  // Transform data array string menjadi object untuk Antd Table
  const dataSource =
    tablesData?.map((name) => ({ key: name, tableName: name })) || [];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const handleClean = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const res = await cleanTables({ tables: selectedRowKeys }).unwrap();
      message.success(res.message);
      setSelectedRowKeys([]); // Reset selection
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Gagal membersihkan tabel.");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="Manajemen Tabel Database"
        extra={
          <Button icon={<ReloadOutlined />} onClick={refetch}>
            Refresh
          </Button>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Alert
          message="Bahaya: Zona Berbahaya"
          description="Membersihkan tabel akan menghapus data secara permanen (Truncate). Data yang dihapus tidak dapat dikembalikan kecuali Anda memiliki backup."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <Popconfirm
            title="Kosongkan Tabel?"
            description={`Anda yakin ingin menghapus semua data di ${selectedRowKeys.length} tabel terpilih?`}
            onConfirm={handleClean}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              loading={isCleaning}
            >
              Kosongkan{" "}
              {selectedRowKeys.length > 0 ? `(${selectedRowKeys.length})` : ""}{" "}
              Tabel Terpilih
            </Button>
          </Popconfirm>
          <span style={{ marginLeft: 8 }}>
            {selectedRowKeys.length > 0
              ? `Terpilih ${selectedRowKeys.length} item`
              : ""}
          </span>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={dataSource}
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default ManageDb;
