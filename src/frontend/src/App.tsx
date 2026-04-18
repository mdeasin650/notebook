import { LoginPage } from "@/components/LoginPage";
import { Toaster } from "@/components/ui/sonner";
import { NotesPage } from "@/pages/NotesPage";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export default function App() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();

  if (isInitializing || !isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster richColors position="bottom-right" />
      </>
    );
  }

  return (
    <>
      <NotesPage />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
