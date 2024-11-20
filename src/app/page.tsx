import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import Link from 'next/link'
import Introduction from '@/components/home/Introduction'

export default function HomePage() {
  return (
    <main>
      <section className="py-16 md:pt-24 lg:pt-32">
        <div className="container flex max-w-screen-lg flex-col items-center gap-4 text-center">
          <h1 className="animate-slideInFromLeft leading-loose font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl py-2">
            <span className='text-primary'>Balance</span> your <span className='text-primary'>Bills</span> with Friends, Roomates and Family
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Welcome to Balance Buddies! A simple way to keep track of shared expenses and split bills with friends, roommates, and family.
          </p>
          <div className="flex gap-2 animate-slideInFromBottom">
            <Button asChild>
              <Link href="/groups">Balance Bills</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="https://github.com/QingyueC/Balance-Buddies">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Link>
            </Button>
          </div>
          <Introduction />
        </div>
      </section>
    </main>
  )
}
