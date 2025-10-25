import { SyntheticEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import classNames from "classnames";

import { FaRegUser } from "react-icons/fa";
import { TbFileDownload } from "react-icons/tb";
import drop from "@/assets/images/dropDown.svg";

import { Button, Modal } from "@/components";
import logo from "@/assets/images/logo.png";
import logoutIcon from "@/assets/images/logout.svg";
import bell from "@/assets/images/bell.svg";

import { capitalizeFirstLetter } from "@/utils/formater";
import { ModalState } from "@/components/Header/types";
import { useAuth } from "@/providers/AuthProvider";
import { RBACGuard } from "../RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { RBACGuardArray } from "../RBACGuard/RBACGuardArray";
import { IoSettingsOutline } from "react-icons/io5";

const Header = () => {
  const navigate = useNavigate();

  const { auth, logout } = useAuth();

  const [isModalOpen, setModalOpen] = useState<ModalState>(false);

  const handleLogout = (_e: SyntheticEvent) => {
    logout();
    toast.success("Logout successfully");
    navigate("/auth/login");
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  return (
    <header
      id="header"
      className="sticky text-nowrap whitespace-nowrap shadow top-0 z-50 bg-white h-[64px] py-2 px-4 w-full "
    >
      <div className="container flex justify-between">
        <div className="flex items-center">
          <NavLink to="/admin" className="logo flex items-center px-4  justify-center">
            <img className="w-28 h-auto" src={logo} alt="Logo" />
          </NavLink>

          {/* <NavLink to="/admin/dashboard">
            <p className="font-semibold text-xs mx-2">Dashboard</p>
          </NavLink> */}
          <RBACGuardArray
            resource={[
              { resource: `${RESOURCES.DAILY_REPORT}`, action: "read" },
              { resource: `${RESOURCES.WEEKLY_REPORT}`, action: "read" },
              { resource: `${RESOURCES.INSIGHTS}`, action: "read" },
              { resource: `${RESOURCES.THERAPIST_WISE_SESSION}`, action: "read" },
              { resource: `${RESOURCES.DOCTOR_WISE_SESSION}`, action: "read" },
              { resource: `${RESOURCES.PATIENT_VITAL_REPORT}`, action: "read" }
            ]}
          >
            <div className="relative group">
              <p className="font-semibold text-xs cursor-pointer flex items-center gap-2 px-4 py-3 group-hover:bg-[#EAEEDB] rounded-lg">
                Dashboard
                <img src={drop} className="h-2 w-2 group-hover:rotate-180" />
              </p>
              <div className="hidden group-hover:flex absolute left-0  top-10   bg-transparent pt-4">
                <div className="p-2  gap-2 flex-col shadow flex justify-center bg-white  rounded-lg min-w-45">
                  <NavLink
                    className={() =>
                      classNames(
                        "text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap hover:font-bold"
                      )
                    }
                    to="/admin/daily-report-dashboard"
                  >
                    Daily Report
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/weekly-report"
                  >
                    Weekly Report
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/insights-dashboard"
                  >
                    Insights
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/therapist-wise-session"
                  >
                    Therapist Wise Session
                  </NavLink>
                  <hr />

                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/doctor-wise-session"
                  >
                    Doctor Wise Session
                  </NavLink>
                  <hr />

                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/patients-report"
                  >
                    Patients Report
                  </NavLink>
                </div>
              </div>
            </div>
          </RBACGuardArray>

          <RBACGuardArray
            resource={[
              { resource: `${RESOURCES.CREATE_LEAD}`, action: "write" },
              { resource: `${RESOURCES.QUALIFIED_LEAD}`, action: "read" },
              { resource: `${RESOURCES.DISQUALIFIED_LEAD}`, action: "read" }
            ]}
          >
            <div className="relative group">
              <p className="font-semibold text-xs cursor-pointer flex items-center gap-2 px-4 py-3 group-hover:bg-[#EAEEDB] rounded-lg">
                Leads
                <img src={drop} className="h-2 w-2 group-hover:rotate-180" />
              </p>
              <div className="hidden group-hover:flex absolute left-0  top-10   bg-transparent pt-4">
                <div className="p-2  gap-2 flex-col shadow flex justify-center bg-white  rounded-lg w-40">
                  <NavLink
                    className={() =>
                      classNames(
                        "text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap hover:font-bold"
                      )
                    }
                    to="/admin/lead/create-lead"
                  >
                    Create Lead
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/lead/qualified-leads"
                  >
                    Qualified Leads
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/lead/disqualified-leads"
                  >
                    Disqualified Leads
                  </NavLink>
                </div>
              </div>
            </div>
          </RBACGuardArray>

          <RBACGuardArray
            resource={[
              // { resource: `${RESOURCES.NEW_REGISTRATION}`, action: "write" },
              { resource: `${RESOURCES.SEARCH_EXISTING_PATIENT}`, action: "read" }
            ]}
          >
            <div className="relative group">
              <p className="font-semibold text-xs cursor-pointer flex items-center gap-2 px-4 py-3 group-hover:bg-[#EAEEDB] rounded-lg">
                Registration
                <img src={drop} className="h-2 w-2 group-hover:rotate-180" />
              </p>
              <div className="hidden group-hover:flex absolute left-0  top-10   bg-transparent pt-4">
                <div className="p-2 shadow  gap-2 flex-col flex justify-center bg-white  rounded-lg w-40">
                  {/* <NavLink
                    className={() =>
                      classNames(
                        "text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap hover:font-bold"
                      )
                    }
                    to="/admin/registration"
                  >
                    New Registration
                  </NavLink>
                  <hr /> */}
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/existing-patient"
                  >
                    Previously Registered
                  </NavLink>
                </div>
              </div>
            </div>
          </RBACGuardArray>
          <RBACGuardArray
            resource={[
              { resource: `${RESOURCES.IN_PATIENT}`, action: "read" },
              { resource: `${RESOURCES.ALL_PATIENT}`, action: "read" }
            ]}
          >
            <div className="relative group">
              <p className="font-semibold text-xs cursor-pointer flex items-center gap-2 px-4 py-3 group-hover:bg-[#EAEEDB] rounded-lg">
                Patient Data
                <img src={drop} className="h-2 w-2 group-hover:rotate-180" />
              </p>
              <div className="hidden group-hover:flex absolute left-0  top-10   bg-transparent pt-4">
                <div className="p-2 shadow gap-2 flex-col flex justify-center bg-white  rounded-lg w-40">
                  <NavLink
                    className={() =>
                      classNames(
                        "text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap hover:font-bold"
                      )
                    }
                    to="/admin/patients/in-patient"
                  >
                    Inpatient Data
                  </NavLink>
                  <hr />
                  <NavLink
                    className="text-xs cursor-pointer font-semibold p-2 hover:font-bold"
                    to="/admin/patients/all-patient"
                  >
                    All Patient Data
                  </NavLink>
                </div>
              </div>
            </div>
          </RBACGuardArray>
        </div>

        <div className="flex items-center gap-6 mr-4">
          <RBACGuard resource={RESOURCES.DOWNLOAD_SECTION} action="read">
            <Link to={"/admin/reports"} className="flex items-center gap-3">
              <TbFileDownload className=" h-5 w-5 cursor-pointer" />
              {/* <NavLink to="/admin/dashboard/user">
              <div className="flex cursor-pointer items-center justify-center gap-[3px] ">
                <IoSettingsOutline className="w-5 h-5" />
              </div>
            </NavLink> */}
            </Link>
          </RBACGuard>

          <div className="flex items-center gap-3">
            <img src={bell} className="w-5 h-5" />
            <RBACGuard resource={RESOURCES.DOWNLOAD_SECTION} action="read">
              <NavLink to="/admin/dashboard/center">
                <div className="flex cursor-pointer items-center justify-center gap-[3px] ">
                  <IoSettingsOutline className="w-5 h-5" />
                </div>
              </NavLink>
            </RBACGuard>
          </div>
          <div className="flex items-center gap-4 mr-5">
            {auth?.user?.profilePic ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#CCB69E] overflow-hidden">
                <img src={auth?.user?.profilePic} alt="Patient Pic" className="w-full h-full" />
              </div>
            ) : (
              <div className="flex items-center justify-center p-3 w-10 h-10 rounded-lg bg-[#CCB69E] overflow-hidden">
                <FaRegUser className="text-white text-xl" />{" "}
              </div>
            )}
            <div>
              <p className="text-[13px] font-semibold">{auth?.user?.firstName}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase">
                {auth?.user?.roleId?.name
                  ? capitalizeFirstLetter(auth?.user?.roleId?.name)
                  : auth?.user?.roleId?.name}
              </p>
              {/* <div className="hidden group-hover:flex absolute left-0  top-10   bg-transparent pt-4">
                <div className="p-2   flex-col shadow flex justify-center bg-white  rounded-lg w-40">
                  <NavLink
                    className={() =>
                      classNames(
                        "text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap hover:font-bold"
                      )
                    }
                    to="/admin/dashboard/user"
                  >
                    Reset Password
                  </NavLink>
                </div>
              </div> */}
            </div>
          </div>

          <div>
            <Modal
              isOpen={isModalOpen}
              toggleModal={toggleModal}
              button={<img src={logoutIcon} className="w-4 h-4 " title="Logout" />}
            >
              <div className="w-[376px] px-6 py-5">
                <p className="text-[15px] font-bold mb-[11px]">Are You Sure?</p>

                <p className="text-[13px] font-medium text-[#535353] mb-10">
                  Are you sure you want to logout?
                </p>

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
                    onClick={handleLogout}
                  >
                    Yes, Logout
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
