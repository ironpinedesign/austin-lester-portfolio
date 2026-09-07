'use client';

import {useId, useState} from 'react';
import Link from './SiteLink';

type NavLink = {
 href: string;
 label: string;
};

type SiteNavigationProps = {
 links: NavLink[];
};

export default function SiteNavigation({links}: SiteNavigationProps) {
 const [open, setOpen] = useState(false);
 const menuId = useId();

 return (
  <>
   <button
    type="button"
    className="nav-toggle"
    aria-expanded={open}
    aria-controls={menuId}
    aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
    onClick={() => setOpen((value) => !value)}
   >
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span aria-hidden="true" />
   </button>
   <nav id={menuId} aria-label="Main navigation" className={open ? 'is-open' : undefined}>
    {links.map((link) => (
     <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
      {link.label}
     </Link>
    ))}
   </nav>
  </>
 );
}
