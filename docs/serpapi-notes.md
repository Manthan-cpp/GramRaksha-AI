# SerpApi integration notes — Phase 2

Checked against the SerpApi documentation on 30 September 2026. The application keeps SerpApi behind `EvidenceProvider`; only the server-side `SerpApiProvider` reads `SERPAPI_API_KEY`.

## Engines and parameters

| Product | Engine | Parameters used | Results normalized |
| --- | --- | --- | --- |
| Google Search | `google` | `q`, `gl=in`, `hl=en|hi|bn`, plus the planned query | `organic_results[].title`, `link`, `snippet`, `date`, `source` |
| Google News | `google_news` | `q`, `gl=in`, `hl=en|hi|bn`; `when:30d` is included in the query for freshness | `news_results[].title`, `link`, `snippet`, `date`, `iso_date`, `source` |
| Google Maps | `google_maps` | `type=search`, `q`, `location`, `z=10`, `gl=in`, `hl=en|hi|bn` | `local_results[].title`, `address`, `phone`, `hours`, `description`, `link`/place search URL |

SerpApi's endpoint is `https://serpapi.com/search.json`. Responses are JSON by default. SerpApi returns search-result metadata and snippets; it does not make the application a full-page crawler. The Phase 2 claim validator therefore checks quotes against the stored snippet.

## Caching and usage

The application cache key contains the UTC cache week, engine, normalized query, and sorted parameters. A cache hit does not call SerpApi. The local cache is stored below `SERPAPI_CACHE_DIR` and is ignored by Git.

The application meter stores successful live searches by month, engine, and day. It stops new live requests at `SERPAPI_MONTHLY_CAP`, which defaults to 250. SerpApi's current free plan lists 250 searches per month and 50 searches per hour. SerpApi also states that only successful searches count, cached, errored, and failed searches do not count; result count does not change the one-search credit cost.

## Errors and fallback

- `400`: invalid or missing parameters; surfaced as an upstream error without exposing the API key.
- `401` / `403`: server key rejected or account not permitted; surfaced as a configuration error.
- `429`: hourly throughput or account search limit; surfaced as a rate/budget message.
- `5xx`: upstream service failure; the stream remains valid and returns a recoverable error.
- Recorded mode reads only labelled JSON captures under `RECORDED_EVIDENCE_DIR` and never calls the network.

The API key is never sent to the browser, written to cache files, or included in logs. Bill queries contain only the confirmed hospital name, city, and procedure. They never contain patient identity, bill amount, or line items.

## Official references

- Google Search API: https://serpapi.com/search-api
- Google News API: https://serpapi.com/google-news-api
- Google Maps API: https://serpapi.com/google-maps-api
- Google Maps Local Results: https://serpapi.com/maps-local-results
- Status and error codes: https://serpapi.com/api-status-and-error-codes
- Plans and pricing: https://serpapi.com/pricing
