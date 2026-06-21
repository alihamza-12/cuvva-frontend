import { useSelector } from "react-redux";

export function useAuth() {
  const auth = useSelector((state) => state.auth);
  return {
    user: auth.user,
    status: auth.status,
    error: auth.error,
  };
}
