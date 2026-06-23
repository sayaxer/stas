import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { signIn, signUp, signOut } from "../lib/supabaseQueries.js";

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setReady(true);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email, password) => {
    return await signIn(email, password);
  };

  const handleSignUp = async (email, password) => {
    return await signUp(email, password);
  };

  const handleSignOut = async () => {
    await signOut();
    setSession(null);
  };

  return {
    session,
    ready,
    user: session?.user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };
};
