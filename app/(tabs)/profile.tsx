import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import { meApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const formatBalance = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

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
        <ActivityIndicator />
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
  const image = user?.image ?? user?.profileImage ?? null;
  const balanceNum = Number(user?.balance ?? 0);

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", alignItems: "center", gap: 12 }}>
      {image ? (
        <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 60 }} />
      ) : (
        <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 1 }} />
      )}

      <Text style={{ fontSize: 22, fontWeight: "600" }}>{username}</Text>
      <Text style={{ fontSize: 18 }}>{formatBalance(balanceNum)}</Text>

      <TouchableOpacity
        onPress={async () => {
          await logout();
          router.replace("/(auth)/login");
        }}
        style={{ backgroundColor: "black", padding: 12, borderRadius: 10, marginTop: 10 }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
