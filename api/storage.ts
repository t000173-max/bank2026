import * as SecureStore from "expo-secure-store";

const KEY = "token";

export const setToken = async (token: string) => {
  await SecureStore.setItemAsync(KEY, token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync(KEY);
};

export const deleteToken = async () => {
  await SecureStore.deleteItemAsync(KEY);
};
