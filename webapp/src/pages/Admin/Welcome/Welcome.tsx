import welcomeImg from "@/assets/images/welcome.png";

const Welcome = () => {
  return (
    <div
      id="welcome-page"
      className="min-h-[calc(100vh-64px)] w-full bg-cover bg-[#F5F4EA] bg-center flex-col bg-no-repeat flex items-center justify-center p-2 sm:p-0"
    >
      <div className="logo flex items-center justify-center">
        <img className="w-80 h-auto" alt="welcome" src={welcomeImg} />
      </div>

      <p className="text-center font-elmessiri  text-3xl mb-2">Welcome to Ganaa</p>

      <p className="text-center font-elmessiri text-[#575F4A] font-medium text-5xl mb-2">
        Healing Minds with Heart
      </p>
    </div>
  );
};

export default Welcome;
