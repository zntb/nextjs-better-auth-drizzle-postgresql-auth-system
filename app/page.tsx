import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='relative py-20 lg:py-32'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-8'>
              <div className='space-y-4'>
                <h1 className='text-4xl lg:text-6xl font-bold tracking-tight'>
                  Secure Authentication
                  <span className='text-primary block'>Made Simple</span>
                </h1>
                <p className='text-xl text-muted-foreground max-w-lg'>
                  Build robust user authentication with our modern, secure, and
                  developer-friendly authentication system. Get started in
                  minutes, not hours.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-4'>
                <Button size='lg' className='text-lg px-8' asChild>
                  <Link href='/register'>
                    Get Started Free
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </Link>
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='text-lg px-8'
                  asChild
                >
                  <Link href='/demo'>View Demo</Link>
                </Button>
              </div>

              <div className='flex items-center space-x-6 text-sm text-muted-foreground'>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span>Free tier available</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            <div className='relative'>
              <div className='aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8'>
                <div className='h-full w-full bg-background rounded-2xl shadow-2xl border flex items-center justify-center'>
                  <div className='text-center space-y-4'>
                    <div className='h-16 w-16 bg-primary rounded-xl mx-auto flex items-center justify-center'>
                      <Shield className='h-8 w-8 text-primary-foreground' />
                    </div>
                    <h3 className='text-xl font-semibold'>Secure by Default</h3>
                    <p className='text-muted-foreground max-w-xs'>
                      Built with industry best practices and modern security
                      standards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center space-y-4 mb-16'>
            <h2 className='text-3xl lg:text-4xl font-bold'>
              Why Choose Our Platform?
            </h2>
            <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
              Everything you need to implement secure, scalable authentication
              in your application
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card>
              <CardHeader>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Shield className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-grade security with end-to-end encryption and advanced
                  threat protection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Zap className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Optimized for performance with sub-100ms authentication
                  response times
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className='h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                  <Users className='h-6 w-6 text-primary' />
                </div>
                <CardTitle>Developer Friendly</CardTitle>
                <CardDescription>
                  Simple APIs, comprehensive documentation, and SDKs for all
                  major frameworks
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
            <div className='space-y-2'>
              <div className='text-4xl lg:text-5xl font-bold text-primary'>
                99.9%
              </div>
              <div className='text-muted-foreground'>Uptime SLA</div>
            </div>
            <div className='space-y-2'>
              <div className='text-4xl lg:text-5xl font-bold text-primary'>
                50M+
              </div>
              <div className='text-muted-foreground'>
                Authentications Monthly
              </div>
            </div>
            <div className='space-y-2'>
              <div className='text-4xl lg:text-5xl font-bold text-primary'>
                200+
              </div>
              <div className='text-muted-foreground'>Countries Supported</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-primary text-primary-foreground'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='max-w-3xl mx-auto space-y-8'>
            <h2 className='text-3xl lg:text-4xl font-bold'>
              Ready to Secure Your Application?
            </h2>
            <p className='text-xl opacity-90'>
              Join thousands of developers who trust our authentication platform
              to secure their applications and protect their users.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button
                size='lg'
                variant='secondary'
                className='text-lg px-8'
                asChild
              >
                <Link href='/register'>
                  Start Free Trial
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </Button>
              <Button
                size='lg'
                variant='outline'
                className='text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10'
                asChild
              >
                <Link href='/contact'>Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-12 bg-muted/30'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <div className='h-8 w-8 bg-primary rounded-lg flex items-center justify-center'>
                  <span className='text-primary-foreground font-bold text-lg'>
                    A
                  </span>
                </div>
                <span className='font-bold text-xl'>AuthApp</span>
              </div>
              <p className='text-muted-foreground'>
                Secure, scalable authentication for modern applications.
              </p>
              <div className='flex space-x-4'>
                <Button variant='ghost' size='icon' asChild>
                  <Link href='https://github.com'>
                    <Github className='h-4 w-4' />
                  </Link>
                </Button>
                <Button variant='ghost' size='icon' asChild>
                  <Link href='https://twitter.com'>
                    <Twitter className='h-4 w-4' />
                  </Link>
                </Button>
                <Button variant='ghost' size='icon' asChild>
                  <Link href='https://linkedin.com'>
                    <Linkedin className='h-4 w-4' />
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-muted-foreground'>
                <li>
                  <Link href='/features' className='hover:text-foreground'>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href='/pricing' className='hover:text-foreground'>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href='/security' className='hover:text-foreground'>
                    Security
                  </Link>
                </li>
                <li>
                  <Link href='/enterprise' className='hover:text-foreground'>
                    Enterprise
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Resources</h3>
              <ul className='space-y-2 text-muted-foreground'>
                <li>
                  <Link href='/docs' className='hover:text-foreground'>
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href='/api' className='hover:text-foreground'>
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href='/tutorials' className='hover:text-foreground'>
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href='/support' className='hover:text-foreground'>
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Contact</h3>
              <ul className='space-y-2 text-muted-foreground'>
                <li className='flex items-center space-x-2'>
                  <Mail className='h-4 w-4' />
                  <span>hello@authapp.com</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <Phone className='h-4 w-4' />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className='flex items-center space-x-2'>
                  <MapPin className='h-4 w-4' />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
            <p className='text-muted-foreground text-sm'>
              © 2024 AuthApp. All rights reserved.
            </p>
            <div className='flex space-x-6 mt-4 md:mt-0'>
              <Link
                href='/privacy'
                className='text-muted-foreground hover:text-foreground text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-muted-foreground hover:text-foreground text-sm'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
