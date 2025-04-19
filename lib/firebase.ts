import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, enableIndexedDbPersistence, doc, setDoc } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let app
let db

try {
  // Check if Firebase is already initialized
  if (typeof window !== "undefined") {
    console.log("Initializing Firebase with config:", {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    })

    // Initialize Firebase only on the client side
    if (!globalThis.firebase) {
      app = initializeApp(firebaseConfig)
      db = getFirestore(app)
      globalThis.firebase = { app, db }

      // Enable offline persistence when possible
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === "failed-precondition") {
          console.warn("Persistence failed - multiple tabs open")
        } else if (err.code === "unimplemented") {
          console.warn("Persistence not available in this browser")
        }
      })
    } else {
      console.log("Firebase already initialized, reusing instance")
      app = globalThis.firebase.app
      db = globalThis.firebase.db
    }
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

// Passwords for read and write access
// In a real app, these would be stored securely in Firestore
const PASSWORDS = {
  read: "ABIN1john",
  write: "THEPOTATO@006",
}

// Interface for entry data
interface EntryData {
  name: string
  message: string
  signature: string
  timestamp: string
}

// Save a new entry to Firestore with better error handling
export async function saveEntry(entryData: EntryData) {
  if (!db) {
    console.error("Firebase not initialized")
    throw new Error("Firebase not initialized. Make sure your environment variables are set correctly.")
  }

  try {
    console.log("Attempting to save entry to Firestore...", {
      name: entryData.name,
      hasSignature: !!entryData.signature,
    })

    // Create a unique ID for the entry based on timestamp
    const entryId = `entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    // Use setDoc with a specific document ID instead of addDoc
    const entriesCollection = collection(db, "entries")
    const docRef = doc(entriesCollection, entryId)

    await setDoc(docRef, {
      ...entryData,
      id: entryId, // Include the ID in the document data
    })

    console.log("Document written with ID:", entryId)
    return entryId
  } catch (error: any) {
    console.error("Error adding document:", error)

    // More detailed error information
    if (error.code === "permission-denied") {
      console.error("Firebase permission denied. Please check your Firestore rules.")
      throw new Error("Firebase permission denied. Please check your Firestore rules.")
    } else {
      throw error
    }
  }
}

// Get all entries from Firestore with better error handling
export async function getEntries() {
  if (!db) {
    console.error("Firebase not initialized")
    throw new Error("Firebase not initialized. Make sure your environment variables are set correctly.")
  }

  try {
    console.log("Fetching entries from Firestore...")
    const entriesCollection = collection(db, "entries")
    const querySnapshot = await getDocs(entriesCollection)
    const entries: any[] = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      entries.push({
        id: doc.id,
        ...data,
      })
    })

    console.log(`Retrieved ${entries.length} entries`)

    // Sort entries by timestamp (newest first)
    return entries.sort((a, b) => {
      // Handle cases where timestamp might be missing
      if (!a.timestamp) return 1
      if (!b.timestamp) return -1
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  } catch (error) {
    console.error("Error getting documents:", error)
    throw error
  }
}

// Verify password for read or write access
export async function verifyPassword(mode: "read" | "write", password: string) {
  // In a real app, you would verify against passwords stored in Firestore
  // For this example, we're using hardcoded passwords
  return password === PASSWORDS[mode]
}

// Initialize Firestore with sample data if needed
export async function initializeFirestoreWithSampleData() {
  if (!db) {
    console.error("Cannot initialize sample data: Firebase not initialized")
    return
  }

  try {
    // Check if we already have entries
    const entriesCollection = collection(db, "entries")
    const querySnapshot = await getDocs(entriesCollection)

    if (querySnapshot.size === 0) {
      console.log("No entries found, adding sample data...")

      // Add a sample entry
      const sampleEntry = {
        name: "Sample User",
        message: "This is a sample entry to test the diary functionality.",
        signature:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==",
        timestamp: new Date().toISOString(),
      }

      await saveEntry(sampleEntry)
      console.log("Sample entry added successfully")
    }
  } catch (error) {
    console.error("Error initializing Firestore with sample data:", error)
  }
}

// Call this function to initialize sample data
if (typeof window !== "undefined") {
  // Only run in browser environment
  window.addEventListener("load", () => {
    // Delay initialization to ensure Firebase is ready
    setTimeout(() => {
      initializeFirestoreWithSampleData()
    }, 2000)
  })
}
