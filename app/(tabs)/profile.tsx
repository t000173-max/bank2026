import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { meApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

const formatBalance = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const BalanceCard = ({ balance }: { balance: number }) => {
  return (
    <View style={{
      backgroundColor: "#f0f0f0",
      padding: 20,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>الرصيد</Text>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#000" }}>{formatBalance(balance)}</Text>
    </View>
  );
};

type Transaction = {
  id: string;
  type: "sent" | "received";
  amount: number;
  username: string;
  date: string;
};

const TransactionsHistory = ({ transactions }: { transactions: Transaction[] }) => {
  if (transactions.length === 0) {
    return (
      <View style={{
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        width: "100%",
        marginTop: 20,
        alignItems: "center"
      }}>
        <Text style={{ fontSize: 14, color: "#999" }}>لا توجد معاملات</Text>
      </View>
    );
  }

  return (
    <View style={{
      backgroundColor: "#fff",
      padding: 16,
      borderRadius: 12,
      width: "100%",
      marginTop: 20,
      maxHeight: 300
    }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16, textAlign: "right" }}>سجل معاملاتي</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {transactions.map((transaction) => (
          <View
            key={transaction.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0"
            }}
          >
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                {transaction.type === "sent" ? "إرسال إلى" : "استلام من"}
              </Text>
              <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{transaction.username}</Text>
              <Text style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{transaction.date}</Text>
            </View>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: transaction.type === "sent" ? "#FF3B30" : "#34C759",
                marginLeft: 16
              }}
            >
              {transaction.type === "sent" ? "-" : "+"}{formatBalance(transaction.amount)}
            </Text>
          </View>
        ))}
      </ScrollView>
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
  const image = user?.imagePath;
  const balanceNum = Number(user?.balance ?? 0);

  // بيانات تجريبية للمعاملات الخاصة بالمستخدم الحالي فقط - يمكن استبدالها بـ API لاحقاً
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "sent",
      amount: 50,
      username: "أحمد",
      date: "2024-01-15"
    },
    {
      id: "2",
      type: "received",
      amount: 100,
      username: "محمد",
      date: "2024-01-14"
    },
    {
      id: "3",
      type: "sent",
      amount: 25,
      username: "فاطمة",
      date: "2024-01-13"
    }
  ];

//   console.log(image)

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#FFFACD" }}>
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

        <Text style={{ fontSize: 22, fontWeight: "600", marginTop: 20 }}>{username}</Text>
        
        <BalanceCard balance={balanceNum} />
        
        <TransactionsHistory transactions={mockTransactions} />
      </View>

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
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>إرسال المال</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
