import React from "react";
import { Timeline, Card, Tag, Typography, Empty, Flex } from "antd";
import {
  ClockCircleOutlined,
  RiseOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  FallOutlined,
} from "@ant-design/icons";
import moment from "moment";
import "moment/locale/id"; // Pastikan locale Indonesia aktif

const { Text, Title } = Typography;

const TabCareerHistory = ({ data }) => {
  // Ambil array history dari props data
  // Catatan: Sequelize biasanya me-return nama model di-plural-kan (CareerHistories)
  // Jika di backend Anda mendefinisikan alias (as: 'histories'), sesuaikan di sini.
  const histories = data?.CareerHistories || [];

  if (histories.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Belum ada riwayat jabatan"
      />
    );
  }

  // Helper untuk menentukan warna & icon berdasarkan tipe
  const getTypeConfig = (type) => {
    switch (type) {
      case "hired":
        return {
          color: "green",
          icon: <CheckCircleOutlined />,
          label: "Diterima (Hired)",
        };
      case "promoted":
        return { color: "blue", icon: <RiseOutlined />, label: "Promosi" };
      case "transfer":
        return {
          color: "orange",
          icon: <SwapOutlined />,
          label: "Mutasi / Rotasi",
        };
      case "demoted":
        return { color: "red", icon: <FallOutlined />, label: "Demosi" };
      default:
        return { color: "gray", icon: <ClockCircleOutlined />, label: type };
    }
  };

  return (
    <Card bordered={false} title="Perjalanan Karir">
      <Timeline mode="left">
        {histories.map((item, index) => {
          const config = getTypeConfig(item.type);
          const isCurrent = !item.endDate; // Jika endDate null, berarti jabatan sekarang

          return (
            <Timeline.Item
              key={item.id || index}
              color={config.color}
              dot={config.icon}
              label={
                <Text type="secondary">
                  {moment(item.startDate).format("DD MMMM YYYY")}
                </Text>
              }
            >
              <Card
                size="small"
                bordered={true}
                style={{
                  marginBottom: 10,
                  borderColor: isCurrent ? "#1890ff" : "#f0f0f0",
                  backgroundColor: isCurrent ? "#f0f5ff" : "#fff",
                }}
              >
                <Flex justify="space-between" align="start">
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      {item.Position?.name || "Posisi Tidak Diketahui"}
                    </Title>
                    <Text type="secondary">{item.Department?.name}</Text>

                    {/* Notes jika ada */}
                    {item.notes && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary" italic style={{ fontSize: 12 }}>
                          Catatan: "{item.notes}"
                        </Text>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <Tag color={config.color}>{config.label}</Tag>
                    <div style={{ marginTop: 5 }}>
                      {isCurrent ? (
                        <Tag color="processing">Aktif Sekarang</Tag>
                      ) : (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          S.d {moment(item.endDate).format("DD MMM YYYY")}
                        </Text>
                      )}
                    </div>
                  </div>
                </Flex>
              </Card>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );
};

export default TabCareerHistory;
