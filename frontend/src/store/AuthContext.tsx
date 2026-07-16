import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type UserRole = 'investigator' | 'analyst' | 'supervisor' | 'administrator' | 'policy_maker' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email?: string;
  district?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated via Catalyst
    const checkCatalystSession = async () => {
      try {
        const catalyst = (window as any).catalyst;
        if (!catalyst) {
          console.error("Catalyst SDK not loaded");
          setLoading(false);
          return;
        }

        const isAuthenticated = await catalyst.auth.isUserAuthenticated();
        console.log(isAuthenticated);

        if (isAuthenticated) {
          const projectUser = await catalyst.userManagement().getCurrentProjectUser();

          if (projectUser) {
            setUser({
              id: projectUser.ZUID || projectUser.user_id || 'unknown',
              name: projectUser.first_name
                ? `${projectUser.first_name} ${projectUser.last_name || ''}`.trim()
                : projectUser.email_id || 'User',
              username: projectUser.email_id || 'unknown_user',
              email: projectUser.email_id,
              role: (projectUser.role_details?.role_name?.toLowerCase() as UserRole) || 'investigator',
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking Catalyst session", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkCatalystSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginWithGoogle: () => {
        const catalyst = (window as any).catalyst;
        if (!catalyst) {
          throw new Error("Catalyst SDK not loaded. Please verify your internet connection and Catalyst configuration.");
        }

        try {
          // You must have a redirect URL configured in Catalyst
          // The SDK will handle the redirect.
          catalyst.auth.signIn('Google');
        } catch (error: any) {
          console.error("Google sign in error", error);
          throw new Error("Failed to initialize Google Sign-In: " + (error.message || "Unknown error"));
        }
      },
      logout: () => {
        const catalyst = (window as any).catalyst;
        if (catalyst) {
          catalyst.auth.signOut('/login');
          setUser(null);
        }
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
