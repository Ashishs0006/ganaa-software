// import welcomeImg from "@/assets/images/welcome.png";
import welcomeImg from "@/assets/images/Asset selection-cuate (1).svg";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InValidScreen = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.clear();
    setTimeout(() => {
      navigate("/auth/login");
    }, 10000);
  }, []);

  return (
    <div
      id="welcome-page"
      className="min-h-screen w-full bg-cover bg-[#F5F4EA] bg-center flex-col bg-no-repeat flex items-center justify-center p-2 sm:p-0"
    >
      <div className="logo flex items-center justify-center">
        <img className="w-80 h-auto" alt="welcome" src={welcomeImg} />
      </div>

      <p className="text-center font-elmessiri  text-3xl mb-2">Welcome to Ganaa</p>

      <p className="text-center font-elmessiri text-[#575F4A] font-medium text-xl mb-2">
        This application is designed exclusively for desktop use.
      </p>
      <p className="text-center font-elmessiri text-[#575F4A] font-medium text-xl mb-2">
        For Security Reasons You will automatically logged out in 10 seconds. Please sign in again
        from your desktop device.
      </p>
    </div>
  );
};

export default InValidScreen;
