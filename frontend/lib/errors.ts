import axios from "axios";

type ApiErrBody = {
  error?: string;
  message?: string;
  details?: Record<string, string[] | undefined>;
};

function formatDetails(details: Record<string, string[] | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(details)) {
    if (v?.length) parts.push(`${k}: ${v.join(", ")}`);
  }
  return parts.join("; ");
}

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return "Cannot reach the API. Start the backend (port 4000), set NEXT_PUBLIC_API_URL if needed, and ensure CLIENT_ORIGIN in backend .env includes the exact URL you use in the browser (e.g. both localhost and 127.0.0.1).";
    }
    const data = err.response.data as ApiErrBody | undefined;
    if (data?.message) return data.message;
    if (data?.error && data?.details) {
      const d = formatDetails(data.details);
      if (d) return `${data.error}: ${d}`;
    }
    if (data?.error) return data.error;
    return `Request failed (${err.response.status}).`;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}
