import React, { useState, useEffect, useCallback } from "react";

let logoutTimer;

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

// calculating remaing time till token expires after login
const calculateRemaningTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTIme = new Date(expirationTime).getTime();
  const remainingDuration = adjExpirationTIme - currentTime;
  return remainingDuration;
};

const retriveStoredToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedExpirationDate = localStorage.getItem("expirationTime");

  const remainingTime = calculateRemaningTime(storedExpirationDate);

  if (remainingTime <= 6000) {
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

// To be wrapped around the parent root file (index.js)
export const AuthContextProvider = (props) => {
  const tokenData = retriveStoredToken();
  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token; // getting token from localstorage
  }

  const [token, setToken] = useState(initialToken);

  // Converts the truty or falsey values into boolean true or false
  const userIsLoggedIn = !!token;

  // Logout function
  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expirationTime");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  // Login function
  const loginHandler = (token, expirationTime) => {
    localStorage.setItem("token", token);
    localStorage.setItem("expirationTime", expirationTime);
    setToken(token);

    const remaingTime = calculateRemaningTime(expirationTime);
    logoutTimer = setTimeout(logoutHandler, remaingTime);
  };

  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
