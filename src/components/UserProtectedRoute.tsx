import { useEffect } from "react";
import { useLocation } from "wouter";
import { useUserAuth } from "@/contexts/UserAuthContext";

export default function UserProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUserAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation(`/login?redirect=${encodeURIComponent(location)}`);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return null;
  return <>{children}</>;
}
