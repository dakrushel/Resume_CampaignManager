import { useAuth0 } from "@auth0/auth0-react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";

export default function Header({ showMenuFunc }) {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  return (
    <header className="m-0 fixed top-0 left-0 right-0 w-full bg-goblin-green p-3 z-10 sancreek-regular flex items-center justify-between">
      <div className="flex items-center">
        {isAuthenticated && (
          <button onClick={showMenuFunc} className="text-gold text-4xl mr-4">
            ☰
          </button>
        )}
        <NavLink to="/" className="text-gold text-4xl">
          Game Master&apos;s Familiar
        </NavLink>
      </div>
      <div>
        {isAuthenticated ? (
          <>
            <span className="text-gold mr-4">{user?.name}</span>
            <button
              onClick={() => logout({ returnTo: window.location.origin })}
              className="text-gold"
            >
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => loginWithRedirect()} className="text-gold">
            Login
          </button>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  showMenuFunc: PropTypes.func.isRequired,
};
