import { Button, Drawer, Layout, Menu, message } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { adminMenus, userMenus } from "./Menus";

const { Header, Sider, Footer, Content } = Layout;

// --- KONFIGURASI WARNA DARI LOGO ---
const colors = {
  primary: "#6A2E6F", // Ungu Tua (NURAIDA)
  secondary: "#F3E6EF", // Pink Muda (Background area konten)
  textWhite: "#ffffff",
  textDark: "rgba(0,0,0,0.85)",
};

const MainLayout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem("collapsed");
    return savedCollapsed !== null ? JSON.parse(savedCollapsed) : false;
  });

  const handleCollapsedChange = (value) => {
    setCollapsed(value);
    localStorage.setItem("collapsed", JSON.stringify(value));
  };

  const handleMenuClick = ({ key }) => {
    if (isMobile) {
      setDrawerVisible(false);
    }
    if (key === "logout") {
      message.info("logout");
    } else {
      navigate(key);
    }
  };

  const sidebarContent = (
    <>
      {!drawerVisible && (
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Garis pembatas tipis
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            marginBottom: 16,
            backgroundColor: "#fff", // Background logo tetap putih
          }}
        >
          {collapsed && isMobile === false ? (
            <img src="/favicon.png" alt="logo" height={40} />
          ) : (
            <img src="/logo.png" alt="logo" height={40} />
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 100px)",
          justifyContent: "space-between",
        }}
      >
        <Menu
          items={user?.role === "admin" ? adminMenus : userMenus}
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          mode="inline"
          theme="light"
          // Custom style untuk item yang aktif agar warnanya ungu
          style={{
            borderRight: 0,
          }}
          // CSS Override sederhana untuk warna selected item
          // (AntD v5 biasanya menggunakan ConfigProvider, tapi ini cara cepat via style prop/css)
        />

        {/* Injeksi Style untuk mengubah warna item menu yang aktif menjadi Ungu */}
        <style>
          {`
            .ant-menu-item-selected {
              background-color: ${colors.secondary} !important;
              color: ${colors.primary} !important;
            }
            .ant-menu-item-selected svg {
              color: ${colors.primary} !important;
            }
            /* Garis samping pada item aktif */
            .ant-menu-item-selected::after {
              border-right: 3px solid ${colors.primary} !important;
            }
          `}
        </style>
      </div>
    </>
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <title>{title}</title>

      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
            backgroundColor: "#fff", // Sidebar Putih
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
          }}
        >
          {sidebarContent}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          title="NIBS"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          style={{ padding: 0 }}
          width={200}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: "margin-left 0.2s",
          backgroundColor: "#f0f2f5", // Background body abu-abu sangat muda standar
        }}
      >
        <Header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            // --- PERUBAHAN UTAMA: HEADER JADI UNGU ---
            backgroundColor: colors.primary,
            height: "64px",
            position: "fixed",
            top: 0,
            right: 0,
            left: isMobile ? 0 : collapsed ? 80 : 200,
            zIndex: 999,
            transition: "left 0.2s",
            padding: "0 24px",
          }}
        >
          <Button
            type="text" // Ubah ke text agar blend dengan background ungu
            icon={
              isMobile ? (
                <MenuOutlined style={{ color: colors.textWhite }} />
              ) : collapsed ? (
                <MenuUnfoldOutlined style={{ color: colors.textWhite }} />
              ) : (
                <MenuFoldOutlined style={{ color: colors.textWhite }} />
              )
            }
            onClick={() =>
              isMobile
                ? setDrawerVisible(!drawerVisible)
                : handleCollapsedChange(!collapsed)
            }
            style={{
              fontSize: "16px",
              color: colors.textWhite, // Warna icon toggle putih
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  color: colors.textWhite, // Teks putih
                  lineHeight: "1.2",
                }}
              >
                Administrator
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255, 0.75)", // Teks putih agak transparan
                  lineHeight: "1.2",
                }}
              >
                Admin
              </div>
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: "84px 16px 16px 16px", // Margin top disesuaikan
            padding: "24px",
            borderRadius: 8,
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            minHeight: "calc(100vh - 169px)",
            overflow: "auto",
          }}
        >
          {children}
        </Content>

        <Footer
          style={{
            textAlign: "center",
            background: "transparent",
            color: "#888",
          }}
        >
          <span>&copy; {new Date().getFullYear()}</span> NIBS
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
