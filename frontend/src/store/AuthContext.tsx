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
  loginWithProfile: (profile: AuthUser) => void;
  logout: () => Promise<void>;
  loginWithMockCredentials: (username: string, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Reads the mock_user cookie set during dev login and returns the parsed user, or null. */
function parseMockUserCookie(): AuthUser | null {
  const mockCookie = document.cookie.split(';').find((row) => row.trim().startsWith('mock_user='));
  if (!mockCookie) return null;
  try {
    return JSON.parse(decodeURIComponent(mockCookie.trim().split('=')[1]));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check if the user is authenticated via Catalyst or custom session
    const checkCatalystSession = async () => {
      // Create a timeout promise to guarantee initialization never hangs
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3000));

      const sessionCheckTask = async () => {
        try {
          const catalyst = (window as any).catalyst;
          if (!catalyst || !catalyst.auth) {
            return parseMockUserCookie();
          }

          const hasJwtCookie = document.cookie.split(';').some((item) => item.trim().startsWith('JWT_AUTH='));
          if (hasJwtCookie) {
            try {
              const catalystClientId = catalyst.config?.zaid || catalyst.config?.client_id || import.meta.env.VITE_CATALYST_CLIENT_ID;
              await Promise.race([
                catalyst.auth.signinWithJwt(() => Promise.resolve({
                  client_id: catalystClientId || '',
                  scopes: "ZOHOCATALYST.tables.rows.ALL,ZOHOCATALYST.cache.READ,ZOHOCATALYST.functions.EXECUTE",
                  jwt_token: ''
                })),
                new Promise((_, reject) => setTimeout(() => reject(new Error('JWT pre-init timeout')), 1500))
              ]);
            } catch (e) {
              console.warn("Notice: JWT session pre-init skipped/timed out:", e);
            }
          }

          let isCatalystAuthenticated = false;
          try {
            const authStatus = await Promise.race([
              catalyst.auth.isUserAuthenticated(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Catalyst auth check timeout')), 2000))
            ]);
            isCatalystAuthenticated = authStatus?.status === 200 || authStatus === true;
          } catch (authErr) {
            // Not authenticated or network timeout
          }

          const hasCustomSession = document.cookie.split(';').some((item) => item.trim().startsWith('custom_session='));
          const hasGoogleSession = document.cookie.split(';').some((item) => item.trim().startsWith('google_session='));

          if (isCatalystAuthenticated || hasGoogleSession || hasCustomSession) {
            // Fetch database profile details from custom backend with timeout
            try {
              const controller = new AbortController();
              const timer = setTimeout(() => controller.abort(), 2500);
              const profileRes = await fetch('/server/ai-cios/auth/me', {
                credentials: 'include',
                signal: controller.signal
              });
              clearTimeout(timer);

              if (profileRes.ok) {
                const text = await profileRes.text();
                const dbProfile = text ? JSON.parse(text) : null;
                if (dbProfile) {
                  return {
                    id: dbProfile.id || dbProfile.ROWID || 'db-user',
                    name: dbProfile.name || dbProfile.username,
                    username: dbProfile.username,
                    email: dbProfile.username,
                    role: (dbProfile.role?.toLowerCase() as UserRole) || 'investigator',
                    district: dbProfile.district || 'Bengaluru',
                  };
                }
              }
            } catch (err) {
              console.warn("Custom profile lookup skipped:", err);
            }

            if (isCatalystAuthenticated) {
              try {
                const userResponse = await Promise.race([
                  catalyst.userManagement.getCurrentProjectUser(),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('User profile fetch timeout')), 2000))
                ]);
                const projectUser = userResponse?.content;
                if (projectUser) {
                  return {
                    id: projectUser.ZUID || projectUser.user_id || 'unknown',
                    name: projectUser.first_name
                      ? `${projectUser.first_name} ${projectUser.last_name || ''}`.trim()
                      : projectUser.email_id || 'User',
                    username: projectUser.email_id || 'unknown_user',
                    email: projectUser.email_id,
                    role: (projectUser.role_details?.role_name?.toLowerCase() as UserRole) || 'investigator',
                  };
                }
              } catch (userErr) {
                console.warn("Catalyst getCurrentProjectUser skipped:", userErr);
              }
            }
          }

          return parseMockUserCookie();
        } catch (error: any) {
          console.warn("Session check fallback:", error?.message);
          return parseMockUserCookie();
        }
      };

      try {
        const resolvedUser: any = await Promise.race([sessionCheckTask(), timeoutPromise]);
        if (isMounted) {
          setUser(resolvedUser || parseMockUserCookie());
        }
      } catch (err) {
        if (isMounted) {
          setUser(parseMockUserCookie());
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkCatalystSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      loginWithProfile: (profile: AuthUser) => {
        setUser(profile);
      },
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

                let responseData: any = {};
                try {
                  const text = await backendRes.text();
                  responseData = text ? JSON.parse(text) : {};
                } catch {
                  responseData = {};
                }

                if (!backendRes.ok) {
                  throw new Error(responseData.error || `Backend Google login failed (HTTP ${backendRes.status})`);
                }

                const data = responseData;

                // 2. Perform signinWithJwt inside Catalyst SDK if available
                if (catalyst?.auth?.signinWithJwt) {
                  try {
                    await catalyst.auth.signinWithJwt(() => {
                      return new Promise((resolve) => {
                        resolve({
                          client_id: data.client_id || catalystClientId,
                          scopes: data.scopes || "ZOHOCATALYST.tables.rows.ALL,ZOHOCATALYST.cache.READ,ZOHOCATALYST.functions.EXECUTE",
                          jwt_token: data.jwt_token
                        });
                      });
                    });
                  } catch (jwtErr) {
                    console.warn("Catalyst signinWithJwt notice:", jwtErr);
                  }
                }

                // 3. Retrieve user profile details from backend /me or Catalyst to set active React user
                let userLoaded = false;
                try {
                  const profileRes = await fetch('/server/ai-cios/auth/me', {
                    credentials: 'include',
                  });
                  if (profileRes.ok) {
                    const text = await profileRes.text();
                    const dbProfile = text ? JSON.parse(text) : null;
                    if (dbProfile) {
                      setUser({
                        id: dbProfile.id || dbProfile.ROWID || 'google-user',
                        name: dbProfile.name || dbProfile.username,
                        username: dbProfile.username,
                        email: dbProfile.username,
                        role: (dbProfile.role?.toLowerCase() as UserRole) || 'investigator',
                        district: dbProfile.district || 'Bengaluru',
                      });
                      userLoaded = true;
                    }
                  }
                } catch (profileErr) {
                  console.warn("Backend /me profile fetch notice:", profileErr);
                }

                if (!userLoaded && catalyst?.auth) {
                  const isAuthenticated = await catalyst.auth.isUserAuthenticated().catch(() => false);
                  if (isAuthenticated) {
                    const userResponse = await catalyst.userManagement.getCurrentProjectUser().catch(() => null);
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
                }
              } catch (err: any) {
                console.error("Authentication post-processing failed:", err);
                alert("Login processing failed: " + (err.message || 'Unknown error'));
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
        let displayName = username.split('@')[0]
          .split('.')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('. ');
        if (username.toLowerCase() === 'officer') displayName = 'Officer User';
        else if (username.toLowerCase() === 'admin') displayName = 'Admin User';
        else if (username.toLowerCase() === 'analyst') displayName = 'Analyst User';
        else if (username.toLowerCase() === 'supervisor') displayName = 'Supervisor User';

        const mockUser: AuthUser = {
          id: 'mock-' + Date.now(),
          name: displayName,
          username: username,
          email: username + '@karnatakapolice.gov.in',
          role: role,
        };
        document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=28800; SameSite=Strict`;
        setUser(mockUser);
      },
      logout: async () => {
        // 1. Clear client-side non-HttpOnly cookies immediately
        document.cookie = "mock_user=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "custom_session=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "JWT_AUTH=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "google_session=; path=/; max-age=0; SameSite=Strict";

        // 2. Call backend logout to clear HttpOnly 'token' and 'custom_session' cookies
        try {
          await fetch('/server/ai-cios/auth/logout', { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (e) {
          console.warn("Backend logout failed", e);
        }

        // 3. Clear user from React state
        setUser(null);

        // 4. Perform Catalyst signOut (or manual redirect if not loaded)
        const catalyst = (window as any).catalyst;
        if (catalyst) {
          try {
            const redirectURL = window.location.origin + '/app/login';
            await catalyst.auth.signOut(redirectURL);
          } catch (e) {
            console.warn("Catalyst signOut failed", e);
            window.location.href = '/app/login';
          }
        } else {
          window.location.href = '/app/login';
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
