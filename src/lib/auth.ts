import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectUrl = makeRedirectUri({
    scheme: 'com.erichamers.gryt',
    path: 'auth/callback',
    native: 'com.erichamers.gryt://auth/callback',
  });

  console.log('redirectUrl:', redirectUrl);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === 'success') {
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return result;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
