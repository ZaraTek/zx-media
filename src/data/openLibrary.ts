import type { Book } from "../types";

const OL_BASE = "https://openlibrary.org";
const OL_COVERS_BASE = "https://covers.openlibrary.org/b/id";

function coverUrl(coverId: number | null | undefined): string | null {
  if (!coverId) return null;
  return `${OL_COVERS_BASE}/${coverId}-L.jpg`;
}

function workIdFromKey(key: string): string {
  // key is like "/works/OL45804W"
  return key.split("/").pop() ?? key;
}

// Both search and trending endpoints return similar shapes but with slight field differences
interface OLDoc {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;    // search uses cover_i
  cover_id?: number;   // trending uses cover_id
  first_publish_year?: number;
  subject?: string[];
  number_of_pages_median?: number;
  ratings_average?: number;
  ratings_count?: number;
}

function docToBook(doc: OLDoc): Book {
  const coverId = doc.cover_i ?? doc.cover_id ?? null;
  return {
    id: workIdFromKey(doc.key),
    title: doc.title,
    authors: doc.author_name ?? [],
    description: "",
    coverId,
    coverUrl: coverUrl(coverId),
    year: doc.first_publish_year ?? null,
    subjects: (doc.subject ?? []).slice(0, 8),
    pages: doc.number_of_pages_median ?? null,
    rating:
      doc.ratings_average != null
        ? Math.round(doc.ratings_average * 10) / 10
        : null,
    ratingsCount: doc.ratings_count ?? null,
  };
}

const SEARCH_FIELDS =
  "key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median,ratings_average,ratings_count";

export async function searchBooks(query: string): Promise<Book[]> {
  const url = `${OL_BASE}/search.json?q=${encodeURIComponent(query)}&limit=24&fields=${SEARCH_FIELDS}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library search failed (${res.status})`);
  const data = (await res.json()) as { docs?: OLDoc[] };
  return (data.docs ?? []).map(docToBook);
}

export async function fetchTrendingBooks(): Promise<Book[]> {
  const url = `${OL_BASE}/trending/weekly.json?limit=6`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open Library trending failed (${res.status})`);
  const data = (await res.json()) as { works?: OLDoc[] };
  return (data.works ?? []).map(docToBook);
}

interface OLWorkAuthorRef {
  author: { key: string };
}

export async function fetchBookById(id: string): Promise<Book> {
  const workRes = await fetch(`${OL_BASE}/works/${id}.json`);
  if (!workRes.ok)
    throw new Error(`Open Library work not found (${workRes.status})`);

  const work = (await workRes.json()) as {
    title: string;
    description?: string | { value: string };
    subjects?: string[];
    covers?: number[];   // work JSON uses covers[], not cover_id
    cover_id?: number;  // fallback, occasionally present
    first_publish_year?: number;
    authors?: OLWorkAuthorRef[];
  };

  const description =
    typeof work.description === "string"
      ? work.description
      : (work.description?.value ?? "");

  const authorKeys = (work.authors ?? [])
    .slice(0, 3)
    .map((a) => a.author.key);

  const [ratingsRes, ...authorResponses] = await Promise.all([
    fetch(`${OL_BASE}/works/${id}/ratings.json`),
    ...authorKeys.map((key) => fetch(`${OL_BASE}${key}.json`)),
  ]);

  const ratings = ratingsRes.ok
    ? ((await ratingsRes.json()) as {
        summary?: { average?: number; count?: number };
      })
    : null;

  const authors: string[] = [];
  for (const res of authorResponses) {
    if (res.ok) {
      const author = (await res.json()) as { name?: string };
      if (author.name) authors.push(author.name);
    }
  }

  const coverId = work.covers?.[0] ?? work.cover_id ?? null;

  return {
    id,
    title: work.title,
    authors,
    description,
    coverId,
    coverUrl: coverUrl(coverId),
    year: work.first_publish_year ?? null,
    subjects: (work.subjects ?? []).slice(0, 8),
    pages: null,
    rating:
      ratings?.summary?.average != null
        ? Math.round(ratings.summary.average * 10) / 10
        : null,
    ratingsCount: ratings?.summary?.count ?? null,
  };
}

export async function fetchBooksByIds(ids: string[]): Promise<Book[]> {
  if (ids.length === 0) return [];
  const results = await Promise.allSettled(ids.map((id) => fetchBookById(id)));
  return results
    .filter((r): r is PromiseFulfilledResult<Book> => r.status === "fulfilled")
    .map((r) => r.value);
}

export async function fetchDirectPdfUrl(
  title: string,
  author?: string
): Promise<string | null> {
  try {
    const params = new URLSearchParams({ title });
    if (author) params.set("author", author);
    const res = await fetch(`/api/books/pdf?${params.toString()}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string };
    return data.url ?? null;
  } catch {
    return null;
  }
}

export function getLibgenSearchUrl(title: string, author?: string): string {
  const q = encodeURIComponent(author ? `${title} ${author}` : title);
  return (
    `https://libgen.li/index.php?req=${q}` +
    `&columns%5B%5D=t&columns%5B%5D=a&objects%5B%5D=f&objects%5B%5D=e` +
    `&topics%5B%5D=l&res=25&filesuns=all`
  );
}
