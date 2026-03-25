import type { Event, Team, Site, Stat, BoardMember, BoardSection } from "@/lib/data/types";

const API_BASE = process.env.API_BASE_URL;

async function getAuthToken(): Promise<string> {
  const response = await fetch(process.env.OAUTH_TOKEN_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  if (!API_BASE || API_BASE.includes("bilinmiyor")) {
    console.error(`Hata: ${endpoint} için API_BASE_URL tanımlanmamış!`);
    return [] as unknown as T;
  }

  const token = await getAuthToken();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });

  return response.json();
}

// eskylabe bağlanırsa hazırlık
export const getEventsApi = () => fetchFromApi<Event[]>("/events");
export const getTeamsApi = () => fetchFromApi<Team[]>("/teams");
export const getSitesApi = () => fetchFromApi<Site[]>("/sites");
export const getStatsApi = () => fetchFromApi<Stat[]>("/stats");
export const getBoardApi = () => fetchFromApi<BoardSection>("/board");
export const getBoardMembersApi = () => fetchFromApi<BoardMember[]>("/board/members");