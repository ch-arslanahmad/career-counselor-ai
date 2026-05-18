const API_BASE_URL = "http://localhost:8001";

export function buildApiUrl(endpoint) {
  return `${API_BASE_URL}/${endpoint.replace(/^\/+/, "")}`;
}

export async function getEndpointData(endpoint) {
  const res = await fetch(buildApiUrl(endpoint));
  return await res.json();
}

export const getDataFromEndpoint = async (endpoint) => {
  const data = await getEndpointData(endpoint);
  return data;
};

export async function postEndpointData(endpoint, payload) {
  const res = await fetch(buildApiUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Request failed with status ${res.status}`);
  }

  return await res.json();
}
