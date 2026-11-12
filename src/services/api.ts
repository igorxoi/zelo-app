import { Platform } from "react-native";

const DEFAULT_URL =
  Platform.OS === "android" ? "http://10.0.2.2:3333" : "http://localhost:3333";

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL).replace(
  /\/$/,
  "",
);

const TIMEOUT_MS = 60000;

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const getAuthToken = () => authToken;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  onUnauthorized = handler;
};

type RequestOptions = {
  body?: unknown;
  auth?: boolean;
};

export async function request<T = void>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  { body, auth = true }: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(auth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized?.();
    throw new Error(data?.message ?? "Algo deu errado. Tente novamente.");
  }

  return data as T;
}
