import ContentPage from "@/components/layout/ContentPage";
import BookShelf from "@/components/store/BookShelf";

export default function StorePage() {
  return (
    <ContentPage
      eyebrow="THE TAP STORE"
      title="THE AFRICA PLUG BOOKSHELF."
      description="Practical guides, field notes and playbooks for people building knowledge, relationships and opportunities across African markets."
    >
      <BookShelf />
    </ContentPage>
  );
}
