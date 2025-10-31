// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzKa2mov1QsIUc3_gX9Wp7vh_LZ-E_HbM",
  authDomain: "weatherdashboard-42fb9.firebaseapp.com",
  projectId: "weatherdashboard-42fb9",
  storageBucket: "weatherdashboard-42fb9.firebasestorage.app",
  messagingSenderId: "957442549843",
  appId: "1:957442549843:web:43916de4bb2b6394a4fea6",
  measurementId: "G-9NZ48EEZ91"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('✅ Logged in:', user.displayName);
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log('🚪 Logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
