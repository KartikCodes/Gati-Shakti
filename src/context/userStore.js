/**
 * userStore.js — Persistent User Database
 *
 * Provides a localStorage-backed user store with SHA-256 password hashing.
 * Acts as the authentication backend for the GatiShakti application.
 *
 * Storage keys:
 *   gs_users_db  — JSON array of all registered user records
 *   gs_session   — JSON object of the currently logged-in user (session)
 */

const USERS_DB_KEY = 'gs_users_db';
const SESSION_KEY = 'gs_session';

// ─── Crypto Helpers ──────────────────────────────────────────────

/**
 * Generate a random hex salt (32 hex chars = 16 bytes).
 */
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a password with a salt using SHA-256 via the Web Crypto API.
 * Returns a hex-encoded hash string.
 */
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ─── Internal DB Access ──────────────────────────────────────────

function readUsersDB() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsersDB(users) {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
}

// ─── Unique ID Generator ────────────────────────────────────────

function generateUserId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `usr_${timestamp}_${random}`;
}

// ─── Demo Account Seeding ────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { name: 'Administrator', email: 'admin@gatishakti.gov.in', password: 'admin123', department: null, isAdmin: true },
  { name: 'PWD Manager', email: 'pwd@gatishakti.gov.in', password: 'pwd123', department: 'PWD', isAdmin: false },
  { name: 'BMC Manager', email: 'bmc@gatishakti.gov.in', password: 'bmc123', department: 'BMC/AMRUT', isAdmin: false },
  { name: 'Metro Manager', email: 'metro@gatishakti.gov.in', password: 'metro123', department: 'Metro', isAdmin: false },
  { name: 'Smart City Planner', email: 'smartcity@gatishakti.gov.in', password: 'smartcity123', department: 'Smart City/NCAP', isAdmin: false }
];

/**
 * Seeds the demo accounts if they don't already exist.
 * Called once on application startup.
 */
export async function initializeStore() {
  const users = readUsersDB();
  const existingEmails = new Set(users.map((u) => u.email));

  let modified = false;

  for (const demo of DEMO_ACCOUNTS) {
    if (!existingEmails.has(demo.email)) {
      const salt = generateSalt();
      const pw = await hashPassword(demo.password, salt);
      users.push({
        id: generateUserId(),
        name: demo.name,
        email: demo.email,
        passwordHash: pw,
        salt,
        department: demo.department,
        isAdmin: demo.isAdmin,
        createdAt: new Date().toISOString()
      });
      modified = true;
    }
  }

  if (modified) {
    writeUsersDB(users);
  }
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Create a new user account.
 * @throws {Error} if email already exists
 * @returns {object} The user profile (without password/salt)
 */
export async function createUser(name, email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const users = readUsersDB();

  // Duplicate check
  const existing = users.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const salt = generateSalt();
  const pw = await hashPassword(password, salt);

  const userRecord = {
    id: generateUserId(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: pw,
    salt,
    department: null,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  users.push(userRecord);
  writeUsersDB(users);

  // Return profile (no sensitive fields)
  return toProfile(userRecord);
}

/**
 * Authenticate a user by email and password.
 * @throws {Error} if email not found or password incorrect
 * @returns {object} The user profile
 */
export async function authenticateUser(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  const users = readUsersDB();

  const userRecord = users.find((u) => u.email === normalizedEmail);
  if (!userRecord) {
    throw new Error('No account found with this email.');
  }

  const attemptHash = await hashPassword(password, userRecord.salt);
  if (attemptHash !== userRecord.passwordHash) {
    throw new Error('Incorrect password.');
  }

  return toProfile(userRecord);
}

/**
 * Look up a user by email (returns profile or null).
 */
export function getUserByEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();
  const users = readUsersDB();
  const record = users.find((u) => u.email === normalizedEmail);
  return record ? toProfile(record) : null;
}

// ─── Session Management ──────────────────────────────────────────

/**
 * Save the current session (logged-in user) to localStorage.
 */
export function saveSession(userProfile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(userProfile));
}

/**
 * Restore the saved session from localStorage.
 * @returns {object|null} The user profile or null if no session.
 */
export function restoreSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear the session (logout). Does NOT delete the user account.
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Strip sensitive fields from a user record to create a safe profile.
 */
function toProfile(record) {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    department: record.department,
    isAdmin: record.isAdmin,
    createdAt: record.createdAt
  };
}
