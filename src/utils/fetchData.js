export default async function fetchData(url, options = {}) {
  const res = await fetch(url, options);

  // 1) HTTP status check
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Fetch error ${res.status}: ${text}`);
  }

  // 2) Content-Type check
  const contentType = res.headers.get('Content-Type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON, but got "${contentType}"`);
  }

  // 3) Parse & return JSON
  return await res.json();
}
