import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
  console.log("--- Mencari Daftar Model Tersedia ---");
  if (!apiKey) return;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Berhasil! Berikut model yang bisa Anda gunakan:");
      data.models.forEach((m: any) => console.log("- " + m.name));
    } else {
      console.log("Google mengembalikan data kosong atau error:", JSON.stringify(data));
    }
  } catch (error: any) {
    console.error("Gagal terhubung ke Google:", error.message);
  }
}

listModels();
