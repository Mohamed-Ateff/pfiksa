// Automated admin setup — run with: node setup-admin.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://qcfdhkaemwutvcdppabj.supabase.co";
const SUPABASE_KEY = "sb_publishable_ac6kYUuIkg0scOESk1BJ_g_yxd2KOvO";

const EMAIL = "boss@report.app";
const PASSWORD = "Manager@2026";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("\n=== Supabase Admin Setup ===\n");

  // ── 1. Try signing in first (in case user already exists) ──────────────
  console.log("Checking if user already exists...");
  const { data: signInData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: EMAIL,
      password: PASSWORD,
    });

  if (!signInError && signInData?.session) {
    console.log(
      "User already exists and password matches. Ensuring profile is set to manager...",
    );
    await upsertManagerProfile(signInData.user.id, EMAIL);
    printSuccess();
    return;
  }

  // ── 2. Sign up as new user ──────────────────────────────────────────────
  console.log("Creating new user:", EMAIL);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      console.log(
        "\nUser exists but wrong password. Trying original admin@company.com...",
      );
      await tryExistingUser();
      return;
    }
    console.error("Sign up failed:", signUpError.message);
    printManualFix();
    return;
  }

  if (!signUpData?.session) {
    // Email confirmation is required
    console.log("\n⚠  Email confirmation is ENABLED on your Supabase project.");
    console.log("   User was created but needs email confirmation.\n");
    console.log("   Do ONE of the following:\n");
    console.log("   Option A (takes 30 seconds):");
    console.log("   → Supabase Dashboard → Authentication → Providers → Email");
    console.log('   → Turn OFF "Confirm email" → Save\n');
    console.log("   Option B: Run this SQL in Supabase SQL Editor:");
    console.log(
      `   UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = '${EMAIL}';\n`,
    );
    console.log("   Then re-run: node setup-admin.js");
    return;
  }

  // ── 3. Session obtained — upsert profile ───────────────────────────────
  console.log("User created successfully. Setting up manager profile...");
  await upsertManagerProfile(signUpData.user.id, EMAIL);
  printSuccess();
}

async function upsertManagerProfile(userId, email) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { id: userId, name: "Boss", email, role: "manager", is_active: true },
      { onConflict: "id" },
    );

  if (error) {
    console.error("Profile upsert error:", error.message);
  } else {
    console.log("Profile set to manager ✓");
  }
}

async function tryExistingUser() {
  // Try to find any user without knowing their password
  // by checking what's in profiles
  const { data, error } = await supabase.from("profiles").select("*");
  if (!error && data?.length > 0) {
    console.log("Found profiles:", JSON.stringify(data, null, 2));
    console.log(
      "\nProfiles exist! Try logging in with the credentials shown above.",
    );
  } else {
    console.log(
      "\nNo profiles found. The admin@company.com user exists but has no profile.",
    );
    console.log("\nRun this SQL in Supabase SQL Editor:");
    console.log(`INSERT INTO public.profiles (id, name, email, role)`);
    console.log(`SELECT id, 'Boss', email, 'manager' FROM auth.users LIMIT 1`);
    console.log(`ON CONFLICT (id) DO UPDATE SET role = 'manager';`);
  }
}

function printSuccess() {
  console.log("\n✅ SUCCESS! Your login credentials are:");
  console.log("   Email:    " + EMAIL);
  console.log("   Password: " + PASSWORD);
  console.log("\n   Open http://localhost:3000 and log in!");
}

function printManualFix() {
  console.log("\nManual fix — run in Supabase SQL Editor:");
  console.log(
    `UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@company.com';`,
  );
  console.log(`INSERT INTO public.profiles (id, name, email, role)`);
  console.log(
    `SELECT id, 'Boss', email, 'manager' FROM auth.users WHERE email = 'admin@company.com'`,
  );
  console.log(`ON CONFLICT (id) DO UPDATE SET role = 'manager';`);
}

run().catch((e) => console.error("Unexpected error:", e.message));
