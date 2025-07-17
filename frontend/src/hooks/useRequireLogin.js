import {
  authSelector,
  handleToggleLoginRequiredPrompt,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";

export const useRequireLogin = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(authSelector);

  return (callback) => {
    if (isAuthenticated) {
      callback();
    } else {
      dispatch(handleToggleLoginRequiredPrompt());
    }
  };
};
