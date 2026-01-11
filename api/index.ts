import axios from "axios";
import { getToken } from "./storage";

export const baseURL = "https://bank-app-be-eapi-btf5b.ondigitalocean.app";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
    const token = await getToken()
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api;
