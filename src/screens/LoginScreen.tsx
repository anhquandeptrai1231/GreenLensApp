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
    if (!username || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<LoginResponse>(API_URL, {
        email: username,
        password,
      });

      if (response.data.succeeded) {
        const { accessToken, refreshToken, user } = response.data.data;

        await AsyncStorage.setItem("accessToken", accessToken);
        await AsyncStorage.setItem("refreshToken", refreshToken);

        Alert.alert("Thành công", `Xin chào ${user.username}`);

        onLoginSuccess(); // 👉 báo về App
      } else {
        // Nếu backend trả về succeeded=false
        Alert.alert("Đăng nhập thất bại", "Tài khoản hoặc mật khẩu không đúng");
      }
    } catch (error) {
      const err = error as AxiosError<any>;
      if (err.response) {
        if (err.response.status === 401) {
          // Nếu server trả về Unauthorized
          Alert.alert("Đăng nhập thất bại", "Tài khoản hoặc mật khẩu không đúng");
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
  container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15 },
  button: { backgroundColor: "#007BFF", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  link: { marginTop: 15, textAlign: "center", color: "blue" },
});