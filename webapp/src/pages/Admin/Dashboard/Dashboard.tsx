import { Link, Outlet, useLocation } from "react-router-dom";
import allergiesSvg from "@/assets/images/allergies.svg";
import user from "@/assets/images/user.svg";
import homeResources from "@/assets/images/homeResources.svg";

const Dashboard = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div id="dashboard" className="flex justify-center bg-[#F4F2F0] min-h-screen py-10">
      <div className="flex justify-center items-start">
        <div className="mx-10">
          <div className="max-w-xs rounded-lg overflow-hidden border border-transparent shadow-sm">
            <div className="bg-[#E8E3DD] px-4 py-3 rounded-t-lg">
              <h2 className="text-xs font-semibold text-black">Admin Configuration Panel</h2>
            </div>
            <div className="bg-white rounded-b-lg p-4">
              <ul>
                <li>
                  <Link
                    to="/admin/dashboard/center"
                    className={`flex items-center gap-3 px-4 py-2 my-1 text-[14px] font-semibold rounded-lg ${
                      currentPath === "/admin/dashboard/center"
                        ? "text-[#3B4A0B] bg-[#E9F0C9]"
                        : "text-[#5A5A5A] hover:text-[#1E1E1E]"
                    }`}
                  >
                    <img src={homeResources} alt="HomeResource" />
                    Centers &amp; Resources
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/dashboard/allergy-medicine"
                    className={`flex items-center gap-3 px-4 py-2 my-1 text-[14px] font-semibold rounded-lg ${
                      currentPath === "/admin/dashboard/allergy-medicine"
                        ? "text-[#3B4A0B] bg-[#E9F0C9]"
                        : "text-[#5A5A5A] hover:text-[#1E1E1E]"
                    }`}
                  >
                    <img src={allergiesSvg} alt="allergies" />
                    Allergy &amp; Medicine Master List
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/dashboard/user"
                    className={`flex items-center gap-3 px-4 py-2 my-1 text-[14px] font-semibold rounded-lg ${
                      currentPath === "/admin/dashboard/user"
                        ? "text-[#3B4A0B] bg-[#E9F0C9]"
                        : "text-[#5A5A5A] hover:text-[#1E1E1E]"
                    }`}
                  >
                    <img src={user} alt="user" />
                    User Management
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default Dashboard;
