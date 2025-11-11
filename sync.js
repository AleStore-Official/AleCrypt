window.syncAleCrypt = async function () {
  if (typeof supabase === "undefined" || !supabase.createClient) {
    console.warn("Supabase not initialized.");
    return;
  }

  const client = supabase.createClient(
    "https://anfgsrtcbpvaihrtqnlv.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  );

  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.warn("No userId found in localStorage.");
    return;
  }

  async function syncBlocks() {
    try {
      const { data } = await client.from("blocchi").select("*").eq("id", userId).limit(1);
      if (data?.length) {
        localStorage.setItem(`blocked:${userId}`, JSON.stringify(data[0]));
      } else {
        localStorage.removeItem(`blocked:${userId}`);
      }
    } catch (err) {
      console.error("Error fetching blocks:", err);
    }
  }

  async function syncMessages() {
    try {
      const { data } = await client
        .from("messaggi")
        .select("*")
        .eq("user_id", userId)
        .order("data", { ascending: false })
        .limit(10);

      if (data) {
        for (const msg of data) {
          if (!msg.id || !msg.contenuto) continue;
          const key = `🔑${msg.id}`;
          const payload = {
            cipher: msg.contenuto,
            hash: msg.id,
            expires: msg.scadenza || null,
            timestamp: msg.data || new Date().toISOString()
          };
          localStorage.setItem(key, JSON.stringify(payload));
        }
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  async function syncUserProfile() {
    try {
      const { data } = await client.from("utenti").select("*").eq("id", userId).limit(1);
      if (data?.length) {
        const user = data[0];
        localStorage.setItem(`user:${userId}`, JSON.stringify(user));
        if (user.stato) localStorage.setItem("userStatus", user.stato);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  }

  await Promise.all([syncBlocks(), syncMessages(), syncUserProfile()]);
};