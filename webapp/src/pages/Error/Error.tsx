import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { D_ErrorPage } from "@/pages/Error/types";

const Error = () => {
  const error: D_ErrorPage = {
    status: 500,
    statusText: "Somethig went wrong"
  };

  const routeError = useRouteError();

  if (isRouteErrorResponse(routeError)) {
    error.status = routeError.status;
    error.statusText = routeError.statusText;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] w-full">
      {error.status} - {error.statusText}
    </div>
  );
};

export default Error;
