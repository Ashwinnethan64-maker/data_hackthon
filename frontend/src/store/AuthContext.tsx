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
  loginWithMockCredentials: (username: string, role: UserRole) => void;
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
          const userResponse = await catalyst.userManagement.getCurrentProjectUser();
          const projectUser = userResponse?.content;

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
      } catch (error: any) {
        // Catalyst Web SDK throws a network error (code 700 / net-issue) when there is no active session.
        if (error?.code === 700 || error?.name === 'server://net-issue' || error?.message?.includes('net-issue')) {
          console.log("No active Catalyst session found.");
        } else {
          console.error("Error checking Catalyst session:", error);
        }
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

        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        // Dynamically resolve ZAID from the initialized SDK config
        const catalystClientId = catalyst.config?.zaid || catalyst.config?.client_id || import.meta.env.VITE_CATALYST_CLIENT_ID;

        if (!googleClientId || googleClientId.startsWith('YOUR_')) {
          console.warn("VITE_GOOGLE_CLIENT_ID not configured.");
          throw new Error("Google Client ID is not configured in your frontend/.env file.");
        }
        if (!catalystClientId) {
          console.warn("Catalyst ZAID/Client ID not resolved.");
          throw new Error("Zoho Catalyst Client ID (ZAID) could not be automatically resolved from the SDK configuration.");
        }

        const google = (window as any).google;
        if (!google || !google.accounts || !google.accounts.oauth2) {
          throw new Error("Google Identity SDK is not loaded. Please check your network connection and index.html configuration.");
        }

        try {
          // Initialize implicit token client for popup authentication
          const client = google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                console.error("Google Auth error callback:", tokenResponse.error);
                return;
              }

              const accessToken = tokenResponse.access_token;
              if (!accessToken) return;

              setLoading(true);
              try {
                // 1. Post the Google access token to our Express backend
                const backendRes = await fetch('/server/ai-cios/auth/google-login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ access_token: accessToken })
                });

                if (!backendRes.ok) {
                  const errorData = await backendRes.json();
                  throw new Error(errorData.error || 'Backend Google login failed');
                }

                const data = await backendRes.json();

                // 2. Perform signinWithJwt inside Catalyst SDK
                await catalyst.auth.signinWithJwt(() => {
                  return new Promise((resolve) => {
                    resolve({
                      client_id: data.client_id || catalystClientId,
                      scopes: data.scopes || "ZOHOCATALYST.tables.rows.ALL,ZOHOCATALYST.cache.READ,ZOHOCATALYST.functions.EXECUTE",
                      jwt_token: data.jwt_token
                    });
                  });
                });

                // 3. Retrieve user profile details from Catalyst to set active React user
                const isAuthenticated = await catalyst.auth.isUserAuthenticated();
                if (isAuthenticated) {
                  const userResponse = await catalyst.userManagement.getCurrentProjectUser();
                  const projectUser = userResponse?.content;
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
                }
              } catch (err: any) {
                console.error("Authentication post-processing failed:", err);
                alert("Login processing failed: " + err.message);
              } finally {
                setLoading(false);
              }
            }
          });

          // Trigger the Google Sign-In popup prompt
          client.requestAccessToken();
        } catch (error: any) {
          console.error("Google Token Client initialization error", error);
          throw new Error("Failed to initialize Google Sign-In client: " + (error.message || "Unknown error"));
        }
      },
      loginWithMockCredentials: (username: string, role: UserRole) => {
        const mockUser: AuthUser = {
          id: 'mock-' + Date.now(),
          name: username.split('@')[0].replace('.', ' '),
          username: username,
          email: username + '@karnatakapolice.gov.in',
          role: role,
        };
        document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=28800; SameSite=Strict`;
        setUser(mockUser);
      },
      logout: () => {
        document.cookie = "mock_user=; path=/; max-age=0; SameSite=Strict";
        const catalyst = (window as any).catalyst;
        if (catalyst) {
          try {
            const redirectURL = window.location.origin + '/app/login';
            catalyst.auth.signOut(redirectURL);
          } catch (e) {
            console.warn("Catalyst signOut failed", e);
          }
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
