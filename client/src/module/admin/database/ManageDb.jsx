import React, { useMemo, useState } from "react";
import {
  Table,
  Button,
  Popconfirm,
  message,
  Alert,
  Tag,
  Input,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
  TableOutlined,
} from "@ant-design/icons";
import {
  useGetTablesQuery,
  useCleanTablesMutation,
} from "../../../service/database/ApiDatabase";
import "./Database.css";

const { Text } = Typography;

const ManageDb = () => {
  const { data: tablesData, isLoading, refetch, isFetching } =
    useGetTablesQuery();
  const [cleanTables, { isLoading: isCleaning }] = useCleanTablesMutation();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [search, setSearch] = useState("");

  const filteredTables = useMemo(() => {
    const tables = tablesData ?? [];
    if (!search.trim()) return tables;
    const keyword = search.toLowerCase();
    return tables.filter((name) => name.toLowerCase().includes(keyword));
  }, [tablesData, search]);

  const dataSource = filteredTables.map((name) => ({
    key: name,
    tableName: name,
  }));

  const columns = [
    {
      title: "Nama Tabel",
      dataIndex: "tableName",
      key: "tableName",
      render: (text) => (
        <Text strong>
          <TableOutlined style={{ marginRight: 8, color: "#6a2e6f" }} />
          {text}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: () => <Tag color="purple">Aktif</Tag>,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    preserveSelectedRowKeys: true,
  };

  const handleClean = async () => {
    if (selectedRowKeys.length === 0) return;

    try {
      const res = await cleanTables({ tables: selectedRowKeys }).unwrap();
      message.success(res.message || "Tabel berhasil dikosongkan");
      setSelectedRowKeys([]);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Gagal membersihkan tabel");
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  return (
    <div className="db-manage">
      <Alert
        className="db-manage__alert"
        message="Zona Berbahaya"
        description="Membersihkan tabel akan menghapus semua data secara permanen (truncate). Data yang dihapus tidak dapat dikembalikan kecuali Anda memiliki backup."
        type="error"
        showIcon
        icon={<WarningOutlined />}
      />

      <div className="db-manage__toolbar">
        <div className="db-manage__toolbar-left">
          <span className="db-manage__stat">
            <TableOutlined />
            {tablesData?.length ?? 0} tabel
          </span>
          {selectedRowKeys.length > 0 && (
            <span className="db-manage__selection">
              {selectedRowKeys.length} tabel dipilih
            </span>
          )}
        </div>

        <Input
          className="db-manage__search"
          placeholder="Cari nama tabel..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
        />
      </div>

      <div className="db-manage__toolbar" style={{ marginBottom: 16 }}>
        <Popconfirm
          title="Kosongkan tabel terpilih?"
          description={`Semua data di ${selectedRowKeys.length} tabel akan dihapus permanen.`}
          onConfirm={handleClean}
          okText="Ya, Kosongkan"
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
            Kosongkan Tabel
            {selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ""}
          </Button>
        </Popconfirm>

        <Button
          icon={<ReloadOutlined />}
          onClick={refetch}
          loading={isFetching && !isLoading}
        >
          Refresh
        </Button>
      </div>

      <Table
        className="db-manage__table"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} tabel`,
        }}
        locale={{ emptyText: "Tidak ada tabel ditemukan" }}
        scroll={{ x: 480 }}
      />
    </div>
  );
};

export default ManageDb;
