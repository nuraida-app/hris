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
import { useEffect, useState } from "react";
import AddPosition from "./AddPosition";
import ButtonAction from "../../../../component/actions/ButtonAction";
import {
  useDeletePositionMutation,
  useGetPositionsQuery,
} from "../../../../service/master/ApiPos";

const { Title } = Typography;
const { confirm } = Modal;

const Position = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState("");

  const { data, isLoading } = useGetPositionsQuery({
    page,
    limit,
    search: debounced,
  });
  const [
    deletePosition,
    { data: msg, error, isLoading: delLoading, isSuccess },
  ] = useDeletePositionMutation();

  const handleClose = () => {
    setOpen(false);
    setPayload("");
  };

  const handleEdit = (record) => {
    setPayload(record);
    setOpen(true);
  };

  const handleAction = (key, record) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "delete":
        confirm({
          title: "Yakin menghapus data ini?",
          content: "Data yang sudah dihapus tidak dapat dikembalikan!",
          okText: "Ya, Saya Yakin!",
          okType: "danger",
          cancelText: "Tidak",
          onOk: () => {
            deletePosition(record.id);
          },
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
      title: "Nama Departemen",
      // Mengakses data bersarang (nested) Department.dep_name
      dataIndex: ["Department", "dep_name"],
      key: "dep_name",
      width: "15%",
    },
    {
      title: "Jabatan",
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: "10%",

      render: (level) => {
        return level === 1 ? "Supervisor" : "Staff";
      },
    },
    {
      title: "Job Desc",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Aksi",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <ButtonAction payload={record} onAction={handleAction} />
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          JABATAN
        </Title>

        <Space>
          <Input
            placeholder="Cari Jabatan ..."
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
        dataSource={data?.positions}
        columns={columns}
        loading={isLoading || delLoading} // Tampilkan status loading
        pagination={{
          total: data?.total_data || 0, // Total data dari API
          current: page, // Halaman saat ini
          pageSize: limit, // Jumlah data per halaman
          onChange: (newPage, newLimit) => {
            // Handler saat halaman atau limit berubah
            setPage(newPage);
            setLimit(newLimit);
          },
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
          showSizeChanger: true, // Tampilkan opsi untuk mengubah pageSize
          pageSizeOptions: ["10", "20", "50", "100"], // Opsi pageSize
        }}
      />

      <AddPosition
        title={payload ? "Edit Jabatan" : "Tambah Jabatan"}
        open={open}
        onClose={handleClose} // Menggunakan handleClose yang me-reset payload
        payload={payload}
      />
    </Flex>
  );
};

export default Position;
