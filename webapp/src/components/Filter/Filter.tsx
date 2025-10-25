import { useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";
import SingleSelect from "../MultiSelect/MultiSelect";
import { useSearchParams } from "react-router-dom";

const Filter = () => {
  const { auth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selected = searchParams.get("filter") || "All";

  const centerDropdown = useMemo(() => {
    const centerList = auth.user.centerId ?? [];

    const allOption = centerList.length > 1 ? [{ value: "All", label: "All" }] : [];

    const mappedCenters = centerList.map(
      ({ centerName, _id }: { centerName: string; _id: string }) => ({
        label: centerName,
        value: _id
      })
    );

    return [...allOption, ...mappedCenters];
  }, [auth.user.centerId]);

  const handleselected = (values: string) => {
    searchParams.set("filter", values);
    setSearchParams(searchParams);
  };

  return (
    <>
      <SingleSelect
        options={centerDropdown}
        selectedValue={selected}
        onChange={handleselected}
        placeholder={centerDropdown?.length > 1 ? "All" : centerDropdown[0]?.label}
      />
    </>
  );
};

export default Filter;
