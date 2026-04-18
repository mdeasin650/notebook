import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { BookOpen, Lock } from "lucide-react";

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const isLoading = isLoggingIn;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-display-md text-foreground">Zenith Notes</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Your private, minimal notebook
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-3 text-left">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-accent mt-0.5 shrink-0" />
            <div>
              <p className="text-body-sm font-medium text-foreground">
                Private by default
              </p>
              <p className="text-muted-hint mt-0.5">
                Notes are stored on the Internet Computer — only you can access
                them.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => login()}
            disabled={isLoading}
            data-ocid="login.submit_button"
          >
            {isLoading ? "Signing in…" : "Sign in with Internet Identity"}
          </Button>
          <p className="text-muted-hint">
            Internet Identity is a secure, privacy-preserving login on the
            Internet Computer.
          </p>
        </div>
      </div>
    </div>
  );
}
