import { getTopics } from "@/app/actions/getTopics";
import ContentViewer from "./components/ContentViewer";
import VocabularyPanel from "./components/VocabularyPanel";

// Server Component — fetches topics once per request, then hands off to two
// independent client components. They stay in sync via a custom window event
// (see ContentViewer/YouTubeSearch dispatch + VocabularyPanel listener) rather
// than shared React state, since this page itself holds none.
export default async function Screen1Page() {
  const topics = await getTopics();

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Deutsch Lernen — B2/C1</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ContentViewer topics={topics} />
        <VocabularyPanel />
      </div>
    </main>
  );
}
