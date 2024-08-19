import { useContext } from "react";
import { AppContext } from "../context/AppContext";

export default function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      `Make sure to wrap components with AppProvider`,
    );
  }
  return context
}
