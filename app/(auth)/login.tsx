import { setToken } from "@/api/storage";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { loginApi } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { saveToken } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
        return await loginApi({ username, password });
    },
    onSuccess: async (data: any) => {
        // console.log(data.data.token)
      await setToken(data.data.token)
      router.replace("/(tabs)/home");
    },
    onError: (err) =>{
         alert("Wrong credentials")
         console.log(err)
        },
  });

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 10, backgroundColor: "#FFFACD" }}>
      <Text style={{ fontSize: 32, fontWeight: "700", marginBottom: 8 }}>Login</Text>
      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>Welcome back</Text>

      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#FFFFFF", 
        borderWidth: 1, 
        borderColor: "#E0E0E0", 
        borderRadius: 16, 
        paddingHorizontal: 12, 
        marginBottom: 12 
      }}>
        <Ionicons name="person-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={{ flex: 1, padding: 12, fontSize: 16 }}
        />
      </View>

      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#FFFFFF", 
        borderWidth: 1, 
        borderColor: "#E0E0E0", 
        borderRadius: 16, 
        paddingHorizontal: 12, 
        marginBottom: 12 
      }}>
        <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ flex: 1, padding: 12, fontSize: 16 }}
        />
      </View>

      <TouchableOpacity
        onPress={() => mutate()}
        disabled={isPending}
        style={{
          backgroundColor: "black",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>{isPending ? "Loading..." : "Login"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text>No account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

