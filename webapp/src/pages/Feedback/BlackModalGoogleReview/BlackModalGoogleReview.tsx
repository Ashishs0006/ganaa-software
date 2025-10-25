import { useLocation, useNavigate } from "react-router-dom";
import { Modal } from "@/components";
import { FcGoogle } from "react-icons/fc";
import { FaStar } from "react-icons/fa";

const BlackModalGoogleReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mapLink } = location.state || "";

  return (
    <div className="w-screen flex items-center justify-center">
      <Modal isOpen={true} toggleModal={() => console.log("hello")}>
        <div className="flex rounded-xl px-6 py-16 items-center justify-center">
          <div className="relative w-full max-w-md text-center rounded-lg">
            <h2 className="text-xl font-bold mb-4">Thank you for your valuable feedback</h2>
            <p className="mb-4 text-sm px-3 py-2 font-medium text-gray-600">
              We truly appreciate you taking the time to share your experience with us.
            </p>
            <hr className="my-4" />
            <p className="mb-4 max-w-sm mx-auto font-bold">
              If you enjoyed our service, we’d love to hear your thoughts on Google as well!
            </p>
            <div
              onClick={() => {
                window.open(mapLink, "_blank");
                navigate("/");
              }}
              className="flex py-3 mt-10 cursor-pointer items-center justify-center rounded-xl border border-[#AEAEAE] p-2 hover:shadow-md"
            >
              <FcGoogle className="text-3xl mr-5" />
              <span className="font-semibold text-gray-500"> Write a review </span>
              <div className="ml-auto flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-gray-500 mr-2" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BlackModalGoogleReview;
