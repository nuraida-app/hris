import { Spin, Typography } from "antd";
import "./LoadingScreen.css";

const { Text } = Typography;

const LoadingScreen = ({
  message = "Memuat halaman...",
  subMessage = "Mohon tunggu sebentar",
  fullScreen = true,
}) => {
  return (
    <div
      className={`loading-screen ${
        fullScreen ? "loading-screen--fullscreen" : "loading-screen--embedded"
      }`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <img
        src={fullScreen ? "/logo.png" : "/favicon.png"}
        alt="NURAIDA HRIS"
        className="loading-screen__logo"
      />
      <Spin size="large" className="loading-screen__spinner" />
      <Text className="loading-screen__text">{message}</Text>
      {subMessage && (
        <Text className="loading-screen__subtext">{subMessage}</Text>
      )}
    </div>
  );
};

export default LoadingScreen;
