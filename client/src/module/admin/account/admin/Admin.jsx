import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Input,
  message,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import {
  useDeleteAdminMutation,
  useGetAdminsQuery,
} from "../../../../service/admin/account/ApiAdmin";
import ButtonAction from "../../../../component/actions/ButtonAction";
import AddAdmin from "./AddAdmin";

const { Title } = Typography;
const { confirm } = Modal;

const Admin = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState("");

  const { data, isLoading } = useGetAdminsQuery({
    page,
    limit,
    search: debounced,
  });
  const [deleteAdmin, { data: msg, error, isLoading: delLoading, isSuccess }] =
    useDeleteAdminMutation();

  const handleEdit = (record) => {
    setPayload(record);
    setOpen(true);
  };

  const handelClose = () => {
    setPayload("");
    setOpen(false);
  };

  const handleAction = (key, record) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "delete":
        confirm({
          title: "Konfirmasi Hapus",
          content: "Apakah Anda yakin ingin menghapus admin ini?",
          okText: "Hapus",
          okType: "danger",
          cancelText: "Batal",
          onOk: () => {
            deleteAdmin(record.id);
          },
          onCancel: () => {},
        });

        break;

      default:
        break;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (isSuccess) {
      message.success(msg.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [msg, error, isSuccess]);

  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Aksi",
      key: "action",
      width: "15%", // Opsional: agar kolom aksi rapi
      render: (_, record) => (
        <ButtonAction
          payload={record} // Kirim data baris ini
          onAction={handleAction} // Kirim fungsi handler pusat
        />
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Management Administrator
        </Title>

        <Space>
          <Input
            placeholder="Cari admin ..."
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
            Tambah
          </Button>
        </Space>
      </Flex>

      <Table
        rowKey={"id"}
        dataSource={data?.admins}
        loading={isLoading || delLoading}
        columns={columns}
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total,
          onChange: (page, limit) => {
            setLimit(limit);
            setPage(page);
          },
          onShowSizeChange: (limit) => setLimit(limit),
          showSizeChanger: true,
        }}
      />

      <AddAdmin
        title={payload ? "Edit Admin" : "Tambah Admin"}
        open={open}
        onClose={handelClose}
        payload={payload}
      />
    </Flex>
  );
};

export default Admin;
