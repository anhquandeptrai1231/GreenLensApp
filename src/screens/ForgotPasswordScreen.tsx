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

// 👉 API URL (chỉnh port theo backend của bạn)
const API_URL = "http://10.0.2.2:5101/api/Auth/forgot-password";

interface ForgotPasswordResponse {
  succeeded: boolean;
  message: string;
}

const ForgotPasswordScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post<ForgotPasswordResponse>(API_URL, {
        email,
      });

      console.log("✅ Forgot Password Response:", response.data);

      if (response.data.succeeded) {
        Alert.alert(
          "Thành công",
          "Hệ thống đã gửi email khôi phục mật khẩu. Vui lòng kiểm tra hộp thư!"
        );
        navigation.navigate("Login");
      } else {
        Alert.alert(
          "Thất bại",
          response.data.message || "Không thể gửi yêu cầu khôi phục mật khẩu"
        );
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      console.error("❌ Lỗi gọi API:", err);

      if (err.response) {
        Alert.alert(
          "Lỗi",
          `Server trả về ${err.response.status}: ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        Alert.alert("Lỗi mạng", "Không thể kết nối tới server.");
      } else {
        Alert.alert("Lỗi", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
          <Text style={styles.buttonText}>Gửi yêu cầu</Text>
        </TouchableOpacity>
      )}

      {/* Quay lại Login */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Quay lại đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ForgotPasswordScreen;

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
    backgroundColor: "#ff9800",
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
