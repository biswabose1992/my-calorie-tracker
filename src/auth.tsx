// Example: Add to App.tsx or a new AuthProvider
import { useEffect, useState } from "react";
import { auth, provider } from "./firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";

function GoogleAuthButton() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, setUser);
        return () => unsub();
    }, []);

    if (user) {
        return (
            <div>
                <span>Welcome, {user.displayName || user.email}!</span>
                <button onClick={() => signOut(auth)}>Sign Out</button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signInWithPopup(auth, provider)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
        >
            Sign in with Google
        </button>
    );
}

export default GoogleAuthButton;