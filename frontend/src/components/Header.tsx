
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

import { useAuth } from "../context/useAuth";
import NavigationLink from "./shared/NavigationLink";

const Header = () => {
  const auth = useAuth();
  return (
    <AppBar
      sx={{ bgcolor: "transparent", position: "static", boxShadow: "none" }}
    >
      <Toolbar sx={{ display: "flex" }}>
        <h3 style={{color:"white",fontSize:"24px"}}>DSA Tutor</h3>
        <div>
          {auth?.isLoggedIn ? (
            <>
              <NavigationLink
                bg="#B0BEC5"
                to="/chat"
                text="Go To Chat"
                textColor="black"
              />
              <NavigationLink
                bg="#7C4DFF"
                to="/complexity"
                text="Complexity Calculator"
                textColor="#DBD8E3"
              />
              <NavigationLink
                bg="#51538f"
                textColor="#DBD8E3"
                to="/"
                text="logout"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
              <NavigationLink
                bg="#B0BEC5"
                to="/login"
                text="Login"
                textColor="black"
              />
              <NavigationLink
                bg="#51538f"
                textColor="#DBD8E3"
                to="/signup"
                text="Signup"
              />
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
