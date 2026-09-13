export async function readApiJson<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json() as T;
  }

  const text = await response.text();
  const fallbackMessage = response.ok
    ? "Unexpected non-JSON response from server."
    : `Request failed with status ${response.status}.`;

  return {
    error: extractErrorMessage(text) || fallbackMessage,
  } as T;
}

function extractErrorMessage(text: string) {
  const title = text.match(/<title>(.*?)<\/title>/i)?.[1];

  if (title && title !== "Next.js") {
    return title;
  }

  const bodyText = text
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return bodyText.slice(0, 220);
}
