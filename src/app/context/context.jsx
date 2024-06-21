'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { initializeApp } from "firebase/app";
import { useRouter } from 'next/navigation';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import { getFirestore, collection, addDoc, getDocs, getDoc, doc, query, where, updateDoc, orderBy, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
export const AuthContext = createContext();

const firebaseConfig = {
    apiKey: "AIzaSyD_rIJNmpmoSZbHo1xUa-WCld_dkkz8tPQ",
    authDomain: "glowing-harmony-411318.firebaseapp.com",
    databaseURL: "https://glowing-harmony-411318-default-rtdb.firebaseio.com",
    projectId: "glowing-harmony-411318",
    storageBucket: "glowing-harmony-411318.appspot.com",
    messagingSenderId: "125127943597",
    appId: "1:125127943597:web:0a2f9ca6da7e9623376d24",
    measurementId: "G-N9483XGEEG"
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp)
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                localStorage.setItem('userId', user.uid);
                setUser(user)
            }
            else {
                setUser(null)
            }
        })
    }, [])

    const isLoggedIn = !!user;

    const logOut = async () => {
        try {
            await signOut(firebaseAuth);
            localStorage.removeItem('userId');
            setUser(null);
            toast.success("Logged out successfully");
            router.push('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await signInWithPopup(firebaseAuth, googleProvider);
            toast.success("Login Done")
            router.push('/')
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handlePost = async (fileName, fileUrl, vectorIndex) => {
        if (!fileName || !fileUrl || !vectorIndex) {
            toast.error("All Fields Are Req");
        }
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });

        try {
            const res = await addDoc(collection(firestore, "pdf"), {
                userId: user.uid,
                fileName,
                fileUrl,
                isProcessed: false,
                vectorIndex,
                timestamp: `${formattedDate} ${formattedTime}`
            })
            return res;
        }
        catch (err) {
            toast.error(err.message);
        }
    }

    const handleRes = async (id, ques, data) => {
        if (!id || !ques || !data) {
            toast.error("All Fields Are Req");
        }
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric' });

        try {
            const res = await addDoc(collection(firestore, "chat"), {
                fileId:id,
                ques,
                data,
                // timestamp: `${formattedDate} ${formattedTime}`
                timestamp: Timestamp.now(),
            })
            return res;
        }
        catch (err) {
            toast.error(err.message);
        }
    }


    const updateFile = async (Id) => {
        if (!Id) {
            toast.error("ID is required");
            return;
        }
        try {
            const updateData = {
                isProcessed: true
            };
            const docRef = doc(firestore, "pdf", Id);
            await updateDoc(docRef, updateData);
            toast.success("File Processed successfully");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const getFile = async (id) => {
        const docRef = doc(firestore, "pdf", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {

            if (docSnap.data().isProcessed) {
                toast.success("File Already Processed");
                return
            }
            // return { id: docSnap.id, ...docSnap.data() };

            const res = await fetch(`/api/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: docSnap.data().fileUrl, ind: docSnap.data().vectorIndex }),
            });
            const data = await res.json();
            if (!data.success) {
                return toast.error(data.message);
            }
            await updateFile(id);
        } else {
            toast.error("No such document!");
        }
    };


    const queryFile = async (id, ques) => {
        const docRef = doc(firestore, "pdf", id);
        console.log("QUES:", ques);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const res = await fetch(`/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Query: ques, ind: docSnap.data().vectorIndex }),
            });
            const data = await res.json();
            if (!data.success) {
                return toast.error(data.message);
            }
            return data.message
        } else {
            toast.error("No such document!");
        }
    };


    const myFiles = async () => {
        try {
            const ls = localStorage.getItem('userId');
            const collectionRef = collection(firestore, "pdf");
            const q = query(collectionRef, where("userId", "==", ls));
            const res = await getDocs(q);
            const posts = res.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return posts;
        } catch (error) {
            console.error("Error fetching posts: ", error);
            throw new Error("Failed to fetch posts");
        }
    };

    const myChat = async (id) => {
        try {
            const collectionRef = collection(firestore, "chat");
            const q = query(collectionRef, where("fileId", "==", id));
            const res = await getDocs(q);
            const posts = res.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return posts;
        } catch (error) {
            console.error("Error fetching posts: ", error);
            throw new Error("Failed to fetch posts");
        }
    };


    return (
        <AuthContext.Provider value={{ signInWithGoogle, user, handleRes, isLoggedIn, logOut, handlePost, getFile, queryFile, myFiles,myChat }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const authContextValue = useContext(AuthContext);
    if (!authContextValue) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return authContextValue;
};