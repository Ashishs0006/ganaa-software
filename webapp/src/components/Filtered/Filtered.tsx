import { useState, useEffect, useRef } from "react";
import { MdFilterListAlt } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { useSearchParams } from "react-router-dom";

const Filtered = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    gender: "",
    illnessType: "",
    admissionType: "",
    hyperTension: "",
    heartDisease: "",
    levelOfRisk: "",
    leadType: ""
  });

  // Initialize filters from URL search params on component mount
  useEffect(() => {
    setFilters({
      gender: searchParams.get("gender") ?? "",
      illnessType: searchParams.get("illnessType") ?? "",
      admissionType: searchParams.get("admissionType") || "",
      hyperTension: searchParams.get("hyperTension") || "",
      heartDisease: searchParams.get("heartDisease") || "",
      levelOfRisk: searchParams.get("levelOfRisk") || "",
      leadType: searchParams.get("leadType") || ""
    });
  }, [
    searchParams.get("gender"),
    searchParams.get("illnessType"),
    searchParams.get("hyperTension"),
    searchParams.get("heartDisease"),
    searchParams.get("levelOfRisk"),
    searchParams.get("leadType")
  ]);

  const popupRef = useRef<HTMLDivElement | null>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  // Update URL search params when filters change
  const updateSearchParams = (newFilters: {
    gender: string;
    illnessType: string;
    admissionType: string;
    hyperTension: string;
    heartDisease: string;
    levelOfRisk: string;
    leadType: string;
  }) => {
    const params = searchParams;

    if (newFilters.gender) {
      params.set("gender", newFilters.gender);
    } else {
      params.delete("gender");
    }
    if (newFilters.illnessType) {
      params.set("illnessType", newFilters.illnessType);
    } else {
      params.delete("illnessType");
    }
    if (newFilters.admissionType) {
      params.set("admissionType", newFilters.admissionType);
    } else {
      params.delete("admissionType");
    }
    if (newFilters.hyperTension) {
      params.set("hyperTension", newFilters.hyperTension);
    } else {
      params.delete("hyperTension");
    }
    if (newFilters.heartDisease) {
      params.set("heartDisease", newFilters.heartDisease);
    } else {
      params.delete("heartDisease");
    }
    if (newFilters.levelOfRisk) {
      params.set("levelOfRisk", newFilters.levelOfRisk);
    } else {
      params.delete("levelOfRisk");
    }
    if (newFilters.leadType) {
      params.set("leadType", newFilters.leadType);
    } else {
      params.delete("leadType");
    }

    setSearchParams(params);
  };

  // Handle multi-select changes

  // Handle single select changes (for radio buttons)
  const handleRadioChange = (field: string, value: string) => {
  setFilters((prev) => {
    const updatedFilters = { ...prev, [field]: value };
    updateSearchParams(updatedFilters); // use the updated object directly
    return updatedFilters;
  });
};


  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.gender) count += 1;
    if (filters.illnessType) count += 1;
    if (filters.admissionType) count += 1;
    if (filters.hyperTension) count += 1;
    if (filters.heartDisease) count += 1;
    if (filters.levelOfRisk) count += 1;
    if (filters.leadType) count += 1;

    return count;
  };

  const genderOptions = ["Male", "Female", ""];
  const illnessTypeOptions = ["Addiction", "Mental Disorder", "Addiction & Mental Disorder", ""];
  const heartDiseaseOptions = ["Yes", "No", ""];
  const hyperTensionOptions = ["Yes", "No", ""];
  const levelOfRiskOptions = ["High", "Medium", "Low", ""];
  const leadType = ["NEW", "OLD", ""];
  const leadTypeOption = ["New", "Repeat", "All"];

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      gender: searchParams.get("gender") ?? "",
      illnessType: searchParams.get("illnessType") ?? "",
      admissionType: searchParams.get("admissionType") || "",
      hyperTension: searchParams.get("hyperTension") || "",
      heartDisease: searchParams.get("heartDisease") || "",
      levelOfRisk: searchParams.get("levelOfRisk") || "",
      leadType: searchParams.get("leadType") || ""
    }));
  }, [searchParams]);

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className="flex items-center cursor-pointer space-x-2 px-3 py-1   text-white rounded-lg bg-primary-dark transition-colors"
      >
        <MdFilterListAlt size={20} />
        <span>Filter</span>
        {getActiveFilterCount() > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
      </button>

      {/* Popup Overlay */}
      {isPopupOpen && (
        <div
          ref={popupRef}
          className="absolute top-10 rounded-2xl bg-white py-3 right-0 flex items-center shadow-md  justify-center z-50"
        >
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-scroll">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Options</h3>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <RxCross2 size={20} />
              </button>
            </div>

            {/* level Of Risk Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Level Of Risk</label>
              <div className="gap-2 grid grid-cols-4">
                {levelOfRiskOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="levelOfRisk"
                      value={option}
                      checked={filters.levelOfRisk === option}
                      onChange={(e) => handleRadioChange("levelOfRisk", e.target.value)}
                      className="mr-2 accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{option || "All"}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Gender Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <div className="space-y-2 grid grid-cols-3">
                {genderOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.gender === option}
                      onChange={() => handleRadioChange("gender", option)}
                      className="mr-2 rounded accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{option || "All"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Illness Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Illness Type</label>
              <div className="space-y-2 grid grid-cols-1">
                {illnessTypeOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.illnessType == option}
                      onChange={() => handleRadioChange("illnessType", option)}
                      className="mr-2 rounded accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{option || "All"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Admission Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Admission Type</label>
              <div className="space-y-2 grid grid-cols-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="admissionType"
                    value="Voluntary"
                    checked={filters.admissionType === "Voluntary"}
                    onChange={(e) => handleRadioChange("admissionType", e.target.value)}
                    className="mr-2 accent-[#586B3A]"
                  />
                  <span className="text-sm text-gray-700">Voluntary</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="admissionType"
                    value="Involuntary"
                    checked={filters.admissionType === "Involuntary"}
                    onChange={(e) => handleRadioChange("admissionType", e.target.value)}
                    className="mr-2 accent-[#586B3A]"
                  />
                  <span className="text-sm text-gray-700">Involuntary</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="admissionType"
                    value=""
                    checked={filters.admissionType === ""}
                    onChange={(e) => handleRadioChange("admissionType", e.target.value)}
                    className="mr-2 accent-[#586B3A]"
                  />
                  <span className="text-sm text-gray-700">All</span>
                </label>
              </div>
            </div>

            {/* Heart Disease Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Heart Disease</label>
              <div className="space-y-2 grid grid-cols-3">
                {heartDiseaseOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="heartDisease"
                      value={option}
                      checked={filters.heartDisease === option}
                      onChange={(e) => handleRadioChange("heartDisease", e.target.value)}
                      className="mr-2 accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{option || "All"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* hyper Tension Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Hyper Tension</label>
              <div className="space-y-2 grid grid-cols-3">
                {hyperTensionOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="hyperTension"
                      value={option}
                      checked={filters.hyperTension === option}
                      onChange={(e) => handleRadioChange("hyperTension", e.target.value)}
                      className="mr-2 accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{option || "All"}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* leadType Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Patient Type</label>
              <div className="space-y-2 grid grid-cols-3">
                {leadType.map((option,index) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="leadType"
                      value={option}
                      checked={filters.leadType === option}
                      onChange={(e) => handleRadioChange("leadType", e.target.value)}
                      className="mr-2 accent-[#586B3A]"
                    />
                    <span className="text-sm text-gray-700">{leadTypeOption[index]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filtered;
