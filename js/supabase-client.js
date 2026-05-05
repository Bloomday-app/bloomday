var SUPABASE_URL = 'https://oeqmqkkzbdouzxdeoenv.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcW1xa2t6YmRvdXp4ZGVvZW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MzE1MjAsImV4cCI6MjA5MzUwNzUyMH0.JLFUCbRkdgc4i-TiHJs4aaQO-8uIgjFhbgEW7vK0pXM';
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, storageKey: 'bdg16_sb_session' }
});
