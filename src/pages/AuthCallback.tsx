import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // 1) Magic link / passwordless (tokens in the hash)
        // Handle hashes that may contain a path, e.g. '#/auth?access_token=...'
        const rawHash = window.location.hash.replace(/^#/, "");
        let hashQuery = rawHash;
        if (rawHash.includes("?")) {
          // split off any leading path before the ?
          hashQuery = rawHash.split("?").slice(1).join("?");
        }
        const hashParams = new URLSearchParams(hashQuery);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (error) throw error;
          navigate("/", { replace: true });
          return;
        }

        // 2) OAuth (code may appear in hash or query string depending on provider)
        // check hash first (for providers that redirect to '#/auth?code=...')
        const codeFromHash = hashParams.get("code");
        if (codeFromHash) {
          const { error } = await supabase.auth.exchangeCodeForSession(codeFromHash);
          if (error) throw error;
          navigate("/", { replace: true });
          return;
        }

        // fallback to search params (e.g. '?code=...')
        const qs = new URLSearchParams(window.location.search);
        const code = qs.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code as string);
          if (error) throw error;
          navigate("/", { replace: true });
          return;
        }

        // 3) Nothing to process — go home
        navigate("/", { replace: true });
      } catch (e) {
        console.error("Auth callback error:", e);
        navigate("/", { replace: true });
      }
    })();
  }, [navigate]);

  return <div className="p-6 text-lg">Signing you in…</div>;
}
