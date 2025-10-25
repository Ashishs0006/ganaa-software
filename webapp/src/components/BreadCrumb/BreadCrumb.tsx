import { Link, useLocation } from "react-router-dom";

import { AiOutlineHome } from "react-icons/ai";

const BreadCrumb = ({
  name,
  id,
  aId,
  profile,
  audit,
  discharge
}: {
  name: string;
  id: string | undefined;
  aId: string | undefined;
  profile?: boolean;
  audit?: boolean;
  discharge?: boolean;
}) => {
  const location = useLocation();

  const pathSegments = location.pathname.slice(1).split("/");
  const [_admin, _patients, inPatient, _pid, dailyProgress, _aid] = pathSegments;

  return (
    <ol className="  inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <li className="inline-flex items-center">
        <Link
          to="/admin"
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
        >
          <AiOutlineHome className="mb-[2px]" size={12} />
        </Link>
      </li>
      {!discharge && (
        <li>
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1 text-gray-700 hover:text-blue-600">/</div>
            <Link
              to={`/admin/patients/${inPatient}`}
              className=" text-xs font-medium text-gray-700 hover:text-blue-600 ml-1"
            >
              {inPatient == "in-patient" ? "In Patient Data" : "All Patient Data"}
            </Link>
          </div>
        </li>
      )}
      {discharge && (
        <li>
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1 text-gray-700 hover:text-blue-600">/</div>
            <Link
              to={`/admin/patients/all-patient/${id}/profile/${aId}`}
              className=" text-xs font-medium text-gray-700 hover:text-blue-600 ml-1"
            >
              <span
                title={name}
                className=" text-xs w-30 hover:text-blue-600  truncate font-medium text-gray-700 ml-1"
              >
                Profile
              </span>
            </Link>
          </div>
        </li>
      )}

      {dailyProgress === "daily-progress" && (
        <li>
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1 text-gray-700 hover:text-blue-600">/</div>
            <Link
              to={`/admin/patients/in-patient/${id}/daily-progress/${aId}`}
              className=" text-xs font-medium text-gray-700 hover:text-blue-600 ml-1"
            >
              Daily Progress
            </Link>
          </div>
        </li>
      )}
      {profile && (
        <li>
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1 text-gray-700 hover:text-blue-600">/</div>
            <Link
              to={`/admin/patients/all-patient/${id}/profile/${aId}`}
              className=" text-xs font-medium text-gray-700 hover:text-blue-600 ml-1"
            >
              <span
                title={name}
                className=" text-xs w-30 hover:text-blue-600  truncate font-medium text-gray-700 ml-1"
              >
                {name}
              </span>
            </Link>
          </div>
        </li>
      )}

      {audit && (
        <li>
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1 text-gray-700 hover:text-blue-600">/</div>
            <div
              // to={`/admin/patients/all-patients/${id}/profile/${aId}`}
              className=" text-xs font-medium text-gray-700 hover:text-blue-600 ml-1"
            >
              <span
                title={"audit log"}
                className=" text-xs w-30  truncate font-medium text-gray-500 ml-1"
              >
                Audit Log
              </span>
            </div>
          </div>
        </li>
      )}

      {!audit && (
        <li aria-current="page">
          <div className="flex items-center">
            <div className=" text-xs font-medium ml-1  text-gray-700 hover:text-blue-600 ">/</div>
            <span title={name} className=" text-xs w-30  truncate font-medium text-gray-500 ml-1">
              {name}
            </span>
          </div>
        </li>
      )}
    </ol>
  );
};

export default BreadCrumb;
