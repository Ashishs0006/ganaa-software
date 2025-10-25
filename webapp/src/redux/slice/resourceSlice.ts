import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IHospitalCenter {
  _id: string;
  centerName: string;
  googleMapLink: string;
  centerUID: string;
  createdAt: string;
}

interface IRooomType {
  _id: string;
  name: string;
  centerId: string;
  createdAt: string;
}

interface IRooomNo {
  _id: string;
  name: string;
  roomTypeId: string;
  totalBeds: number;
  availableBeds: number;
  createdAt: string;
}
interface ILocker {
  _id: string;
  name: string;
  centerId: string;
  createdAt: string;
}

export interface IDoctor {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
}

export interface ITherapist {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
}

interface IIntialInterface {
  hostpitalCenters: {
    loading: boolean;
    data: IHospitalCenter[];
  };
  hostpitalRoomType: {
    loading: boolean;
    data: IRooomType[];
  };
  hostpitalRoomNo: {
    loading: boolean;
    data: IRooomNo[];
  };
  hostpitalLockerNo: {
    loading: boolean;
    data: ILocker[];
  };
  hostpitalDoctor: {
    loading: boolean;
    data: IDoctor[];
  };
  hostpitalTherapist: {
    loading: boolean;
    data: ITherapist[];
  };
}

const initialState: IIntialInterface = {
  hostpitalCenters: {
    loading: true,
    data: []
  },
  hostpitalRoomType: {
    loading: true,
    data: []
  },
  hostpitalRoomNo: {
    loading: true,
    data: []
  },
  hostpitalLockerNo: {
    loading: true,
    data: []
  },
  hostpitalDoctor: {
    loading: true,
    data: []
  },
  hostpitalTherapist: {
    loading: true,
    data: []
  }
};

const resourceSlice = createSlice({
  name: "resource",
  initialState,
  reducers: {
    setHospitalCentersDetails(state, action: PayloadAction<IHospitalCenter[]>) {
      state.hostpitalCenters.loading = false;
      state.hostpitalCenters.data = action.payload;
    },
    setHospitalRoomTypeDetails(state, action: PayloadAction<IRooomType[]>) {
      state.hostpitalRoomType.loading = false;
      state.hostpitalRoomType.data = action.payload;
    },
    setHospitalRoomNoDetails(state, action: PayloadAction<IRooomNo[]>) {
      state.hostpitalRoomNo.loading = false;
      state.hostpitalRoomNo.data = action.payload;
    },
    setHospitalLockerNoDetails(state, action: PayloadAction<ILocker[]>) {
      state.hostpitalLockerNo.loading = false;
      state.hostpitalLockerNo.data = action.payload;
    },
    setHostpitalDoctor(state, action: PayloadAction<IDoctor[]>) {
      state.hostpitalDoctor.loading = false;
      state.hostpitalDoctor.data = action.payload;
    },
    setHostpitalTherapist(state, action: PayloadAction<ITherapist[]>) {
      state.hostpitalTherapist.loading = false;
      state.hostpitalTherapist.data = action.payload;
    }
  }
});

export const {
  setHospitalCentersDetails,
  setHospitalRoomTypeDetails,
  setHospitalRoomNoDetails,
  setHospitalLockerNoDetails,
  setHostpitalDoctor,
  setHostpitalTherapist
} = resourceSlice.actions;

export default resourceSlice.reducer;
