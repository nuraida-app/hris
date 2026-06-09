const SIGNIN_KEY = "isSignin";

export const isAuthenticated = () => {
  return localStorage.getItem(SIGNIN_KEY) === "true";
};

export const setSignIn = () => {
  localStorage.setItem(SIGNIN_KEY, "true");
};

export const setSignOut = () => {
  localStorage.removeItem(SIGNIN_KEY);
};

export const isAdminRole = (role) => {
  return role === "admin" || role === "hr_staff";
};

export const getDefaultRoute = (role) => {
  return isAdminRole(role) ? "/admin-dashboard" : "/dashboard";
};
