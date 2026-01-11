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
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Register</Text>

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
        onPress={pickImage}
        style={{ borderWidth: 1, padding: 12, borderRadius: 10 }}
      >
        <Text>{image ? "Change Image" : "Pick Profile Image"}</Text>
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
          backgroundColor: "black",
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


