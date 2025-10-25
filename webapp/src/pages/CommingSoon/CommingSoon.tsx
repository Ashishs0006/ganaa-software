import welcomeImg from "@/assets/images/welcome.png";

const CommingSoon = () => {
  return (
    <div
      id="Comming-Soon"
      className="min-h-[calc(100vh-64px)] w-full bg-cover bg-[#F5F4EA] bg-center flex-col bg-no-repeat flex items-center justify-center p-2 sm:p-0"
    >
      <div className="logo flex items-center justify-center">
        <img className="w-80 h-auto" alt="welcomeimg" src={welcomeImg} />
      </div>

      <p className="text-center font-elmessiri font-semibold text-3xl mb-2">
        Work in Progress – <span>Thanks for Your Patience!</span>
      </p>
    </div>
  );
};

export default CommingSoon;
