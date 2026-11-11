import StoreCartButton from "@/components/store/StoreCartButton";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <StoreCartButton mobileFloating />
    </>
  );
}
