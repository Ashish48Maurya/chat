import React from 'react'

export default function Loading() {
    return (
        <div className='flex justify-center items-center my-auto'>
            <span className="loading loading-infinity loading-lg"></span>
            <div className=' text-orange-500'>Loading...</div>
        </div>
    )
}
