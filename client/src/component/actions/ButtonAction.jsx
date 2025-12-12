import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import React from "react";

const ButtonAction = ({ onAction, payload, items }) => {
  // 1. Default items jika props 'items' tidak dikirim
  const defaultItems = [
    {
      key: "edit",
      label: "Edit",
      icon: <EditOutlined />,
    },
    {
      key: "delete",
      label: "Hapus",
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  // 2. Handler saat menu diklik
  const handleMenuClick = (e) => {
    // e.key adalah key dari menu ('edit' atau 'delete')
    if (onAction) {
      // Kita kembalikan key aksinya, dan payload datanya
      onAction(e.key, payload);
    }
  };

  return (
    <Dropdown.Button
      menu={{
        items: items || defaultItems, // Gunakan items kustom atau default
        onClick: handleMenuClick,
      }}
    >
      Pilihan Aksi
    </Dropdown.Button>
  );
};

export default ButtonAction;
