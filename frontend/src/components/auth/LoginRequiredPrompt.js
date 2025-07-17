"use client";

import { Button, Modal } from "antd";
import {
  authReducer,
  authSelector,
  handleToggleLoginRequiredPrompt,
} from "@/services/redux/Slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

const LoginRequiredPrompt = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, isShowLoginRequiredPrompt } =
    useSelector(authSelector);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    dispatch(handleToggleLoginRequiredPrompt());
    setIsModalOpen(false);
    router.push("/login");
  };
  const handleCancel = () => {
    dispatch(handleToggleLoginRequiredPrompt());
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (isShowLoginRequiredPrompt) {
      showModal();
    }
  }, [isShowLoginRequiredPrompt]);
  if (isAuthenticated) return null;
  return (
    <>
      <Modal
        title="Vui lòng đăng nhập để sử dụng chức năng này."
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      ></Modal>
    </>
  );
};

export default LoginRequiredPrompt;
