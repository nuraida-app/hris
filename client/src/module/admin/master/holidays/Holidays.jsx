import React, { useState } from "react";
import {
  Table,
  Button,
  message,
  Space,
  Flex,
  Typography,
  Input,
  Modal,
} from "antd";
import {
  useGetHolidaysQuery,
  useDeleteHolidayMutation,
} from "../../../../service/master/ApiHoliday";
import { PlusOutlined } from "@ant-design/icons";
import AddHoliday from "./Addholiday";
import moment from "moment";
import ButtonAction from "../../../../component/actions/ButtonAction";
import { useEffect } from "react";

const { Title } = Typography;
const { confirm } = Modal;

const Holidays = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [open, setOpen] = useState(false);
  const [payload, setPaylod] = useState("");

  const { data, isLoading } = useGetHolidaysQuery({
    page,
    limit,
    search: debounced,
  });
  const [deleteHoliday] = useDeleteHolidayMutation();

  const handleEdit = (record) => {
    setPaylod(record);
    setOpen(true);
  };

  const handleCancel = () => {
    setPaylod("");
    setOpen(false);
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
            deleteHoliday(record.id);
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

  const columns = [
    {
      title: "Nama Hari Libur",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "startDate",
      key: "startDate",
      render: (text) => moment(text).format("DD MMMM YYYY"),
    },
    {
      title: "Tanggal Selesai",
      dataIndex: "endDate",
      key: "endDate",
      render: (text) => moment(text).format("DD MMMM YYYY"),
    },
    {
      title: "Cuti Bersama",
      dataIndex: "isCutiBersama",
      key: "isCutiBersama",
      render: (isCutiBersama) => (isCutiBersama ? "Ya" : "Tidak"),
    },
    {
      title: "Action",
      key: "action",
      width: "15%",
      render: (text, record) => (
        <ButtonAction payload={record} onAction={handleAction} />
      ),
    },
  ];

  return (
    <Flex vertical gap={"middle"}>
      <Flex align="center" justify="space-between">
        <Title level={5} style={{ margin: 0 }}>
          Daftar Hari Libur
        </Title>

        <Space>
          <Input
            placeholder="Cari hari libur ..."
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
        rowKey="id"
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        bordered
        pagination={{
          current: page,
          pageSize: limit,
          total: data?.total,
          onChange: (newPage, newLimit) => {
            setPage(newPage);
            setLimit(newLimit);
          },
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
      />

      <AddHoliday
        title={payload ? "Edit Holiday" : "Add Holiday"}
        open={open}
        onClose={handleCancel}
        payload={payload}
      />
    </Flex>
  );
};

export default Holidays;
