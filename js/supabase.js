// Supabase Authentication & Multi-User Cloud Sync Layer
const SUPABASE_URL = 'https://sjheuthlweoansbupxmc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HXkk0eKPSM3J2iWjNPxjEw_8jsMQUJ2';

export class SupabaseService {
  constructor() {
    this.client = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      } catch (err) {
        console.warn('Supabase client initialization warning:', err);
      }
    }
  }

  getClient() {
    if (!this.client && window.supabase && typeof window.supabase.createClient === 'function') {
      this.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return this.client;
  }

  async getSession() {
    const client = this.getClient();
    if (!client) return null;
    try {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      this.currentUser = data.session?.user || null;
      return data.session;
    } catch (e) {
      console.warn('Could not fetch Supabase auth session:', e);
      return null;
    }
  }

  async signUpWithEmail(email, password, name = '') {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client is not available.');
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });
    if (error) throw error;
    this.currentUser = data.user;
    return data;
  }

  async signInWithEmail(email, password) {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client is not available.');
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    this.currentUser = data.user;
    return data;
  }

  async signInWithGoogle() {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client is not available.');
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const client = this.getClient();
    if (!client) return;
    await client.auth.signOut();
    this.currentUser = null;
  }

  onAuthStateChange(callback) {
    const client = this.getClient();
    if (!client) return () => {};
    const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      callback(event, session);
    });
    return () => subscription.unsubscribe();
  }

  async fetchUserData(userId) {
    const client = this.getClient();
    if (!client || !userId) return null;
    try {
      const { data, error } = await client
        .from('life_os_sync')
        .select('payload, updated_at')
        .eq('sync_id', `user_${userId}`)
        .maybeSingle();

      if (error) throw error;
      return data ? data.payload : null;
    } catch (e) {
      console.warn('Fetch user cloud data notice:', e);
      return null;
    }
  }

  async saveUserData(userId, payload) {
    const client = this.getClient();
    if (!client || !userId) return;
    try {
      await client
        .from('life_os_sync')
        .upsert({
          sync_id: `user_${userId}`,
          payload: payload,
          updated_at: new Date().toISOString()
        }, { onConflict: 'sync_id' });
    } catch (e) {
      console.warn('Save user cloud data notice:', e);
    }
  }

  subscribeToUserSync(userId, onUpdate) {
    const client = this.getClient();
    if (!client || !userId) return null;
    return client
      .channel(`user_sync:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'life_os_sync',
          filter: `sync_id=eq.user_${userId}`
        },
        (payload) => {
          if (payload.new && payload.new.payload) {
            onUpdate(payload.new.payload);
          }
        }
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
