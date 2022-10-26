
// We are going to create a component and expect a prop about who
// ever the user is. So, that it can show different screen based on the user.

// In order to display a link in nextJS we do not just put in the anchor tag. 
// Instead we use a custom component created by nextJS.

import Link from 'next/link';



const Header = ( { currentUser } ) => {

  const links = [
    !currentUser && {
      label: 'Sign Up', href: '/auth/signup'
    },
    !currentUser && {
      label: 'Sign In', href: '/auth/signin'
    },
    currentUser && {
      label: 'Sell Tickets', href: '/tickets/new'
    },
    currentUser && {
      label: 'My Orders', href: '/orders'
    },
    currentUser && {
      label: 'Sign Out', href: '/auth/signout'
    }
  ]
  .filter(linkConfig => linkConfig)
  .map(({ label, href}) => {
    return <li key={href} className="nav-item">
      <Link href={href}>
        <a className="nav-link">
        {label}
        </a>
      </Link>
      
    </li>
  });
  return <nav className="navbar navbar-light bg-light">
    <Link href="/">
      <a className="navbar-brand">GitTix</a>
    </Link>

    <div className="d-flex justify-content-end">
      <ul className="nav d-flex align-items-center">
        { links }
      </ul>

    </div>
  </nav>
};

export default Header;