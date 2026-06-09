import { Flex, Spin, Typography } from "antd";
import React from "react";

const colors = {
  primary: "#6A2E6F",
  lightPurple: "#8E5F92",
};

const LoadingUser = () => {
  return (
    <Flex
      style={{
        height: "100vh",
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.lightPurple} 100%)`,
      }}
      align="center"
      justify="center"
      gap={24}
      vertical
    >
      <Spin size="large" />
      <Typography style={{ color: "#fff", fontSize: 16 }}>
        Memuat sesi Anda...
      </Typography>
    </Flex>
  );
};

export default LoadingUser;
