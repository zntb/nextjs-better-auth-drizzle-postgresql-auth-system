// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth-actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }

  // Redirect to home if not admin
  if (user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='border-b bg-card'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <h1 className='text-xl font-bold text-foreground'>Admin Panel</h1>
              <div className='hidden md:block text-sm text-muted-foreground'>
                Welcome back, {user.name || user.email}
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='text-sm text-muted-foreground'>
                Role: <span className='font-medium text-foreground'>Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex'>
        {/* Admin Sidebar */}
        <aside className='w-64 bg-card border-r min-h-[calc(100vh-4rem)]'>
          <nav className='p-4 space-y-2'>
            <AdminNavItem href='/admin' icon='📊' label='Dashboard' />
            <AdminNavItem href='/admin/users' icon='👥' label='Users' />
            <AdminNavItem href='/admin/sessions' icon='🔑' label='Sessions' />
            <AdminNavItem href='/admin/analytics' icon='📈' label='Analytics' />
            <AdminNavItem href='/admin/settings' icon='⚙️' label='Settings' />
          </nav>
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-6'>{children}</main>
      </div>
    </div>
  );
}

function AdminNavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className='flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors'
    >
      <span className='text-lg'>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
