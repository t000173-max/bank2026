import { deleteToken } from "@/api/storage";
import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {

  return (
    <View style={{ padding: 16,paddingTop: 100, gap:12, alignItems: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>friends</Text>
      <Text>who do you want to spend time with</Text>

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
