import { IoIosArrowDown } from "react-icons/io";

const ScrollToTop = () => {
  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      id="scrollToTop"
      className="flex gap-2 cursor-pointer rounded-[11px] text-sm font-medium border-sm border-[#E6E6E6] bg-white w-fit items-center justify-center p-3"
      onClick={scrollToTop}
    >
      <p>Go to Top </p>
      <IoIosArrowDown className="rotate-180" size={20} />
    </div>
  );
};

export default ScrollToTop;
