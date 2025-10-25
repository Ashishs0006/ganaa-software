import Button from "../Button/Button";
import Modal from "../Modal/Modal";

const DeleteConfirm = ({
  toggleModal,
  isModalOpen,
  confirmDeleteNote,
  btn2 = "Yes, Delete",
  title = "Are you sure you want to Delete?"
}: {
  toggleModal: () => void;
  isModalOpen: boolean;
  btn2?: string;
  title?: string;
  confirmDeleteNote: () => void;
}) => {
  return (
    <div>
      <Modal isOpen={isModalOpen} toggleModal={toggleModal}>
        <div className="w-[376px] px-6 py-5">
          <p className="text-[15px] font-bold mb-[11px]">Are You Sure?</p>

          <p className="text-[13px] font-medium text-[#535353] mb-10">{title}</p>

          <div className="w-full flex gap-x-5 items-center justify-center">
            <Button
              className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
              variant="outlined"
              size="base"
              onClick={toggleModal}
            >
              Cancel
            </Button>

            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={confirmDeleteNote}
            >
              {btn2}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteConfirm;
