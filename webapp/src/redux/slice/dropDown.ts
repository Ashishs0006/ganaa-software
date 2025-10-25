import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPagination } from "@/redux/slice/types";

export interface IRelationship {
  _id: string;
  shortName: string;
  fullName: string;
  createdAt: string;
}
export interface IReferences {
  _id: string;
  name: string;
  createdAt: string;
}
export interface IReferredType {
  _id: string;
  name: string;
  createdAt: string;
}
export interface ICountry {
  name: string;
  phoneCode: string;
}
export interface ICenter {
  _id: string;
  centerName: string;
  googleMapLink: string;
  centerUID: string;
  createdAt: string;
}
export interface IInsight {
  [key: string]: string;
}
export interface IAllergy {
  _id: string;
  name: string;
  isDeleted: boolean;
}
export interface ISessionType {
  name: string;
  subMenu: string[];
}

interface IDropdownState {
  relationships: {
    loading: boolean;
    data: IRelationship[];
    pagination: IPagination;
  };
  references: {
    loading: boolean;
    data: IReferences[];
    pagination: IPagination;
  };
  referredType: {
    loading: boolean;
    data: IReferredType[];
    pagination: IPagination;
  };
  country: {
    loading: boolean;
    data: ICountry[];
  };
  groupActivityTabs: {
    loading: boolean;
    data: string[];
  };
  insight: {
    data: IInsight;
  };
  center: {
    loading: boolean;
    data: ICenter[];
    pagination: IPagination;
  };
  allergy: {
    loading: boolean;
    data: IAllergy[];
    pagination: IPagination;
  };
  sessionType: {
    loading: boolean;
    data: ISessionType[];
    pagination: IPagination;
  };
}

const initialState: IDropdownState = {
  relationships: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  },
  groupActivityTabs: {
    loading: true,
    data: []
  },
  references: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  },

  country: {
    loading: true,
    data: []
  },
  insight: {
    data: {
      "1": "Complete denial of illness",
      "2": "Slight awareness",
      "3": "Awareness of being sick but blaming it on external factors",
      "4": "Awareness (illness is cause is unknown)",
      "5": "Intellectual insight (admission that the patient is ill)",
      "6": "True emotional insight (awareness that patient's motives and feelings can lead to basic changes in behavior)"
    }
  },
  referredType: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  },
  center: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  },
  allergy: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  },
  sessionType: {
    loading: true,
    data: [],
    pagination: {
      page: 1,
      limit: 300,
      totalDocuments: 0,
      totalPages: 0
    }
  }
};

const dropdownSlice = createSlice({
  name: "dropdown",
  initialState,
  reducers: {
    setRelationships(
      state,
      action: PayloadAction<{ data: IRelationship[]; pagination: IPagination }>
    ) {
      state.relationships.loading = false;
      state.relationships.data = action.payload.data;
      state.relationships.pagination = action.payload.pagination;
    },
    setReferences(state, action: PayloadAction<{ data: IReferences[]; pagination: IPagination }>) {
      state.references.loading = false;
      state.references.data = action.payload.data;
      state.references.pagination = action.payload.pagination;
    },
    setReferredType(
      state,
      action: PayloadAction<{ data: IReferredType[]; pagination: IPagination }>
    ) {
      state.referredType.loading = false;
      state.referredType.data = action.payload.data;
      state.referredType.pagination = action.payload.pagination;
    },
    setCountry(state, action: PayloadAction<{ data: ICountry[] }>) {
      state.country.loading = false;
      state.country.data = action.payload.data;
    },
    setGroupActivityTabs(state, action: PayloadAction<{ data: string[] }>) {
      state.groupActivityTabs.loading = false;
      state.groupActivityTabs.data = action.payload.data;
    },
    setCenter(state, action: PayloadAction<{ data: ICenter[] }>) {
      state.center.loading = false;
      state.center.data = action.payload.data;
    },
    setInsight(state, action: PayloadAction<{ data: IInsight }>) {
      state.insight.data = action.payload.data;
    },
    setAllergy(state, action: PayloadAction<{ data: IAllergy[] }>) {
      state.allergy.loading = false;
      state.allergy.data = action.payload.data;
    },
    setSessionType(state, action: PayloadAction<{ data: ISessionType[] }>) {
      state.sessionType.loading = false;
      state.sessionType.data = action.payload.data;
    }
  }
});

export const {
  setRelationships,
  setReferences,
  setReferredType,
  setCountry,
  setInsight,
  setCenter,
  setAllergy,
  setGroupActivityTabs,
  setSessionType
} = dropdownSlice.actions;

export default dropdownSlice.reducer;
