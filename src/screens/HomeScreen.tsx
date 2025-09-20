import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/Ionicons";

type HomeScreenProps = {
  onLogout: () => void;
};

const plants = [
  { id: "1", name: "Dracaena Fragrans", image: "https://i.ibb.co/sV8Lq84/plant1.png" },
  { id: "2", name: "Monstera Deliciosa", image: "https://i.ibb.co/9vD3rGw/plant2.png" },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    onLogout();
  };

  const renderPlant = ({ item }: any) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.plantImage} />
      <Text style={styles.plantName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Green Lens</Text>
        <View style={styles.headerIcons}>
          <Icon name="person-circle-outline" size={26} color="#fff" style={styles.icon} />
          <Icon name="notifications-outline" size={24} color="#fff" style={styles.icon} />
          <Icon name="cart-outline" size={24} color="#fff" style={styles.icon} />

          {/* Logout */}
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="power-outline" size={24} color="#fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Icon name="search-outline" size={20} color="#555" />
        <TextInput placeholder="Search..." style={styles.searchInput} />
        <Icon name="options-outline" size={20} color="#555" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.activeTab]}>ALL</Text>
        <Text style={styles.tab}>SHOPPING</Text>
        <Text style={styles.tab}>CHAT</Text>
      </View>

      {/* Plant Grid */}
      <FlatList
        data={plants}
        renderItem={renderPlant}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <Icon name="settings-outline" size={24} color="#fff" />
        <Icon name="scan-outline" size={28} color="#fff" />
        <Icon name="person-outline" size={24} color="#fff" />
      </View>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E4F0E2" },
  header: {
    backgroundColor: "#2E6B3E",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  logo: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  headerIcons: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 10 },

  searchBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    margin: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  searchInput: { flex: 1, padding: 8 },

  tabs: { flexDirection: "row", justifyContent: "space-around", marginVertical: 5 },
  tab: { fontSize: 14, color: "#555" },
  activeTab: { fontWeight: "bold", color: "#2E6B3E" },

  grid: { padding: 10 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 5,
    alignItems: "center",
    padding: 10,
  },
  plantImage: { width: 80, height: 100, resizeMode: "contain" },
  plantName: { marginTop: 5, fontSize: 12, color: "#333" },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#2E6B3E",
    paddingVertical: 10,
  },
});
