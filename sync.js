window.syncAleCrypt = async function () {
  // 🔒 Aspetta che Supabase sia disponibile
  if (typeof supabase === "undefined" || !supabase.createClient) {
    console.warn("⚠️ Supabase non inizializzato.");
    return;
  }

  const client = supabase.createClient(
    'https://anfgsrtcbpvaihrtqnlv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuZmdzcnRjYnB2YWlocnRxbmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTI1NTIsImV4cCI6MjA2NzMyODU1Mn0.4tNAZ0RXc-zFFCNT8Wm6Bdo3TkhLc0Up90KxAdUhYss'
  );

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  // 🧱 Blocchi
  try {
    const { data: blocchi } = await client
      .from("blocchi")
      .select("*")
      .eq("id", userId)
      .limit(1);
    if (blocchi?.length) {
      localStorage.setItem("bloccati:" + userId, JSON.stringify(blocchi[0]));
    } else {
      localStorage.removeItem("bloccati:" + userId);
    }
  } catch (e) {
    console.warn("❌ Errore blocchi:", e);
  }

  // 📬 Messaggi
  try {
    const { data: messaggi } = await client
      .from("messaggi")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false })
      .limit(10);
    if (messaggi) {
      for (const m of messaggi) {
        const chiave = "🔑" + m.id;
        const payload = {
          cipher: m.contenuto,
          hash: m.id,
          expires: m.scadenza,
          timestamp: m.data
        };
        localStorage.setItem(chiave, JSON.stringify(payload));
      }
    }
  } catch (e) {
    console.warn("⚠️ Errore messaggi:", e);
  }

  // 👥 Utente corrente
  try {
    const { data } = await client
      .from("utenti")
      .select("*")
      .eq("id", userId)
      .limit(1);
    if (data?.length) {
      const u = data[0];
      localStorage.setItem("utenti:" + userId, JSON.stringify(u));
      localStorage.setItem("userStatus", u.stato);
    }
  } catch (e) {
    console.warn("⚠️ Errore utente:", e);
  }
};