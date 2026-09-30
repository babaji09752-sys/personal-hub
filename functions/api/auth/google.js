/**
 * Cloudflare Pages Function: Official Google Auth Verification
 * Verifies Google ID tokens (JWTs) using Google's official OAuth2 tokeninfo API
 * Route: /api/auth/google
 */

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const body = await request.json().catch(() => ({}));
    const credential = body.credential;

    if (!credential) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing Google credential ID token.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Google's official OAuth2 tokeninfo verification endpoint
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const googleRes = await fetch(googleVerifyUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!googleRes.ok) {
      const errorData = await googleRes.json().catch(() => ({}));
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        error: errorData.error_description || 'Google rejected the token verification.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const payload = await googleRes.json();

    // Verify token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && parseInt(payload.exp, 10) < currentTime) {
      return new Response(JSON.stringify({
        success: false,
        verified: false,
        error: 'Google ID token has expired.'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return the officially verified user profile
    const verifiedUser = {
      id: `google-${payload.sub}`,
      email: payload.email,
      name: payload.name || payload.given_name || payload.email.split('@')[0],
      avatar_url: payload.picture || '',
      email_verified: payload.email_verified === 'true' || payload.email_verified === true,
      provider: 'google',
      verified_by: 'Google Identity Services (OAuth2)',
      verified_at: new Date().toISOString()
    };

    return new Response(JSON.stringify({
      success: true,
      verified: true,
      user: verifiedUser,
      session: {
        access_token: credential,
        user: verifiedUser
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Server error during Google auth verification'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Support alias
export const onRequest = async (context) => {
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response('Method Not Allowed', { status: 405 });
};
