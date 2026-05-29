import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URL = 'com.erichamers.gryt://auth/callback';

export async function signInWithGoogle() {
  console.log('iniciando google sign in');
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  console.log('oauth result:', JSON.stringify({ url: data?.url, error }));

  if (error || !data?.url) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);
  
  console.log('browser result:', JSON.stringify(result));

  if (result.type === 'success') {
  const url = result.url;
  
  // tokens no hash (implicit flow)
  if (url.includes('access_token')) {
    const params = new URLSearchParams(url.split('#')[1]);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      await supabase.auth.setSession({ access_token, refresh_token });
    }
  } else {
    // code flow
    const code = new URL(url).searchParams.get('code');
    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }
}

  return result;
}

export async function signOut() {
  await supabase.auth.signOut();
  const keys = await AsyncStorage.getAllKeys();
  const supabaseKeys = keys.filter(k => k.includes('supabase'));
  await AsyncStorage.multiRemove(supabaseKeys);
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}