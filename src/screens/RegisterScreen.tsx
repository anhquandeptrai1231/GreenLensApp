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
import { Picker } from "@react-native-picker/picker";

// URL API
const API_URL = "http://10.0.2.2:5101/api/Auth/register";

interface RegisterResponse {
  succeeded: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
}

// ✅ Hiển thị nguyên văn lỗi từ API
const formatErrors = (errors: string[]) => {
  if (!errors || errors.length === 0) return "";
  if (errors.length === 1) return errors[0];
  return errors.slice(0, -1).join(", ") + " và " + errors.slice(-1);
};

const RegisterScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [roleId, setRoleId] = useState<number>(2); // mặc định user
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string>(""); // ✅ lỗi chung (message)

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setGeneralError("");

      const response = await axios.post<RegisterResponse>(API_URL, {
        email,
        username,
        password,
        roleId,
      });

      if (response.data.succeeded) {
        Alert.alert("Thành công", "Tạo tài khoản thành công! Vui lòng check email để xác thực tài khoản.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ]);
      } else {
        if (response.data.errors) {
          setErrors(response.data.errors);
        } else if (response.data.message) {
          setGeneralError(response.data.message); // ✅ lỗi chung
        }
      }
    } catch (error) {
      const err = error as AxiosError<any>;

      if (err.response) {
        const apiErrors = err.response.data?.errors;
        const apiMessage = err.response.data?.message;

        if (apiErrors) {
          setErrors(apiErrors);
        } else if (apiMessage) {
          setGeneralError(apiMessage); // ✅ lỗi chung khi không có errors
        } else {
          Alert.alert("Lỗi", "Đăng ký thất bại, vui lòng thử lại.");
        }
      } else if (err.request) {
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
      <Text style={styles.title}>Đăng ký</Text>

      {/* ✅ Hiển thị lỗi chung (message từ API) */}
      {generalError ? <Text style={styles.error}>{generalError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.error}>{formatErrors(errors.email)}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      {errors.username && (
        <Text style={styles.error}>{formatErrors(errors.username)}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password && (
        <Text style={styles.error}>{formatErrors(errors.password)}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Xác nhận mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errors.confirmPassword && (
        <Text style={styles.error}>{formatErrors(errors.confirmPassword)}</Text>
      )}

      {/* Dropdown chọn role */}
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={roleId} onValueChange={(value) => setRoleId(value)}>
          <Picker.Item label="Người dùng" value={2} />
          <Picker.Item label="Nhà vườn" value={3} />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      )}

      {/* Quay lại Login */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;

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
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#28a745",
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
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
