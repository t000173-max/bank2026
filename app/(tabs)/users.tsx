import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Image, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { meApi } from "../../api/auth";
import { getUsersApi, transferMoneyApi } from "../../api/users";

const MoneyLoader = ({ size = 24, color = "#007AFF" }: { size?: number; color?: string }) => {
  const colorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [currentColor, setCurrentColor] = useState("#007AFF");

  useEffect(() => {
    // Animation لتغيير اللون
    const colorAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    // Animation للحركة (scale)
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    // الألوان التي سيتغير بينها
    const colors = ["#007AFF", "#4CAF50", "#FF9500", "#FF3B30", "#5856D6"];
    
    const listener = colorAnim.addListener(({ value }) => {
      const index = Math.floor(value * (colors.length - 1));
      const nextIndex = Math.min(index + 1, colors.length - 1);
      const progress = (value * (colors.length - 1)) % 1;
      
      // Interpolate between two colors
      const color1 = colors[index];
      const color2 = colors[nextIndex];
      
      // Simple color interpolation
      const r1 = parseInt(color1.slice(1, 3), 16);
      const g1 = parseInt(color1.slice(3, 5), 16);
      const b1 = parseInt(color1.slice(5, 7), 16);
      
      const r2 = parseInt(color2.slice(1, 3), 16);
      const g2 = parseInt(color2.slice(3, 5), 16);
      const b2 = parseInt(color2.slice(5, 7), 16);
      
      const r = Math.round(r1 + (r2 - r1) * progress);
      const g = Math.round(g1 + (g2 - g1) * progress);
      const b = Math.round(b1 + (b2 - b1) * progress);
      
      setCurrentColor(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
    });

    colorAnimation.start();
    scaleAnimation.start();

    return () => {
      colorAnimation.stop();
      scaleAnimation.stop();
      colorAnim.removeListener(listener);
    };
  }, []);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Ionicons 
        name="cash" 
        size={size} 
        color={currentColor}
      />
    </Animated.View>
  );
};

type User = {
  id: string;
  username: string;
  imagePath?: string;
  balance?: number;
};

