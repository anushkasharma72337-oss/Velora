# Supabase Authentication Setup Guide

## Overview

This guide covers setting up Supabase authentication for the PS Feedback Platform, including email/password authentication, OAuth providers, and custom claims.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Email/Password Authentication](#emailpassword-authentication)
3. [OAuth Providers](#oauth-providers)
4. [Custom Claims & Roles](#custom-claims--roles)
5. [Security Policies](#security-policies)
6. [Testing Authentication](#testing-authentication)
7. [Frontend Integration](#frontend-integration)

---

## Initial Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project details:
   - **Name**: PS Feedback Platform
   - **Database Password**: Strong password (auto-generated)
   - **Region**: Choose closest to your users
   - **Pricing**: Choose Free or Pro

4. Wait for database initialization (5-10 minutes)

### 2. Get Your API Keys

1. Go to **Settings → API**
2. Copy:
   - `SUPABASE_URL`: Project URL
   - `SUPABASE_ANON_KEY`: Public anonymous key (for client-side)
   - `SUPABASE_SERVICE_ROLE_KEY`: Private key (for server-side only)

**Save these securely** - You'll need them for:
- Backend `.env` configuration
- Frontend environment setup

---

## Email/Password Authentication

### Enable Email Provider

1. Go to **Authentication → Providers**
2. Find "Email" in the list
3. Enable the provider
4. (Optional) Configure:
   - SMTP for custom emails
   - Email templates (verification, password reset)

### Configure Email Templates

1. Go to **Authentication → Email Templates**
2. Customize:
   - Confirmation Email
   - Password Recovery Email
   - Magic Link Email
   - Re-authentication Email

Default templates use Supabase branding. For custom branding:

```html
<!-- Example Confirmation Email Template -->
<h1>Confirm your email</h1>
<p>Click the link below to confirm your email address:</p>
<a href="{{ .ConfirmationURL }}">Confirm email</a>
<p>Or use this code: {{ .Token }}</p>
<p>This link expires in 24 hours.</p>
```

### Enable Email Confirmations

1. **Authentication → Settings**
2. Under "Email Auth":
   - Enable "Confirm email"
   - Redirect URL (after confirmation): `https://yourdomain.com/auth/confirm`

### Enable Password Reset

The password reset flow is automatic:
1. User requests password reset
2. Supabase sends email with reset link
3. User clicks link and sets new password
4. Redirects to `https://yourdomain.com/auth/reset`

---

## OAuth Providers

### Google OAuth Setup

#### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable OAuth 2.0:
   - **APIs & Services** → **Enable APIs and Services**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth credentials:
   - **Credentials** → **Create Credentials** → **OAuth Client ID**
   - **Application Type**: Web application
   - **Name**: PS Feedback Platform
   - **Authorized redirect URIs**: Add
     - `https://<project-id>.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

5. Copy:
   - **Client ID**
   - **Client Secret**

#### 2. Configure in Supabase

1. **Authentication → Providers → Google**
2. Enable the provider
3. Paste:
   - **Client ID**
   - **Client Secret**
4. Save

### GitHub OAuth Setup

#### 1. Get GitHub OAuth Credentials

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. **OAuth Apps** → **New OAuth App**
3. Fill in details:
   - **Application name**: PS Feedback Platform
   - **Homepage URL**: `https://yourdomain.com`
   - **Authorization callback URL**: `https://<project-id>.supabase.co/auth/v1/callback`

4. Copy:
   - **Client ID**
   - **Client Secret**

#### 2. Configure in Supabase

1. **Authentication → Providers → GitHub**
2. Enable the provider
3. Paste credentials
4. Save

### Twitter OAuth Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create app or use existing
3. **Keys and tokens** → OAuth 2.0 settings
4. Generate credentials:
   - **Client ID**
   - **Client Secret**

5. Add callback URLs:
   - `https://<project-id>.supabase.co/auth/v1/callback`

6. In **Supabase → Authentication → Providers → Twitter**:
   - Enable provider
   - Paste credentials
   - Save

---

## Custom Claims & Roles

### Add Custom Claims via Postgres Function

```sql
-- Create function to manage user roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'role'::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Add Role Claims to JWT

```sql
-- Create function to add custom claims to JWT
CREATE OR REPLACE FUNCTION public.custom_jwt_claims(user_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'role', (SELECT role FROM public.users WHERE id = user_id),
    'username', (SELECT username FROM public.users WHERE id = user_id)
  );
$$;
```

### Use Custom Claims in Policies

```sql
-- Example: Check user role in RLS policy
CREATE POLICY "Only admins can delete users"
ON public.users FOR DELETE
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## Security Policies

### 1. Rate Limiting

Configure in **Authentication → Settings**:
- **Enable rate limiting**
- **SMS OTP & Email rate limits**: Set appropriate thresholds

### 2. Session Management

**Authentication → Settings**:
- **JWT expiration**: 3600 seconds (1 hour)
- **Refresh token rotation**: Enabled

### 3. Password Requirements

**Authentication → Settings → Email/Password**:
- **Require strong passwords**
- **Minimum length**: 8 characters
- **Require numbers**: Yes
- **Require special characters**: Yes

### 4. Multi-Factor Authentication (MFA)

Enable MFA for admins:

```sql
-- Require MFA for admin users
ALTER USER admin_user SET auth.require_mfa = true;
```

### 5. Email Allowlists

For beta testing:

1. **Authentication → Settings**
2. **Additional Configuration**:
   - **Enable email allowlist**
   - Add specific email addresses

### 6. Anonymous Users

Enable anonymous sign-ups:

1. **Authentication → Providers → Anonymous**
2. Enable the provider

---

## Testing Authentication

### 1. Test Email/Password

Using Supabase JS client:

```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'securepassword123'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'securepassword123'
});

// Sign out
await supabase.auth.signOut();
```

### 2. Test OAuth

```javascript
// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
});

// GitHub OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});
```

### 3. Test Password Reset

```javascript
// Request password reset
const { data, error } = await supabase.auth.resetPasswordForEmail(
  'user@example.com'
);

// Update password with token
const { data, error } = await supabase.auth.updateUser({
  password: 'newpassword123'
});
```

### 4. Test JWT Tokens

In Supabase SQL editor:

```sql
-- Get auth info
SELECT
  id,
  email,
  (auth.jwt() ->> 'role') as user_role,
  auth.jwt()::text as full_jwt
FROM auth.users
WHERE id = auth.uid();
```

---

## Frontend Integration

### Setup Supabase Client

**Frontend/src/lib/supabase.ts** (or similar):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Setup Environment Variables

**Frontend/.env.local**:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=http://localhost:8000
```

### Authentication Context

**Frontend/src/context/AuthContext.tsx** (example):

```typescript
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as string) || 'user'
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as string) || 'user'
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Protected Routes

```typescript
// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) return <Navigate to="/login" />;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}
```

---

## Security Best Practices

### 1. Environment Variables
- Never commit secrets to version control
- Use `.env.local` for development
- Use environment secrets in production

### 2. Token Storage
- Store tokens in httpOnly cookies (server-side)
- Or secure session storage with short expiration
- Never store in localStorage (XSS vulnerability)

### 3. CORS Configuration
In Supabase **Settings → API → CORS**:

```json
{
  "allowed_origins": [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com"
  ]
}
```

### 4. Rate Limiting
- Enable rate limiting for login attempts
- Implement CAPTCHA for signup
- Monitor suspicious activity

### 5. Email Verification
- Always verify emails before granting access
- Implement re-verification for security changes
- Use double opt-in for newsletters

### 6. Session Management
- Implement logout on app/browser close
- Refresh tokens automatically
- Clear cache on logout

---

## Troubleshooting

### Issue: "Invalid JWT"
- Check token expiration
- Verify API key is correct
- Ensure JWT is passed in Authorization header: `Bearer {token}`

### Issue: "Unauthorized"
- Check RLS policies allow the operation
- Verify user role matches required role
- Ensure JWT contains correct claims

### Issue: "Email not confirmed"
- User needs to click confirmation email link
- Resend confirmation email in settings
- Check email filter/spam folder

### Issue: "OAuth redirect failed"
- Verify redirect URL matches Supabase settings
- Check OAuth app credentials are correct
- Ensure HTTPS for production

---

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [JWT.io - Debug Tokens](https://jwt.io/)
- [Supabase RLS Examples](https://supabase.com/docs/guides/realtime/security-rules)
- [OAuth 2.0 Specification](https://datatracker.ietf.org/doc/html/rfc6749)
