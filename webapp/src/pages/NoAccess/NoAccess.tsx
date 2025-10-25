import welcomeImg from "@/assets/images/welcome.png";
import { Button } from "@/components";
import { useAuth } from "@/providers/AuthProvider";

const NoAccess = () => {
  const { logout } = useAuth();

  return (
    <div
      id="Comming-Soon"
      className="min-h-screen w-full bg-cover bg-[#F5F4EA] bg-center flex-col bg-no-repeat flex items-center justify-center p-2 sm:p-0"
    >
      <div className="logo flex items-center justify-center">
        <img className="w-80 h-auto" alt="welcomeimg" src={welcomeImg} />
      </div>

      <p className="text-center font-elmessiri font-semibold text-3xl mb-2">No Access</p>
      <p className="text-center text-3xl mb-4">Contact to Administration!</p>

      <Button onClick={logout} className="!font-semibold !text-xs" variant="contained">
        Logout
      </Button>
    </div>
  );
};

export default NoAccess;
