// components/navbar.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, Search, User, Settings, LogOut } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import Image from 'next/image';

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Get authentication state from better-auth
  const { data: session, isPending } = useSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user as User;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  // Close user menu when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <nav className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center space-x-2'>
              <div className='h-8 w-8 bg-primary rounded-lg flex items-center justify-center'>
                <span className='text-primary-foreground font-bold text-lg'>
                  A
                </span>
              </div>
              <span className='font-bold text-xl'>AuthApp</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:block'>
            <div className='ml-10 flex items-baseline space-x-4'>
              <Link
                href='/'
                className='text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Home
              </Link>
              <Link
                href='/about'
                className='text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                About
              </Link>
              <Link
                href='/features'
                className='text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Features
              </Link>
              <Link
                href='/contact'
                className='text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors'
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className='hidden md:block flex-1 max-w-xs mx-8'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
              <Input
                type='search'
                placeholder='Search...'
                className='pl-10 bg-muted/50'
              />
            </div>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className='hidden md:block'>
            {isAuthenticated ? (
              <div className='relative' ref={userMenuRef}>
                <Button
                  variant='ghost'
                  onClick={toggleUserMenu}
                  className='flex items-center space-x-3 hover:bg-accent/50 px-4 py-3 rounded-lg transition-all'
                  disabled={isPending}
                >
                  <div className='h-9 w-9 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-sm overflow-hidden'>
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={36}
                        height={36}
                        className='object-cover'
                      />
                    ) : (
                      <User className='h-5 w-5 text-primary-foreground' />
                    )}
                  </div>
                  <div className='flex flex-col items-start'>
                    <span className='text-sm font-semibold leading-tight'>
                      {user?.name || user?.email || 'User'}
                    </span>
                    <span className='text-xs text-muted-foreground leading-tight'>
                      {user?.email || 'No email'}
                    </span>
                  </div>
                </Button>

                {isUserMenuOpen && (
                  <div className='absolute right-0 mt-2 w-64 bg-popover border rounded-xl shadow-lg py-2 z-50 animate-in slide-in-from-top-2'>
                    <div className='px-4 py-3 border-b bg-muted/30'>
                      <p className='text-sm font-semibold'>
                        {user?.name || user?.email || 'User'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.email || 'No email available'}
                      </p>
                    </div>
                    <div className='py-2'>
                      <Link
                        href='/profile'
                        className='flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-accent transition-colors group'
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className='h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors'>
                          <User className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium'>Profile</p>
                          <p className='text-xs text-muted-foreground'>
                            Manage your account settings
                          </p>
                        </div>
                      </Link>
                      <Link
                        href='/settings'
                        className='flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-accent transition-colors group'
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <div className='h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors'>
                          <Settings className='h-4 w-4 text-primary' />
                        </div>
                        <div>
                          <p className='font-medium'>Settings</p>
                          <p className='text-xs text-muted-foreground'>
                            App preferences & configuration
                          </p>
                        </div>
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          href='/admin'
                          className='flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-accent transition-colors group'
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className='h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 transition-colors'>
                            <span className='text-purple-600 text-sm font-bold'>
                              A
                            </span>
                          </div>
                          <div>
                            <p className='font-medium'>Admin Panel</p>
                            <p className='text-xs text-muted-foreground'>
                              Manage users & system
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                    <div className='border-t py-2'>
                      <button
                        className='flex items-center w-full px-4 py-3 text-sm text-popover-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group'
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          try {
                            await signOut();
                          } catch (error) {
                            console.error('Error signing out:', error);
                          }
                        }}
                      >
                        <div className='h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-destructive/20 transition-colors'>
                          <LogOut className='h-4 w-4 text-destructive' />
                        </div>
                        <div className='text-left'>
                          <p className='font-medium'>Sign out</p>
                          <p className='text-xs text-muted-foreground group-hover:text-destructive/80'>
                            Logout from your account
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='flex items-center space-x-3'>
                <Button
                  variant='ghost'
                  className='font-medium hover:bg-accent/50'
                  asChild
                >
                  <Link href='/login'>Sign In</Link>
                </Button>
                <Button
                  className='font-medium shadow-sm hover:shadow-md transition-shadow'
                  asChild
                >
                  <Link href='/register'>Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleMenu}
              aria-label='Toggle menu'
            >
              {isMenuOpen ? (
                <X className='h-6 w-6' />
              ) : (
                <Menu className='h-6 w-6' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden'>
            <div className='px-2 pt-2 pb-3 space-y-1 border-t bg-background'>
              <Link
                href='/'
                className='text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href='/about'
                className='text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href='/features'
                className='text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href='/contact'
                className='text-foreground/80 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium'
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              {/* Mobile Search */}
              <div className='px-3 py-2'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                  <Input
                    type='search'
                    placeholder='Search...'
                    className='pl-10'
                  />
                </div>
              </div>

              {/* Mobile Auth Buttons */}
              <div className='px-3 py-2 space-y-2'>
                {isAuthenticated ? (
                  <div className='space-y-3 pt-4 border-t'>
                    <div className='px-3 py-2 bg-muted/30 rounded-lg mx-3'>
                      <p className='text-sm font-semibold'>
                        {user?.name || user?.email || 'User'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {user?.email || 'No email available'}
                      </p>
                    </div>
                    <Link
                      href='/profile'
                      className='flex items-center px-3 py-3 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md mx-3 transition-colors'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className='h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3'>
                        <User className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Profile</p>
                        <p className='text-xs text-muted-foreground'>
                          Manage your account
                        </p>
                      </div>
                    </Link>
                    <Link
                      href='/settings'
                      className='flex items-center px-3 py-3 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md mx-3 transition-colors'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className='h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3'>
                        <Settings className='h-4 w-4 text-primary' />
                      </div>
                      <div>
                        <p className='font-medium'>Settings</p>
                        <p className='text-xs text-muted-foreground'>
                          App preferences
                        </p>
                      </div>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href='/admin'
                        className='flex items-center px-3 py-3 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md mx-3 transition-colors'
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className='h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3'>
                          <span className='text-purple-600 text-sm font-bold'>
                            A
                          </span>
                        </div>
                        <div>
                          <p className='font-medium'>Admin Panel</p>
                          <p className='text-xs text-muted-foreground'>
                            Manage users & system
                          </p>
                        </div>
                      </Link>
                    )}
                    <button
                      className='flex items-center w-full px-3 py-3 text-foreground/80 hover:text-destructive hover:bg-destructive/10 rounded-md mx-3 transition-colors text-left'
                      onClick={async () => {
                        setIsMenuOpen(false);
                        try {
                          await signOut();
                        } catch (error) {
                          console.error('Error signing out:', error);
                        }
                      }}
                    >
                      <div className='h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center mr-3'>
                        <LogOut className='h-4 w-4 text-destructive' />
                      </div>
                      <div>
                        <p className='font-medium'>Sign out</p>
                        <p className='text-xs text-muted-foreground'>
                          Logout from account
                        </p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link href='/login' onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button className='w-full' asChild>
                      <Link
                        href='/register'
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
