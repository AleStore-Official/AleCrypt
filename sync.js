window.syncAleCrypt = async function () {
  // Ensure Supabase is available
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

  // Blocks
  try {
    const { data: blocks } = await client
      .from("blocchi")
      .select("*")
      .eq("id", userId)
      .limit(1);

    if (blocks?.length) {
      localStorage.setItem(`blocked:${userId}`, JSON.stringify(blocks[0]));
    } else {
      localStorage.removeItem(`blocked:${userId}`);
    }
  } catch (err) {
    console.error("Error fetching blocks:", err);
  }

  // Messages
  try {
    const { data: messages } = await client
      .from("messaggi")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false })
      .limit(10);

    if (messages) {
      for (const msg of messages) {
        const key = `🔑${msg.id}`;
        const payload = {
          cipher: msg.contenuto,
          hash: msg.id,
          expires: msg.scadenza,
          timestamp: msg.data
        };
        localStorage.setItem(key, JSON.stringify(payload));
      }
    }
  } catch (err) {
    console.error("Error fetching messages:", err);
  }

  // User profile
  try {
    const { data: userData } = await client
      .from("utenti")
      .select("*")
      .eq("id", userId)
      .limit(1);

    if (userData?.length) {
      const user = userData[0];
      localStorage.setItem(`user:${userId}`, JSON.stringify(user));
      localStorage.setItem("userStatus", user.stato);
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
};