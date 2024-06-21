"use client"
import React from 'react'
import { useAuth } from '../context/context'
import Link from 'next/link';

export default function Hero() {
    const { user } = useAuth();
    return (
        <div className="hero min-h-screen bg-black">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-3xl font-bold">Hello <span className=' font-extrabold text-orange-500'>{user ? <>{user?.displayName}</> : <>User</>}</span></h1>
                    <p className="py-6">Transform the way you interact with your documents. Our innovative app lets you have real-time conversations with your PDFs, extracting information, summarizing content, and answering your questions instantly.</p>
                    {
                        user?.uid ?
                            <Link href={'/chat'}><button className='btn btn-primary'>Get Started</button></Link>
                            : <div>Login to Continue</div>
                    }
                </div>
            </div>
        </div>
    )
}
