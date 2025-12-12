import { Flex, Spin, Typography } from "antd";
import React from "react";

const LoadingUser = () => {
  return (
    <Flex
      style={{
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      align="center"
      justify="center"
      gap={24}
      vertical
    >
      <Spin size="large" />
      <Typography style={{ color: "#fff" }}>Memuat Data Pengguna...</Typography>
    </Flex>
  );
};

export default LoadingUser;
