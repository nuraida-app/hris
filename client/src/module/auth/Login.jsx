import React, { useEffect } from "react";
import {
  ConfigProvider,
  Form,
  Input,
  Button,
  Checkbox,
  message,
  Typography,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginMutation } from "../../service/auth/ApiAuth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getDefaultRoute } from "../../utils/auth";
import "./Login.css";

const { Title, Text } = Typography;

const theme = {
  token: {
    colorPrimary: "#6A2E6F",
    borderRadius: 12,
    controlHeightLG: 48,
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [login, { isLoading, reset }] = useLoginMutation();

  const onFinish = async (values) => {
    reset();
    try {
      const result = await login(values).unwrap();
      message.success("Login berhasil!");
      navigate(getDefaultRoute(result.role), { replace: true });
    } catch (err) {
      message.error(err?.data?.message || "Terjadi kesalahan saat login");
    }
  };

  useEffect(() => {
    if (user) {
      navigate(getDefaultRoute(user.role), { replace: true });
    }
  }, [user, navigate]);

  return (
    <ConfigProvider theme={theme}>
      <div className='login-page'>
        <div className='login-page__bg' aria-hidden='true'>
          <div className='login-page__orb login-page__orb--1' />
          <div className='login-page__orb login-page__orb--2' />
          <div className='login-page__orb login-page__orb--3' />
        </div>

        <div className='login-card'>
          <div className='login-card__header'>
            <Title level={3} className='login-card__title'>
              Selamat Datang
            </Title>
            <Text className='login-card__subtitle'>
              Masuk ke sistem HRIS untuk melanjutkan
            </Text>
          </div>

          <Form
            name='login'
            className='login-form'
            layout='vertical'
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name='username'
              label={
                <span style={{ color: "rgba(255,255,255,0.9)" }}>Username</span>
              }
              rules={[{ required: true, message: "Masukkan username" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder='Masukkan username Anda'
                size='large'
                autoComplete='username'
              />
            </Form.Item>

            <Form.Item
              name='password'
              label={
                <span style={{ color: "rgba(255,255,255,0.9)" }}>Password</span>
              }
              rules={[{ required: true, message: "Masukkan password" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder='Masukkan password Anda'
                size='large'
                autoComplete='current-password'
              />
            </Form.Item>

            <Form.Item className='login-form__options'>
              <Form.Item name='remember' valuePropName='checked' noStyle>
                <Checkbox className='login-form__remember'>Ingat saya</Checkbox>
              </Form.Item>
              <a
                className='login-form__forgot'
                href='#forgot'
                onClick={(e) => e.preventDefault()}
              >
                Lupa Password
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type='primary'
                htmlType='submit'
                block
                loading={isLoading}
                size='large'
                className='login-form__submit'
              >
                Masuk
              </Button>
            </Form.Item>
          </Form>

          <div className='login-card__footer'>
            <Text className='login-card__footer-text'>
              SMP - SMA NURAIDA Islamic Boarding School
            </Text>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default Login;
