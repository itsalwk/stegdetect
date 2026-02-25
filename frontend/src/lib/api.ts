// src/lib/api.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = {
  async hideData(carrierFile: File, secretFile: File | null, secretText: string, password?: string, nBits: number = 2) {
    const formData = new FormData();
    formData.append("carrier_file", carrierFile);
    if (secretFile) {
      formData.append("secret_file", secretFile);
    }
    if (secretText) {
      formData.append("secret_text", secretText);
    }
    if (password && password.trim() !== "" && password !== "undefined") {
      formData.append("password", password);
    }
    formData.append("n_bits", nBits.toString());

    const response = await fetch(`${API_BASE_URL}/hide`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to hide data");
    }

    return response.blob();
  },

  async extractData(stegoFile: File, password?: string, nBits: number = 2) {
    const formData = new FormData();
    formData.append("stego_file", stegoFile);
    if (password && password.trim() !== "" && password !== "undefined") {
      formData.append("password", password);
    }
    formData.append("n_bits", nBits.toString());

    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to extract data");
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json(); // Likely { type: "text", content: "..." } or error
    } else {
      return response.blob(); // Binary file
    }
  },

  async analyzeImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Analysis failed");
    }

    return response.json();
  }
};
