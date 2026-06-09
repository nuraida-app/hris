import {
  Avatar,
  Button,
  ConfigProvider,
  Drawer,
  Layout,
  Menu,
  Typography,
  message,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Suspense, useEffect, useMemo, useState } from "react";
import LoadingScreen from "../loader/LoadingScreen";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  adminNavItems,
  userNavItems,
  logoutItem,
  getRoleLabel,
} from "./Menus";
import { useLogoutMutation } from "../../service/auth/ApiAuth";
import { isAdminRole } from "../../utils/auth";
import "./MainLayout.css";

const { Header, Sider, Footer, Content } = Layout;
const { Title } = Typography;

const SIDER_WIDTH = 240;
const SIDER_COLLAPSED_WIDTH = 72;
const MOBILE_BREAKPOINT = 992;

const theme = {
  token: {
    colorPrimary: "#6A2E6F",
    borderRadius: 10,
  },
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

const EMPLOYEE_PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/profile": "Profil Saya",
};

const resolveHeaderTitle = (title, pathname, isAdmin, displayName) => {
  if (isAdmin) return title;

  const pageTitle = EMPLOYEE_PAGE_TITLES[pathname];
  if (pageTitle) return pageTitle;

  const normalizedTitle = title?.trim() || "";
  if (!normalizedTitle) return "Dashboard";

  const hasGreeting = /^halo[,\s]/i.test(normalizedTitle);
  const hasUserName =
    displayName && normalizedTitle.toLowerCase().includes(displayName.toLowerCase());

  if (hasGreeting || hasUserName) {
    return pageTitle || "Dashboard";
  }

  return normalizedTitle;
};

const MainLayout = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  const [logout, { data, error, isSuccess }] = useLogoutMutation();

  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const savedCollapsed = localStorage.getItem("collapsed");
    return savedCollapsed !== null ? JSON.parse(savedCollapsed) : false;
  });

  const isAdmin = isAdminRole(user?.role);
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const displayName = user?.displayName || user?.name || user?.username || "Pengguna";
  const roleLabel = getRoleLabel(user?.role);
  const headerTitle = resolveHeaderTitle(title, location.pathname, isAdmin, displayName);
  const headerSubtitle = isAdmin ? "Sistem Informasi SDM" : "Portal Pegawai";
  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  const handleCollapsedChange = (value) => {
    setCollapsed(value);
    localStorage.setItem("collapsed", JSON.stringify(value));
  };

  const handleMenuClick = ({ key }) => {
    if (isMobile) {
      setDrawerVisible(false);
    }
    if (key === "logout") {
      logout();
    } else {
      navigate(key);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data?.message);
      navigate("/");
    }

    if (error) {
      message.error(error?.data?.message);
    }
  }, [data, error, isSuccess, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarContent = useMemo(
    () => (
      <>
        <div className="app-sider__brand">
          <img
            src={collapsed && !isMobile ? "/favicon.png" : "/logo.png"}
            alt="NURAIDA HRIS"
            className="app-sider__logo"
          />
        </div>

        <div className="app-sider__body">
          <div className="app-sider__nav">
            {(!collapsed || isMobile) && (
              <div className="app-sider__nav-label">Navigasi</div>
            )}
            <Menu
              items={navItems}
              selectedKeys={[location.pathname]}
              onClick={handleMenuClick}
              mode="inline"
              theme="light"
              inlineCollapsed={collapsed && !isMobile}
              className="app-menu"
            />
          </div>

          <div className="app-sider__footer">
            <Menu
              items={[logoutItem]}
              onClick={handleMenuClick}
              mode="inline"
              theme="light"
              inlineCollapsed={collapsed && !isMobile}
              className="app-menu app-menu--logout"
              selectable={false}
            />
          </div>
        </div>
      </>
    ),
    [collapsed, isMobile, location.pathname, navItems]
  );

  return (
    <ConfigProvider theme={theme}>
      <Layout className="app-layout">
        <title>{headerTitle}</title>

        {!isMobile && (
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={SIDER_WIDTH}
            collapsedWidth={SIDER_COLLAPSED_WIDTH}
            className="app-sider"
          >
            {sidebarContent}
          </Sider>
        )}

        {isMobile && (
          <Drawer
            placement="left"
            title="NURAIDA HRIS"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            width={SIDER_WIDTH}
            className="app-drawer"
            styles={{ body: { padding: 0 } }}
          >
            {sidebarContent}
          </Drawer>
        )}

        <Layout
          className="app-main"
          style={{ marginLeft: isMobile ? 0 : siderWidth }}
        >
          <Header
            className="app-header"
            style={{ left: isMobile ? 0 : siderWidth }}
          >
            <div className="app-header__left">
              <Button
                type="text"
                className="app-header__toggle"
                icon={
                  isMobile ? (
                    <MenuOutlined />
                  ) : collapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={() =>
                  isMobile
                    ? setDrawerVisible(!drawerVisible)
                    : handleCollapsedChange(!collapsed)
                }
                aria-label={isMobile ? "Buka menu" : "Toggle sidebar"}
              />

              <div className="app-header__title-wrap">
                <Title level={4} className="app-header__title">
                  {headerTitle}
                </Title>
                <span className="app-header__subtitle">{headerSubtitle}</span>
              </div>
            </div>

            <div className="app-header__user" title={displayName}>
              <Avatar className="app-header__avatar" size={36}>
                {getInitials(displayName)}
              </Avatar>
              <div className="app-header__user-info">
                <span className="app-header__user-name">{displayName}</span>
                <span className="app-header__user-role">{roleLabel}</span>
              </div>
            </div>
          </Header>

          <Content className="app-content">
            <Suspense
              fallback={
                <LoadingScreen
                  message="Memuat konten..."
                  subMessage="Menyiapkan data halaman"
                  fullScreen={false}
                />
              }
            >
              {children}
            </Suspense>
          </Content>

          <Footer className="app-footer">
            &copy; {new Date().getFullYear()} NURAIDA Islamic Boarding School
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
