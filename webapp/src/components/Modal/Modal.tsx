import { useState } from "react";

import { ModalProps } from "@/components/Modal/types";

const Modal = ({ children, button, crossIcon = false, toggleModal, isOpen }: ModalProps) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isModalOpen = isOpen !== undefined ? isOpen : internalIsOpen;

  const handleToggleModal = () => {
    if (toggleModal) {
      toggleModal();
    } else {
      setInternalIsOpen((prev) => !prev);
    }
  };

  return (
    <div id="Modal">
      <div onClick={handleToggleModal} className="cursor-pointer">
        {button}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full  bg-[#00000045]">
          <div
            className="relative w-fit bg-white rounded-2xl shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {crossIcon && (
              <div
                className="absolute bg-primary-dark p-1 rounded-[6px] top-3 z-10 right-3 cursor-pointer"
                onClick={handleToggleModal}
              >
                <svg
                  className="w-3 h-3  text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </div>
            )}
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export default Modal;
