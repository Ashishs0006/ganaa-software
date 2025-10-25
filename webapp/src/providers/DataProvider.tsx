import { useEffect } from "react";

import { DataContext } from "@/context/DataContext";

import { IDataProvider } from "@/providers/types";

import {
  getAllRoles,
  getAllCenter,
  getAllAllergy,
  getAllCountry,
  getAllReferredType,
  getAllRelationship
} from "@/apis";

import { useDispatch, useSelector } from "react-redux";

import {
  IReferredType,
  IRelationship,
  setAllergy,
  setCenter,
  setCountry,
  setGroupActivityTabs,
  setInsight,
  setReferredType,
  setRelationships,
  setSessionType
} from "@/redux/slice/dropDown";

import { RootState } from "@/redux/store/store";
import { IPagination } from "@/redux/slice/types";

import constants from "@/constants";

import { setRoles } from "@/redux/slice/roleSlice";
import { useAuth } from "./AuthProvider";

const DataProvider = ({ children }: IDataProvider) => {
  const { auth } = useAuth();

  const dispatch = useDispatch();

  const dropdownData = useSelector((store: RootState) => store.dropdown);

  const fetchAllRelationship = async () => {
    try {
      const now = Date.now();

      const cachedData = localStorage.getItem(constants.dropdown.ALLRELATIONSHIP);
      if (cachedData) {
        const data = JSON.parse(cachedData) as Record<string, unknown>;

        if (now - (data.timestamp as number) < 3600000) {
          dispatch(
            setRelationships({
              data: data.data as IRelationship[],

              pagination: data.pagination as IPagination
            })
          );

          return;
        }
      }

      const { data } = await getAllRelationship({
        sort: "-createdAt",
        limit: dropdownData.relationships.pagination.limit
      });
      localStorage.setItem(
        constants.dropdown.ALLRELATIONSHIP,
        JSON.stringify({
          timestamp: now,
          data: data.data,
          pagination: data.pagination
        })
      );

      dispatch(
        setRelationships({
          data: data.data,
          pagination: data.pagination
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllRefferedType = async () => {
    try {
      const now = Date.now();

      const cachedData = localStorage.getItem(constants.dropdown.ALLREFEREDTYPE);
      if (cachedData) {
        const data = JSON.parse(cachedData) as Record<string, unknown>;

        if (now - (data.timestamp as number) < 3600000) {
          dispatch(
            setReferredType({
              data: data.data as IReferredType[],
              pagination: data.pagination as IPagination
            })
          );
          return;
        }
      }

      const { data } = await getAllReferredType({
        sort: "order",
        limit: dropdownData.referredType.pagination.limit
      });

      localStorage.setItem(
        constants.dropdown.ALLREFEREDTYPE,
        JSON.stringify({
          timestamp: now,
          data: data.data,
          pagination: data.pagination
        })
      );

      dispatch(
        setReferredType({
          data: data.data,
          pagination: data.pagination
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllRoles = async () => {
    try {
      // const now = Date.now();

      // const cachedData = localStorage.getItem(constants.dropdown.ALLROLES);
      // if (cachedData) {
      //   const data = JSON.parse(cachedData) as Record<string, unknown>;

      //   if (now - (data.timestamp as number) < 3600000) {
      //     dispatch(
      //       setCountry({
      //         data: data.data as ICountry[]
      //       })
      //     );
      //     return;
      //   }
      // }

      const { data } = await getAllRoles();

      // localStorage.setItem(
      //   constants.dropdown.ALLCOUNTRY,
      //   JSON.stringify({
      //     timestamp: now,
      //     data: data.data.country,
      //     pagination: data.pagination
      //   })
      // );
      dispatch(
        setRoles({
          data: data.data,
          pagination: data.pagination
        })
      );
      // dispatch(
      //   setInsight({
      //     data: data.data.insight
      //   })
      // );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllCountry = async () => {
    try {
      const now = Date.now();

      const cacheCheckList = [
        {
          key: constants.dropdown.ALLCOUNTRY,
          dispatchAction: setCountry
        },
        {
          key: constants.dropdown.ALLSUBSESSION,
          dispatchAction: setSessionType
        }
        // Add more here easily
      ];

      let foundValidCache = false;

      for (const { key, dispatchAction } of cacheCheckList) {
        const cached = localStorage.getItem(key);
        if (cached) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const parsed = JSON.parse(cached) as Record<string, any>;
          if (now - parsed.timestamp < 3600000) {
            dispatch(dispatchAction({ data: parsed.data }));
            foundValidCache = true;
          }
        }
      }

      if (foundValidCache) return;

      const { data } = await getAllCountry({ sort: "name" });

      localStorage.setItem(
        constants.dropdown.ALLCOUNTRY,
        JSON.stringify({
          timestamp: now,
          data: data.data.country,
          pagination: data.pagination
        })
      );

      localStorage.setItem(
        constants.dropdown.ALLSUBSESSION,
        JSON.stringify({
          timestamp: now,
          data: data.data.sessionType,
          pagination: data.pagination
        })
      );

      dispatch(
        setCountry({
          data: data.data.country
        })
      );
      dispatch(
        setInsight({
          data: data.data.insight
        })
      );
      dispatch(
        setSessionType({
          data: data.data.sessionType
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllGroupActivityTab = async () => {
    try {
      const now = Date.now();

      const cachedData = localStorage.getItem(constants.dropdown.ALLGROUPACTIVITY);
      if (cachedData) {
        const data = JSON.parse(cachedData) as Record<string, unknown>;

        if (now - (data.timestamp as number) < 3600000) {
          dispatch(
            setGroupActivityTabs({
              data: data?.data as string[]
            })
          );
          return;
        }
      }

      const { data } = await getAllCountry({ sort: "name" });

      localStorage.setItem(
        constants.dropdown.ALLGROUPACTIVITY,
        JSON.stringify({
          timestamp: now,
          data: data.data.groupActivityTabs,
          pagination: data.pagination
        })
      );

      dispatch(
        setGroupActivityTabs({
          data: data.data.groupActivityTabs
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllCenter = async () => {
    try {
      const now = Date.now();

      const { data } = await getAllCenter({
        limit: dropdownData.center.pagination.limit,
        sort: "centerName"
      });

      localStorage.setItem(
        constants.dropdown.ALLCENTER,
        JSON.stringify({
          timestamp: now,
          data: data.data,
          pagination: data.pagination
        })
      );

      dispatch(
        setCenter({
          data: data.data
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllAllergy = async () => {
    try {
      // const cachedData = localStorage.getItem(constants.dropdown.ALLCENTER);
      // if (cachedData) {
      //   const data = JSON.parse(cachedData) as Record<string, unknown>;

      //   if (now - (data.timestamp as number) < 3600000) {
      //     dispatch(
      //       setCenter({
      //         data: data.data as ICenter[]
      //       })
      //     );
      //     return;
      //   }
      // }

      const { data } = await getAllAllergy({
        limit: 300,
        sort: "asc"
      });

      // localStorage.setItem(
      //   constants.dropdown.ALLCENTER,
      //   JSON.stringify({
      //     timestamp: now,
      //     data: data.data,
      //     pagination: data.pagination
      //   })
      // );

      dispatch(
        setAllergy({
          data: data.data
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (auth.status) {
      fetchAllRelationship();
      fetchAllRefferedType();
      fetchAllCountry();
      fetchAllCenter();
      fetchAllAllergy();
      fetchAllRoles();
      fetchAllGroupActivityTab();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  return <DataContext.Provider value={null}>{children}</DataContext.Provider>;
};

export default DataProvider;
