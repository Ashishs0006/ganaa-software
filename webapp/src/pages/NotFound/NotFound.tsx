import { useNavigate } from "react-router-dom";
import welcomeImg from "@/assets/images/welcome.png";
import { Button } from "@/components";
  
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      id="Comming-Soon"
      className="min-h-screen w-full bg-cover bg-[#F5F4EA] bg-center flex-col bg-no-repeat flex items-center justify-center p-2 sm:p-0"
    >
      <div className="logo flex items-center justify-center">
        <img className="w-80 h-auto" alt="welcomeimg" src={welcomeImg} />
      </div>

      <p className="text-center font-elmessiri font-semibold text-3xl mb-2">404</p>
      <p className="text-center text-3xl mb-4">Page Not Found</p>

      <Button onClick={() => navigate("/")} className="!font-semibold !text-xs" variant="contained">
        Home
      </Button>
    </div>
  );
};

export default NotFound;
