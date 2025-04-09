import Link from 'next/link';

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="hover:text-primary">
      {children}
    </Link>
  );
}