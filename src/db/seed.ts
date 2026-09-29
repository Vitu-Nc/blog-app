import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { posts } from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before seeding the database.");
}

const client = postgres(connectionString);
const db = drizzle(client);

try {
  await db
    .insert(posts)
    .values([
      {
        slug: "the-art-of-noticing",
        title: "The Art of Noticing",
        excerpt:
          "A small case for slowing down long enough to see what is already here.",
        content:
          "Attention is a kind of generosity. When we give it to an ordinary day, the details we used to pass by begin to arrange themselves into a story.\n\nThe practice is simple, even if it is not always easy: pause, look again, and let the world be more interesting than your assumptions about it.",
        publishedAt: new Date("2025-05-12T12:00:00.000Z"),
      },
      {
        slug: "making-things-that-last",
        title: "Making Things That Last",
        excerpt:
          "Good work is often less about speed than about choosing what deserves to endure.",
        content:
          "The best tools and ideas have a quiet quality. They do not ask for attention; they earn trust by being useful, understandable, and cared for over time.\n\nBuilding something lasting starts with deciding what not to add. A clear purpose leaves room for the details that matter.",
        publishedAt: new Date("2025-04-03T12:00:00.000Z"),
      },
      {
        slug: "a-note-on-beginnings",
        title: "A Note on Beginnings",
        excerpt:
          "Every finished thing once looked like a first, imperfect step.",
        content:
          "Starting is an act of optimism. It means believing that a rough draft, a small experiment, or a short walk can lead somewhere worth going.\n\nThere is no need to see the whole path. Make one honest move, pay attention to what it teaches you, and begin again from there.",
        publishedAt: new Date("2025-02-18T12:00:00.000Z"),
      },
    ])
    .onConflictDoNothing({ target: posts.slug });
} finally {
  await client.end();
}