const UserCard = ({ user, onPress, onTransferPress }: { user: User; onPress: () => void; onTransferPress: () => void }) => {
  const imageUrl = user.imagePath
    ? `https://bank-app-be-eapi-btf5b.ondigitalocean.app/${user.imagePath}`
    : null;
  
  const balanceNum = Number(user?.balance ?? 0);
  const isVIP = balanceNum > 10000;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 12, alignSelf: "center" }} />
        ) : (
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0f0f0", marginBottom: 12, alignSelf: "center" }} />
        )}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>{user.username}</Text>
          {isVIP && (
            <Text style={{ fontSize: 18, marginLeft: 6 }}>⭐</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={(e) => {
          e.stopPropagation();
          onTransferPress();
        }}
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Transfer Money</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ProfileModal = ({
  visible,
  onClose,
  user,
  onTransferPress,
}: {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onTransferPress: () => void;
}) => {
  const imageUrl = user?.imagePath
    ? `https://bank-app-be-eapi-btf5b.ondigitalocean.app/${user.imagePath}`
    : null;
  
  const balanceNum = Number(user?.balance ?? 0);
  const isVIP = balanceNum > 10000;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#fff",
            borderRadius: 20,
            padding: 32,
            width: "100%",
            maxWidth: 350,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                marginBottom: 20,
                borderWidth: 3,
                borderColor: "#007AFF",
              }}
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#f0f0f0",
                marginBottom: 20,
                borderWidth: 3,
                borderColor: "#007AFF",
              }}
            />
          )}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 8, textAlign: "center" }}>
              {user?.username}
            </Text>
            {isVIP && (
              <Text style={{ fontSize: 22, marginLeft: 8, marginBottom: 8 }}>⭐</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 24, width: "100%" }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onClose();
                onTransferPress();
              }}
              style={{
                flex: 1,
                backgroundColor: "#007AFF",
                padding: 14,
                borderRadius: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const TransferModal = ({
  visible,
  onClose,
  recipient,
  onTransfer,
  isLoading,
}: {
  visible: boolean;
  onClose: () => void;
  recipient: User | null;
  onTransfer: (amount: number) => void;
  isLoading: boolean;
}) => {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    // إعادة تعيين المبلغ عند إغلاق المودال أو تغيير المستلم
    if (!visible) {
      setAmount("");
    }
  }, [visible]);

  const handleIncrease = (value: number) => {
    const currentAmount = parseFloat(amount) || 0;
    setAmount((currentAmount + value).toString());
  };

  const handleTransfer = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && recipient) {
      onTransfer(numAmount);
      setAmount("");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8, textAlign: "left" }}>
            Send Money to {recipient?.username}
          </Text>

          <Text style={{ fontSize: 16, color: "#666", marginBottom: 16, textAlign: "left" }}>Amount</Text>

          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              marginBottom: 16,
              textAlign: "left",
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, justifyContent: "center" }}>
            <TouchableOpacity
              onPress={() => handleIncrease(10)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(50)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleIncrease(100)}
              style={{ backgroundColor: "#f0f0f0", padding: 10, borderRadius: 8, minWidth: 60, alignItems: "center" }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>+100</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTransfer}
              style={{
                flex: 1,
                backgroundColor: "#007AFF",
                padding: 14,
                borderRadius: 8,
                alignItems: "center",
              }}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <MoneyLoader size={20} color="white" />
              ) : (
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: usersData, isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });

  const { data: userData, refetch: refetchMe } = useQuery({
    queryKey: ["me"],
    queryFn: meApi
  });

  const currentUser = userData?.data ?? userData;
  const currentUsername = currentUser?.username ?? "Unknown";

  const transferMutation = useMutation({
    mutationFn: transferMoneyApi,
    onSuccess: () => {
      // تحديث جميع البيانات بعد التحويل الناجح
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      Alert.alert("Success", "Money sent successfully");
    },
    onError: (error: any) => {
      // إظهار رسالة خطأ للمستخدم
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while sending the money";
      console.error("Transfer error:", error);
      Alert.alert("Error", errorMessage);
    },
  });

  const handleUserPress = (user: User) => {
    setViewedUser(user);
    setProfileModalVisible(true);
  };

  const handleTransferPress = (user: User) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleTransfer = (amount: number) => {
    if (selectedUser && amount > 0) {
      const recipientId = selectedUser.id;
      
      // التحقق من صحة البيانات
      if (!recipientId) {
        Alert.alert("Error", "User not found");
        return;
      }
      
      if (isNaN(amount) || amount <= 0) {
        Alert.alert("Error", "Invalid amount");
        return;
      }
      
      console.log("Sending transfer:", { recipientId, amount });
      
      // إغلاق المودال فوراً عند بدء الإرسال
      setModalVisible(false);
      setSelectedUser(null);
      
      transferMutation.mutate({
        toUserId: recipientId,
        amount: Number(amount),
      });
    }
  };

  const users: User[] = usersData?.data ?? usersData ?? [];
  
  // تسجيل بيانات المستخدمين للتحقق
  if (users.length > 0) {
    console.log("Users data sample:", users[0]);
  }

  // تصفية المستخدمين بناءً على البحث
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUsers(),
        refetchMe(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 100, backgroundColor: "#FFFACD" }}>
      <View style={{ alignItems: "center", marginTop: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: "600" }}>{currentUsername}</Text>
          <Text style={{ fontSize: 28, fontWeight: "600" }}>friends</Text>
        </View>
      </View>

      <View style={{ marginBottom: 16 }}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="find your buddy"
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 8,
            padding: 12,
            fontSize: 16,
            textAlign: "left",
          }}
          placeholderTextColor="#999"
        />
      </View>

      {usersLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <MoneyLoader size={40} />
        </View>
      ) : usersError ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "red" }}>Error loading users</Text>
        </View>
      ) : filteredUsers.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#666" }}>
            {searchQuery ? "لم يتم العثور على مستخدمين" : "No users found"}
          </Text>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onPress={() => handleUserPress(user)}
              onTransferPress={() => handleTransferPress(user)}
            />
          ))}
        </ScrollView>
      )}

      <ProfileModal
        visible={profileModalVisible}
        onClose={() => {
          setProfileModalVisible(false);
          setViewedUser(null);
        }}
        user={viewedUser}
        onTransferPress={() => {
          if (viewedUser) {
            handleTransferPress(viewedUser);
          }
        }}
      />

      <TransferModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedUser(null);
        }}
        recipient={selectedUser}
        onTransfer={handleTransfer}
        isLoading={transferMutation.isPending}
      />
    </View>
  );
}
