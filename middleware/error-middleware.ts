import Toast from "react-native-toast-message";
const errorMiddleware = (error: any) => {
  const errorResponse = error?.response;

  console.error("POST Gagal:", errorResponse?.data || error.message);

  let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

  if (errorResponse?.status === 401) {
    errorMessage = "Email atau Sandi anda salah! Silakan coba lagi.";
  } else if (errorResponse?.status === 500) {
    errorMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
  } else if (errorResponse?.data?.error) {
    if (typeof errorResponse.data.error === "object") {
      errorMessage = "Email atau Nama sudah digunakan";
    } else {
      errorMessage = "Terjadi kesalahan validasi";
    }
  } else if (errorResponse?.data?.message) {
    errorMessage = errorResponse.data.message;
  }

  // Pengganti message.error(errorMessage)
  Toast.show({
    type: "error",
    text1: "Gagal",
    text2: errorMessage,
    position: "top", // Bisa 'top' atau 'bottom'
    visibilityTime: 3000,
  });
};

export default errorMiddleware;
