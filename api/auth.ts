import api from "./index";

export const registerApi = (data: {
  username: string;
  password: string;
  image?: string;
}) => {
    const formData = new FormData
    formData.append("username", data.username)
    formData.append("password", data.password)

    if(data.image){
        formData.append("image", {
            uri: data.image,
            name: "profile.jpg",
            type: "image/jpeg"
        } as any)
    }

    api.post("/api/auth/register", data, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const loginApi = async (data: { username: string; password: string }) =>{
    console.log(data)
  const res = await api.post("/api/auth/login", data);
//   console.log(res)
  return res.data
}

export const meApi = async () => {
    console.log("HERE")
    const res = await api.get("/api/auth/me")
    console.log("HERE")
    console.log(res)
    return res.data
}
