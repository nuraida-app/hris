import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, message, Table, Typography } from "antd";
import React, { useEffect } from "react";
import { useState } from "react";
import AddDep from "./AddDep";
import {
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
} from "../../../../service/master/ApiDep";
import ButtonAction from "../../../../component/actions/ButtonAction";

const { Title, Text } = Typography;

const Department = () => {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState("");

  const { data, isLoading } = useGetDepartmentsQuery();
  const [
    deleteDepertment,
    { data: delMsg, error, isLoading: delLoading, isSuccess },
  ] = useDeleteDepartmentMutation();

  const handleEdit = (record) => {
    setPayload(record);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setPayload("");
  };

  const handleAction = (key, record) => {
    switch (key) {
      case "edit":
        handleEdit(record);
        break;

      case "delete":
        deleteDepertment(record.id);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(delMsg.message);
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [delMsg, error, isSuccess]);

  const columns = [
    {
      title: "Nama Departement",
      dataIndex: "name",
      key: "name",
      width: "20%",
    },
    {
      title: "Penjelasan Departement",
      dataIndex: "description",
      key: "description",
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
          DEPARTEMEN
        </Title>

        <Button icon={<PlusOutlined />} onClick={() => setOpen(true)}>
          Tambah
        </Button>
      </Flex>

      <Table
        rowKey={"id"}
        dataSource={data}
        loading={isLoading || delLoading}
        columns={columns}
      />

      <AddDep
        title={payload ? "Edit Departement" : "Tambah Departement"}
        open={open}
        onClose={handleClose}
        payload={payload}
      />
    </Flex>
  );
};

export default Department;
