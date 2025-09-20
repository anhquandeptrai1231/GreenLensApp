import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios, { AxiosError } from "axios";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";

// URL API (nên tách riêng file config sau này)
const API_URL = "http://10.0.2.2:5101/api/Auth/login";

interface LoginResponse {
  succeeded: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      username: string;
    };
  };
}

const LoginScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<LoginResponse>(API_URL, {
        email: username, // backend yêu cầu email
        password,
      });

      console.log("✅ Response:", response.data);

      if (response.data.succeeded) {
        const { accessToken, refreshToken, user } = response.data.data;
        Alert.alert("Thành công", `Xin chào ${user.username}`);
        console.log("Access Token:", accessToken);
        // 👉 có thể lưu token vào AsyncStorage hoặc Redux ở đây
      } else {
        Alert.alert(
          "Đăng nhập thất bại",
          response.data.message || "Sai thông tin đăng nhập"
        );
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      console.error("❌ Lỗi gọi API:", err);

      if (err.response) {
        console.log("📡 Response error:", err.response.data);
        Alert.alert(
          "Lỗi",
          `Server trả về ${err.response.status}: ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        console.log("📡 Request error:", err.request);
        Alert.alert(
          "Lỗi mạng",
          "Không thể kết nối tới server. Kiểm tra IP/Port hoặc cleartextTraffic."
        );
      } else {
        Alert.alert("Lỗi", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>
      )}

      {/* Link sang Register */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>

      {/* Link sang ForgotPassword */}
      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={[styles.link, { color: "red" }]}>Quên mật khẩu?</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "blue",
  },
});
