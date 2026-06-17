import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  getDocFromServer
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDE_VK6Qpnjfp_0el4Gbxa92toPX84SsoI",
  authDomain: "coolspotcottage-b74d7.firebaseapp.com",
  projectId: "coolspotcottage-b74d7",
  storageBucket: "coolspotcottage-b74d7.firebasestorage.app",
  messagingSenderId: "829721479046",
  appId: "1:829721479046:web:2e922f8426aec22f8f8e07",
  measurementId: "G-BRCJWT7BNS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Error conversion guidelines implementation
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Payload: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Synchronous and initial connectivity check
async function testConnection() {
  try {
    // Attempt block check
    await getDocFromServer(doc(db, 'system_test', 'connectivity'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
testConnection();

// Auto-seed admin credentials
export async function seedAdminCredentials() {
  try {
    const adminRef = doc(db, 'admins', 'coolspot');
    const existing = await getDoc(adminRef);
    if (!existing.exists()) {
      await setDoc(adminRef, {
        username: "coolspot",
        password: "coolspot@13",
        createdAt: new Date().toISOString()
      });
      console.log("Admin account (coolspot) seeded successfully in Firestore.");
    }
  } catch (error) {
    console.error("Seeding error (this is safe if rules prevent unauthenticated seed writes):", error);
  }
}
// Run seeding instantly
seedAdminCredentials();

// Seed Glass House room to Firebase rooms collection (only if not already present)
export async function seedGlassHouseRoom() {
  try {
    const roomRef = doc(db, "rooms", "glass-house");
    const existing = await getDoc(roomRef);
    if (!existing.exists()) {
      await setDoc(roomRef, {
        id: "glass-house",
        name: "Glass House",
        ratePerNight: 5500,
        maxGuests: 2,
        roomNumbers: ["109"],
        isBundle: false,
      });
      console.log("Glass House room seeded to Firebase rooms collection.");
    }
  } catch (error) {
    console.error("Glass House seed error:", error);
  }
}
seedGlassHouseRoom();
