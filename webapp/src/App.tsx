import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";

import router from "@/router/router";

import { AuthProvider } from "@/providers/AuthProvider";

import DataProvider from "@/providers/DataProvider";
import DeviceProvider from "@/providers/DeviceProvider";
import { store } from "@/redux/store/store";

const App = () => {
  return (
    <AuthProvider>
      <DeviceProvider>
        <Provider store={store}>
          <DataProvider>
            <Toaster />
            <RouterProvider router={router} />
          </DataProvider>
        </Provider>
      </DeviceProvider>
    </AuthProvider>
  );
};

export default App;
