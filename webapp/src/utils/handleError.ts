import { AxiosError } from "axios";
import toast from "react-hot-toast";

const handleError = (err: unknown, toastId?: string) => {
  if (toastId) toast.remove(toastId);

  if (err instanceof AxiosError) {
    if (!err.response && err.message === "Network Error") {
      return toast.error("Connection Error", {
        style: {
          maxWidth: 500
        }
      });
    }

    if (err.response) {
      if (err.response.data.message.trim() == "") {
        return;
      }
      // The client was given an error response (5xx, 4xx)
      return toast.error(err.response.data.message, {
        style: {
          maxWidth: 500
        }
      });
    }
    if (err.message.trim() == "") {
      return;
    }
    // Anything else
    return toast.error(err.message, {
      style: {
        maxWidth: 500
      }
    });
  }

  if (err instanceof Error) {
    if (err.message.trim() == "") {
      return;
    }
    // Anything else
    return toast.error(err.message, {
      style: {
        maxWidth: 500
      }
    });
  }

  return toast.error("Something went wrong", {
    style: {
      maxWidth: 500
    }
  });
};

export default handleError;
