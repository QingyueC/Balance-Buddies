import Video from './Video'
import React from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Introduction() {
    return (
        <div className='animate-slideInFromBottom'>
            <h1 className='animate-slideInFromLeft mt-24 italic leading-loose font-bold sm:text-xl md:text-2xl lg:text-3xl py-2'>
                About <span className='text-primary'>Balance Buddies</span>
            </h1>
            <div className='grid grid-cols-3 items-center justify-center'>
                <div className='col-span-1 flex flex-col space-y-4'>
                    <h3 className='leading-loose font-bold sm:text-xl py-2'>What we do?</h3>
                    <span>Balance Buddies aims to address the common challenge that flatmates and roommates face when splitting shared expenses, 
                        especially when bills contain multiple items purchased by different individuals. 
                    </span>
                    <div>
                    <Button asChild>
                        <Link href="https://docs.google.com/document/d/1BK4ptFwLC1zUDNRLu9eMYdZNUJ9PVIEKqmIu2hejXIs/edit?tab=t.0">More...</Link>
                    </Button>
                    </div>
                </div>
                <div className='col-span-2 flex flex-col items-center mt-12 '>
                    <h2 className="leading-loose font-bold sm:text-xl py-2">How to Implement the
                        Bill Split?
                    </h2>
                    <Video />
                </div>
            </div>
        </div>
    )
}
