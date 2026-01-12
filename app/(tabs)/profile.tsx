import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { meApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

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

const formatBalance = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const BalanceCard = ({ balance }: { balance: number }) => {
  return (
    <View style={{
      backgroundColor: "#FFFEF0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>Available Balance</Text>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#000" }}>{formatBalance(balance)}</Text>
    </View>
  );
};

const AccountTypeCard = ({ balance }: { balance: number }) => {
  const getAccountType = (balance: number): { type: string; color: string; bgColor: string } => {
    if (balance > 10000) {
      return { type: "VIP", color: "#FFD700", bgColor: "#FFFEF0" };
    } else if (balance > 5000) {
      return { type: "Premium", color: "#C0C0C0", bgColor: "#FFFEF0" };
    } else {
      return { type: "Standard", color: "#4682B4", bgColor: "#FFFEF0" };
    }
  };

  const accountInfo = getAccountType(balance);

  return (
    <View style={{
      backgroundColor: accountInfo.bgColor,
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      alignItems: "center",
      borderWidth: 2,
      borderColor: accountInfo.color
    }}>
      <Text style={{ fontSize: 24, fontWeight: "700", color: accountInfo.color }}>
        {accountInfo.type}
      </Text>
    </View>
  );
};

const AccountTypeInfo = () => {
  return (
    <View style={{
      backgroundColor: "#fff",
      padding: 16,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
    }}>
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, textAlign: "left" }}>
        How to Get Your VIP
      </Text>
      
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#4682B4", marginRight: 8 }} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#4682B4" }}>Standard</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "left", paddingLeft: 20 }}>
          Balance less than $5,000
        </Text>
      </View>

      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#C0C0C0", marginRight: 8 }} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#C0C0C0" }}>Premium</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "left", paddingLeft: 20 }}>
          Balance more than $5,000
        </Text>
      </View>

      <View>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#FFD700", marginRight: 8 }} />
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFD700" }}>VIP</Text>
        </View>
        <Text style={{ fontSize: 12, color: "#666", marginTop: 4, textAlign: "left", paddingLeft: 20 }}>
          Balance more than $10,000
        </Text>
      </View>
    </View>
  );
};

export default function Profile() {
  const { logout } = useAuth();
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: meApi
  });

  console.log(data)

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <MoneyLoader size={40} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
        <Text>Error loading profile</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const user = data?.data ?? data; // حسب شكل الريسبونس
  const username = user?.username ?? "Unknown";
  const image = user?.imagePath;
  const balanceNum = Number(user?.balance ?? 0);
  const isVIP = balanceNum > 10000;

//   console.log(image)

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFACD" }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace("/(auth)/login");
          }}
          style={{ backgroundColor: "red", padding: 13, borderRadius: 30, alignSelf: "flex-start", marginTop: 60 }}
        >
          <Text style={{ color: "white" }}>Logout</Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", marginTop: 40 }}>
          {image ? (
            <Image source={{ uri: `https://bank-app-be-eapi-btf5b.ondigitalocean.app/${image}` }} style={{ width: 120, height: 120, borderRadius: 60 }} />
          ) : (
            <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1 }} />
          )}

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 22, fontWeight: "600" }}>{username}</Text>
            {isVIP && (
              <Text style={{ fontSize: 18, marginLeft: 6 }}>⭐</Text>
            )}
          </View>
          
          <BalanceCard balance={balanceNum} />
          
          <AccountTypeCard balance={balanceNum} />
          
          <AccountTypeInfo />
        </View>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 10, left: 0, right: 0, paddingHorizontal: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/users")}
          style={{
            backgroundColor: "#007AFF",
            padding: 16,
            borderRadius: 12,
            width: "100%",
            alignItems: "center"
          }}
        >
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Send Money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
