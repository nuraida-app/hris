import React, { useEffect } from "react";
import { Form, Input, Button, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoadUserQuery, useLoginMutation } from "../../service/auth/ApiAuth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAuthenticated } from "../../utils/auth";

// --- KONFIGURASI WARNA DARI LOGO ---
const colors = {
  primary: "#6A2E6F", // Ungu Tua (NURAIDA)
  lightPurple: "#8E5F92", // Ungu lebih terang untuk gradasi
  softPurple: "#B28FB5", // Ungu lembut untuk gradasi
  textWhite: "#ffffff",
  textLightGray: "#f0f0f0", // Untuk placeholder dan teks ringan
};

// Styles
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.lightPurple} 100%)`,
};

const formContainerStyle = {
  padding: "40px",
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(5px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "15px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
  width: "400px",
  maxWidth: "90%",
};

const Login = () => {
  const navigate = useNavigate();

  // Ambil user dari global state (UserSlice)
  const { user } = useSelector((state) => state.user);

  // Login Mutation
  const [login, { isLoading, isSuccess, error }] = useLoginMutation();

  // Load User Query
  // Logic: Query ini akan di-skip (tidak jalan) SELAMA login belum sukses (!isSuccess).
  // Begitu login sukses, skip jadi false, dan query loadUser otomatis jalan.
  useLoadUserQuery(undefined, {
    skip: !isSuccess,
  });

  const onFinish = (values) => {
    login(values);
  };

  // Effect: Menangani notifikasi Login
  useEffect(() => {
    if (isSuccess) {
      message.success("Login Berhasil!");
    }
    if (error) {
      message.error(error?.data?.message || "Terjadi kesalahan saat login");
    }
  }, [isSuccess, error]);

  // Effect: Redirect setelah User Data masuk ke Redux
  useEffect(() => {
    // Cek apakah user sudah ada di state dan token valid
    if (user && isAuthenticated()) {
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <Form
          name="normal_login"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
        >
          <img
            src="/logo.png"
            alt="logo"
            width={"100%"}
            style={{
              marginBottom: 24,
              maxWidth: "250px",
              display: "block",
              margin: "0 auto 24px auto",
            }}
          />

          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please input your Username!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              size="large"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "transparent",
                color: colors.primary,
              }}
              className="login-input-icon"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your Password!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
              size="large"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "transparent",
                color: colors.primary,
              }}
              className="login-input-icon"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: colors.textLightGray }}>
                Remember me
              </Checkbox>
            </Form.Item>
            <a
              href="#forgot"
              style={{ float: "right", color: colors.textLightGray }}
            >
              Lupa Password
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              size="large"
              style={{
                backgroundColor: colors.primary,
                borderColor: colors.primary,
                marginTop: "10px",
              }}
            >
              Masuk
            </Button>
          </Form.Item>
        </Form>
      </div>
      <style>
        {`
          .login-input-icon .anticon {
            color: ${colors.primary} !important;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
