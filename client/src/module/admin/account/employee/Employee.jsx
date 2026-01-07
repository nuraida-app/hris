import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import AddEmployee from "./AddEmployee";
import {
  useGetEmployeesQuery,
  useDeleteEmployeeMutation,
} from "../../../../service/account/ApiEmployee";
import ButtonAction from "../../../../component/actions/ButtonAction";
import { useSearchParams } from "react-router-dom";

const { Title } = Typography;
const { confirm } = Modal;

const Employee = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelect = (employee) => {
    setSearchParams({
      employeeid: employee.id,
      employeeName: employee.fullName.replace(/\s/g, "-"),
    });
  };

  // State untuk Pagination & Search
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // State untuk Modal
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState(null);

  // RTK Query Hooks
  const { data, isLoading } = useGetEmployeesQuery({
    page,
    limit,
    search: debounced,
  });

  const [
    deleteEmployee,
    { isLoading: isDeleting, isSuccess: isDelSuccess, error: delError },
  ] = useDeleteEmployeeMutation();

  // Handle Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
      setPage(1); // Reset ke halaman 1 saat search berubah
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Handle Delete Response
  useEffect(() => {
    if (isDelSuccess) message.success("Berhasil menghapus data pegawai");
    if (delError) message.error(delError?.data?.message || "Gagal menghapus");
  }, [isDelSuccess, delError]);

  const handleClose = () => {
    setPayload(null);
    setOpen(false);
  };

  const handleEdit = (record) => {
    setPayload(record);
    setOpen(true);
  };

  const handleDelete = (id) => {
    deleteEmployee(id);
  };

  // Handler Aksi dari ButtonAction
  const handleAction = (key, record) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;
      case "delete":
        confirm({
          title: "Konfirmasi Penghapusan data",
          content: "Apakah Anda yakin ingin menghapus data ini?",
          okText: "Ya, Yakin hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => {
            handleDelete(record.id);
          },
          onCancel: () => {},
        });

        break;
      default:
        break;
    }
  };

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
      key: "nip",
    },
    {
      title: "Nama Lengkap",
      dataIndex: "fullName", // Sesuai model Employee
      key: "fullName",
      render: (fullName, record) => (
        <Tag
          className="pointer"
          color="blue"
          onClick={() => handleSelect(record)}
        >
          {fullName}
        </Tag>
      ),
    },
    {
      title: "Username",
      // Mengambil data dari relasi User (alias: account)
      dataIndex: ["account", "username"],
      key: "username",
    },
    {
      title: "Email",
      dataIndex: ["account", "email"],
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ textTransform: "capitalize" }}>{status}</span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: "10%",
      render: (_, record) => (
        <ButtonAction payload={record} onAction={handleAction} />
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Management Pegawai
        </Title>
        <Space>
          <Input
            placeholder="Cari (Nama, NIP, Email)..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Tambah
          </Button>
        </Space>
      </Flex>

      <Table
        rowKey={"id"}
        dataSource={data?.data} // Mengakses array data dari response backend
        loading={isLoading || isDeleting}
        columns={columns}
        scroll={{ x: 800 }} // Scroll horizontal jika kolom banyak
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.pagination?.totalItems, // Mengakses total dari pagination backend
          onChange: (newPage, newLimit) => {
            setPage(newPage);
            setLimit(newLimit);
          },
          showSizeChanger: true,
        }}
      />

      <AddEmployee
        title={payload ? "Edit Data Pegawai" : "Tambah Pegawai"}
        open={open}
        onClose={handleClose}
        payload={payload}
      />
    </Flex>
  );
};

export default Employee;
