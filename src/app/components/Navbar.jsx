"use client";
import React from 'react';
import { useAuth } from '../context/context';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function Navbar() {
    const { signInWithGoogle, user, isLoggedIn, logOut } = useAuth();
    const handleClick = async () => {
        try {
            await signInWithGoogle();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const logout = async () => {
        try {
            await logOut();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className='navbar bg-base-100 border-b-zinc-50'>
            <div className="flex-1">
                <Link href='/' className="btn btn-ghost text-xl font-extrabold text-stone-100">Chatify</Link>
            </div>
            <div className="flex-none">
                <Link href='/pricing' className='mx-2'>Pricing</Link>
                {isLoggedIn ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 rounded-full">
                                <img alt="Tailwind CSS Navbar component" src={user?.photoURL} />
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                            <li>
                                <a className="justify-between">Profile</a>
                            </li>
                            <li><button onClick={logout}>Logout</button></li>
                        </ul>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={handleClick}>Login</button>
                )}
            </div>
        </div>
    );
}
