// server/airaloClient.ts
import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const AIRALO_BASE =
  process.env.AIRALO_API_BASE ?? "https://partners-api.airalo.com";

const CLIENT_ID = process.env.AIRALO_CLIENT_ID!;
const CLIENT_SECRET = process.env.AIRALO_CLIENT_SECRET!;

let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null; // timestamp en ms

/**
 * Genera y devuelve un access token válido de Airalo.
 * Si ya existe uno vigente, lo reutiliza.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();

  // Si ya tengo token en memoria y sigue vigente, lo reutilizo
  if (cachedToken && tokenExpiresAt && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  try {
    // 👉 armamos form-data exactamente como dice la doc
    const form = new FormData();
    form.append("client_id", CLIENT_ID);
    form.append("client_secret", CLIENT_SECRET);
    form.append("grant_type", "client_credentials");

    const res = await axios.post(`${AIRALO_BASE}/v2/token`, form, {
      headers: {
        Accept: "application/json",
        ...form.getHeaders(), // deja que form-data setee Content-Type y boundary
      },
    });

    console.log("Airalo token response:", res.data);

    const tokenData = res.data?.data;
    cachedToken = tokenData?.access_token ?? null;

    const expiresInSeconds = tokenData?.expires_in ?? 24 * 60 * 60;
    tokenExpiresAt = now + expiresInSeconds * 1000;

    if (!cachedToken) {
      throw new Error("No access token received from Airalo");
    }

    return cachedToken;
  } catch (err: any) {
    console.error(
      "Error getting access token from Airalo:",
      err?.code,
      err?.response?.status,
      err?.response?.data ?? err
    );
    throw err;
  }
}

// ---------- Tipo de config para las requests ----------
export type AiraloRequestConfig<T = any> = {
  method: "GET" | "POST";
  url: string;
  params?: any;
  data?: any;
  headers?: Record<string, any>; // 👈 ahora aceptamos headers custom
};

/**
 * Cliente genérico para hacer requests a Airalo con token automático.
 */
export async function airaloRequest<T = any>(
  config: AiraloRequestConfig<T>
): Promise<T> {
  const token = await getAccessToken();

  const res = await axios({
    method: config.method,
    url: `${AIRALO_BASE}${config.url}`,
    params: config.params,
    data: config.data,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(config.headers || {}), // 👈 mergeamos headers pasados (ej: form.getHeaders())
    },
  });

  return res.data as T;
}
