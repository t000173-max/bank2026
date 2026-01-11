import { deleteToken } from "@/api/storage";
import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "600" }}>Home</Text>
      <Text>You are logged in.</Text>

      <Button
        title="Logout"
        onPress={async () => {
          await deleteToken();
          router.replace("/(auth)/login");
        }}
      />
    </View>
  );
}
