import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { registerApi } from "../../api/auth";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<string>("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async () =>{ 
        const imageUri = image ? image : "test"
        return await registerApi({ username, password, image: image })
    },
    onSuccess: () => router.replace("/(auth)/login"),
    onError: () => alert("Registration failed"),
  });

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 10, backgroundColor: "#FFFACD" }}>
      <Text style={{ fontSize: 32, fontWeight: "700", marginBottom: 8 }}>Register</Text>
      <Text style={{ fontSize: 16, color: "#666", marginBottom: 24 }}>Create your account</Text>

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
        onPress={pickImage}
        style={{ 
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF", 
          borderWidth: 1, 
          borderColor: "#E0E0E0", 
          borderRadius: 16, 
          padding: 12,
          marginBottom: 12
        }}
      >
        <Ionicons name="image-outline" size={20} color="#666" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16 }}>{image ? "Change Image" : "Pick Profile Image"}</Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 110, height: 110, borderRadius: 55 }}
        />
      )}

      <TouchableOpacity
        onPress={() => mutate()}
        disabled={isPending}
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white" }}>{isPending ? "Loading..." : "Register"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
        <Text>Have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}


