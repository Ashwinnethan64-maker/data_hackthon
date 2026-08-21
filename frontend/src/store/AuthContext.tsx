import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

export type UserRole = 'investigator' | 'analyst' | 'supervisor' | 'administrator' | 'policy_maker' | 'viewer';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  email?: string;
  district?: string;
  provider?: 'Google' | 'Database' | 'System' | 'Demo';
  avatar?: string;
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

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Check if user has an active, valid Catalyst or authenticated backend session
    const checkSession = async () => {
      try {
        const catalyst = (window as any).catalyst;

        // 1. Verify backend authenticated session via /auth/me
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3500);
          const profileRes = await fetch('/server/ai-cios/auth/me', {
            credentials: 'include',
            signal: controller.signal
          });
          clearTimeout(timer);

          if (profileRes.ok) {
            const dbProfile = await profileRes.json();
            if (dbProfile && (dbProfile.username || dbProfile.id)) {
              if (isMounted) {
                setUser({
                  id: dbProfile.id || String(dbProfile.ROWID) || 'db-user',
                  name: dbProfile.name || dbProfile.username,
                  username: dbProfile.username,
                  email: dbProfile.email || dbProfile.username,
                  role: (dbProfile.role?.toLowerCase() as UserRole) || 'investigator',
                  district: dbProfile.district || 'Bengaluru',
                  provider: dbProfile.provider || (dbProfile.username?.includes('@') ? 'Google' : 'Database'),
                  avatar: dbProfile.avatar
                });
              }
              return;
            }
          }
        } catch (_err) {
          // Backend profile check timed out or failed
        }

        // 2. Check Catalyst web SDK project user
        if (catalyst?.auth && catalyst?.userManagement) {
          try {
            const isAuth = await Promise.race([
              catalyst.auth.isUserAuthenticated(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Catalyst timeout')), 2000))
            ]);

            if (isAuth === true || isAuth?.status === 200) {
              const userRes = await catalyst.userManagement.getCurrentProjectUser();
              const projectUser = userRes?.content;
              if (projectUser && isMounted) {
                setUser({
                  id: projectUser.ZUID || projectUser.user_id || 'unknown',
                  name: projectUser.first_name
                    ? `${projectUser.first_name} ${projectUser.last_name || ''}`.trim()
                    : projectUser.email_id || 'User',
                  username: projectUser.email_id || 'unknown_user',
                  email: projectUser.email_id,
                  role: (projectUser.role_details?.role_name?.toLowerCase() as UserRole) || 'investigator',
                  provider: 'Google'
                });
                return;
              }
            }
          } catch (_catErr) {
            // Catalyst session not active
          }
        }

        // 3. Check for developer mock_user cookie if in local environment
        const mockCookie = document.cookie.split(';').find((row) => row.trim().startsWith('mock_user='));
        if (mockCookie) {
          try {
            const parsed = JSON.parse(decodeURIComponent(mockCookie.trim().split('=')[1]));
            if (parsed && parsed.username && isMounted) {
              setUser({
                ...parsed,
                provider: 'Demo'
              });
              return;
            }
          } catch {
            // invalid mock cookie
          }
        }

        // Strictly unauthenticated
        if (isMounted) {
          setUser(null);
        }
      } catch (error) {
        console.warn('Authentication check failed:', error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

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
        const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const catalystClientId = catalyst?.config?.zaid || catalyst?.config?.client_id || import.meta.env.VITE_CATALYST_CLIENT_ID;

        if (!googleClientId || googleClientId.startsWith('YOUR_')) {
          throw new Error('Google Client ID is not configured in your environment.');
        }

        const google = (window as any).google;
        if (!google?.accounts?.oauth2) {
          throw new Error('Google Identity SDK is not loaded. Please check your network connection.');
        }

        try {
          const client = google.accounts.oauth2.initTokenClient({
            client_id: googleClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                console.error('Google Auth error callback:', tokenResponse.error);
                return;
              }

              const accessToken = tokenResponse.access_token;
              if (!accessToken) return;

              setLoading(true);
              try {
                // 1. Post Google access token to Express backend
                const backendRes = await fetch('/server/ai-cios/auth/google-login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ access_token: accessToken })
                });

                let data: any = {};
                try {
                  const text = await backendRes.text();
                  data = text ? JSON.parse(text) : {};
                } catch {
                  data = {};
                }

                if (!backendRes.ok) {
                  throw new Error(data.error || `Backend Google login failed (HTTP ${backendRes.status})`);
                }

                // 2. Perform signinWithJwt inside Catalyst SDK if available
                if (catalyst?.auth?.signinWithJwt) {
                  try {
                    await catalyst.auth.signinWithJwt(() => {
                      return Promise.resolve({
                        client_id: data.client_id || catalystClientId,
                        scopes: data.scopes || "ZOHOCATALYST.tables.rows.ALL,ZOHOCATALYST.cache.READ,ZOHOCATALYST.functions.EXECUTE",
                        jwt_token: data.jwt_token
                      });
                    });
                  } catch (jwtErr) {
                    console.warn('Catalyst signinWithJwt notice:', jwtErr);
                  }
                }

                // 3. Retrieve authenticated user profile from /auth/me
                const profileRes = await fetch('/server/ai-cios/auth/me', {
                  credentials: 'include',
                });
                if (profileRes.ok) {
                  const dbProfile = await profileRes.json();
                  if (dbProfile) {
                    setUser({
                      id: dbProfile.id || String(dbProfile.ROWID) || 'google-user',
                      name: dbProfile.name || dbProfile.username,
                      username: dbProfile.username,
                      email: dbProfile.email || dbProfile.username,
                      role: (dbProfile.role?.toLowerCase() as UserRole) || 'investigator',
                      district: dbProfile.district || 'Bengaluru',
                      provider: 'Google',
                      avatar: dbProfile.avatar
                    });
                  }
                }
              } catch (err: any) {
                console.error('Authentication post-processing failed:', err);
                alert('Login processing failed: ' + (err.message || 'Unknown error'));
              } finally {
                setLoading(false);
              }
            }
          });

          client.requestAccessToken();
        } catch (error: any) {
          console.error('Google Token Client initialization error', error);
          throw new Error('Failed to initialize Google Sign-In client: ' + (error.message || 'Unknown error'));
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
          provider: 'Demo'
        };
        document.cookie = `mock_user=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=28800; SameSite=Strict`;
        setUser(mockUser);
      },
      logout: async () => {
        // 1. Clear all client cookies immediately
        document.cookie = "mock_user=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "custom_session=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "JWT_AUTH=; path=/; max-age=0; SameSite=Strict";
        document.cookie = "google_session=; path=/; max-age=0; SameSite=Strict";

        // 2. Clear relevant session/local storage
        try {
          sessionStorage.removeItem('redirect');
          sessionStorage.removeItem('catalyst_user');
          localStorage.removeItem('catalyst_auth');
          localStorage.removeItem('user');
        } catch (_e) {
          // ignore
        }

        // 3. Reset React authentication state immediately
        setUser(null);
        setLoading(false);

        // 4. Call backend logout endpoint
        try {
          await fetch('/server/ai-cios/auth/logout', { 
            method: 'POST',
            credentials: 'include'
          });
        } catch (e) {
          console.warn('Backend logout error:', e);
        }

        // 5. Trigger Catalyst signOut if available (in non-blocking background)
        const catalyst = (window as any).catalyst;
        if (catalyst?.auth?.signOut) {
          try {
            catalyst.auth.signOut().catch(() => {});
          } catch (_e) {
            // ignore
          }
        }

        // 6. Navigate to login page
        window.location.href = window.location.origin + '/app/login';
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
