import { setToken } from "@/api/storage";
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
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Login</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      />

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

