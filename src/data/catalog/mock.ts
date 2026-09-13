import type { Content, Season } from "@/lib/catalog/types";
import { buildTelegramDownloadUrl } from "@/lib/catalog/telegram";
import { slugify } from "@/lib/slug";

function movie(
  partial: Omit<Content, "type" | "createdAt" | "downloadUrl" | "slug"> & { id: string }
): Content {
  return {
    ...partial,
    slug: slugify(partial.title) || partial.id,
    type: "movie",
    genres: partial.genres ?? [],
    createdAt: "2024-01-01T00:00:00.000Z",
    downloadUrl: buildTelegramDownloadUrl(partial.id),
  };
}

function series(
  partial: Omit<Content, "type" | "createdAt" | "slug"> & {
    id: string;
    seasons: Season[];
  }
): Content {
  return {
    ...partial,
    slug: slugify(partial.title) || partial.id,
    type: "series",
    genres: partial.genres ?? [],
    createdAt: "2024-01-01T00:00:00.000Z",
  };
}

export const MOVIES: Content[] = [
  movie({
    id: "tt0111161",
    title: "The Shawshank Redemption",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    year: "1994",
    rating: "9.3",
    genres: ["Drama", "Crime"],
    runtime: "142 min",
    qualities: ["480p", "720p", "1080p"],
  }),
  movie({
    id: "tt0068646",
    title: "The Godfather",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/tmU7GeKVybMWFButWEGl2M4GeiP.jpg",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    year: "1972",
    rating: "9.2",
    genres: ["Crime", "Drama"],
    runtime: "175 min",
    qualities: ["480p", "720p"],
  }),
  movie({
    id: "tt0071562",
    title: "The Godfather Part II",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/poec6RqOKY9iSiIUmfyfPfiLtvB.jpg",
    description:
      "The early life and career of Vito Corleone in 1920s New York City is portrayed while his son, Michael, expands and tightens his grip on the family crime syndicate.",
    year: "1974",
    rating: "9.0",
    genres: ["Crime", "Drama"],
    runtime: "202 min",
    qualities: ["480p", "720p", "1080p"],
  }),
  movie({
    id: "tt0468569",
    title: "The Dark Knight",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    year: "2008",
    rating: "9.0",
    genres: ["Action", "Crime", "Drama"],
    runtime: "152 min",
    qualities: ["720p", "1080p", "4K"],
  }),
  movie({
    id: "tt0050083",
    title: "12 Angry Men",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/ppd84D2i9W8jXmsyInGyihiSyqz.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/qqHQsStV6exghCM7zbObuYBiYxw.jpg",
    description:
      "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
    year: "1957",
    rating: "9.0",
    genres: ["Crime", "Drama"],
    runtime: "96 min",
    qualities: ["480p"],
  }),
  movie({
    id: "tt0108052",
    title: "Schindler's List",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
    description:
      "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.",
    year: "1993",
    rating: "9.0",
    genres: ["Biography", "Drama", "History"],
    runtime: "195 min",
    qualities: ["720p", "1080p"],
  }),
  movie({
    id: "tt0167260",
    title: "The Lord of the Rings: The Return of the King",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/8BPZO0Bf8TeAy8znF43z8soK3ys.jpg",
    description:
      "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    year: "2003",
    rating: "9.0",
    genres: ["Action", "Adventure", "Drama"],
    runtime: "201 min",
    qualities: ["720p", "1080p", "4K"],
  }),
  movie({
    id: "tt0120737",
    title: "The Lord of the Rings: The Fellowship of the Ring",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/pIIskHRIA2J6eSQUGfkKbpgeLIP.jpg",
    description:
      "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    year: "2001",
    rating: "8.9",
    genres: ["Action", "Adventure", "Drama"],
    runtime: "178 min",
    qualities: ["720p", "1080p", "4K"],
  }),
];

export const SERIES: Content[] = [
  series({
    id: "tt0944947",
    title: "Game of Thrones",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
    description:
      "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    year: "2011–2019",
    rating: "9.2",
    genres: ["Action", "Adventure", "Drama"],
    runtime: "57 min",
    qualities: ["720p", "1080p"],
    seasons: [{ seasonNumber: 1, downloadUrl: buildTelegramDownloadUrl("tt0944947-s1") }, { seasonNumber: 2, downloadUrl: buildTelegramDownloadUrl("tt0944947-s2") }],
  }),
  series({
    id: "tt0903747",
    title: "Breaking Bad",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/84XPpjGvxNyExjSuLQe1SzyszUp.jpg",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    year: "2008–2013",
    rating: "9.5",
    genres: ["Crime", "Drama", "Thriller"],
    runtime: "49 min",
    qualities: ["480p", "720p", "1080p"],
    seasons: [
      { seasonNumber: 1, downloadUrl: buildTelegramDownloadUrl("tt0903747-s1") },
      { seasonNumber: 2, downloadUrl: buildTelegramDownloadUrl("tt0903747-s2") },
      { seasonNumber: 3, downloadUrl: buildTelegramDownloadUrl("tt0903747-s3") },
    ],
  }),
  series({
    id: "tt4574334",
    title: "Stranger Things",
    posterImageUrl: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    backdropImageUrl: "https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
    description:
      "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    year: "2016–2025",
    rating: "8.7",
    genres: ["Drama", "Fantasy", "Horror"],
    runtime: "51 min",
    qualities: ["720p", "1080p", "4K"],
    seasons: [
      { seasonNumber: 1, downloadUrl: buildTelegramDownloadUrl("tt4574334-s1") },
      { seasonNumber: 2, downloadUrl: buildTelegramDownloadUrl("tt4574334-s2") },
      { seasonNumber: 3, downloadUrl: buildTelegramDownloadUrl("tt4574334-s3") },
      { seasonNumber: 4, downloadUrl: buildTelegramDownloadUrl("tt4574334-s4") },
    ],
  }),
];

export const ALL_CONTENT: Content[] = [...MOVIES, ...SERIES];

export const FEATURED: Content = MOVIES[3]; // The Dark Knight
