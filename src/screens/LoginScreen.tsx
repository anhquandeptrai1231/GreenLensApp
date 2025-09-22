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
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { useNavigation } from "@react-navigation/native";

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
      isEmailConfirmed?: boolean; // backend có gửi trường này
    };
  };
}

type LoginScreenProps = {
  onLoginSuccess: () => void;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 1. Check email & password không được trống
    if (!username.trim()) {
      Alert.alert("Lỗi", "Email không được để trống");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Lỗi", "Mật khẩu không được để trống");
      return;
    }

    // 2. Validate mật khẩu client-side
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Lỗi mật khẩu",
        "Mật khẩu phải có ít nhất 8 ký tự, 1 chữ in hoa và 1 ký tự đặc biệt"
      );
      return;
    }

    try {
      setLoading(true);

      const payload = { email: username.trim(), password: password.trim() };
      console.log("Payload gửi đi:", payload);

      const response = await axios.post<LoginResponse>(API_URL, payload);

      if (response.data.succeeded) {
        const { accessToken, refreshToken, user } = response.data.data;

        // 3. Kiểm tra email đã xác thực chưa
        if (user.isEmailConfirmed === false) {
          Alert.alert(
            "Lỗi",
            "Tài khoản chưa xác thực email. Vui lòng kiểm tra email để xác thực"
          );
          return;
        }

        // 4. Lưu token vào AsyncStorage
        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        Alert.alert("Thành công", `Xin chào ${user.username}`);
        onLoginSuccess();
      } else {
        // 5. Show message từ server nếu login thất bại
        Alert.alert(
          "Đăng nhập thất bại",
          response.data.message || "Tài khoản hoặc mật khẩu không đúng"
        );
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      if (err.response) {
        const data = err.response.data;
        console.log("API error:", data);

        if (data?.message) {
          Alert.alert("Đăng nhập thất bại", data.message);
        } else if (data?.errors) {
          const errorMessages = Object.values(data.errors).flat().join("\n");
          Alert.alert("Lỗi", errorMessages);
        } else {
          Alert.alert("Lỗi", `Server trả về ${err.response.status}`);
        }
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

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
      </TouchableOpacity>

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
