import React from "react";
import { ProfileShimmerProps, TableShimmerProps } from "./types";

export const TableShimmer: React.FC<TableShimmerProps> = ({ rows = 10, columns = 10 }) => {
  return (
    <div className="w-full">
      {/* Table header shimmer */}
      <div className="bg-[#E9E8E5] w-full py-3">
        <div className="flex">
          {Array(columns)
            .fill(0)
            .map((_, idx) => (
              <div key={`header-${idx}`} className="px-3 w-full">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
        </div>
      </div>

      {/* Table body shimmer */}
      <div className="bg-white w-full">
        {Array(rows)
          .fill(0)
          .map((_, rowIdx) => (
            <div key={`row-${rowIdx}`} className="border-b border-[#DCDCDCE0] py-3">
              <div className="flex items-center">
                {Array(columns)
                  .fill(0)
                  .map((_, colIdx) => {
                    // Special case for the profile image column
                    if (colIdx === 1) {
                      return (
                        <div
                          key={`cell-${rowIdx}-${colIdx}`}
                          className="flex items-center gap-2 px-[17px]"
                        >
                          <div className="w-[50px] h-[50px] rounded-full bg-gray-200 animate-pulse"></div>
                          <div className="flex flex-col gap-1 flex-1">
                            <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                            <div className="h-2 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={`cell-${rowIdx}-${colIdx}`} className="px-3 w-full">
                        <div
                          className={`h-3 bg-gray-200 rounded animate-pulse ${
                            colIdx === 0 ? "w-5" : "w-16"
                          }`}
                        ></div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export const ProfileShimmer: React.FC<ProfileShimmerProps> = ({ rows = 6 }) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Top centered profile image shimmer */}
      <div className="flex flex-col items-center mb-8 pt-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-40 animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>

      {/* Bottom side profile data */}
      <div className="w-full max-w-2xl px-4">
        {Array(rows)
          .fill(0)
          .map((_, rowIdx) => (
            <div
              key={`row-${rowIdx}`}
              className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-200"
            >
              {/* Label */}
              <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>

              {/* Value */}
              <div className="w-full sm:w-2/3">
                <div
                  className={`h-4 bg-gray-200 rounded animate-pulse ${
                    rowIdx % 3 === 0 ? "w-full" : rowIdx % 2 === 0 ? "w-3/4" : "w-1/2"
                  }`}
                ></div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export const DailyProgressShimmer = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen animate-pulse">
      {/* Page Header */}
      <div className="mb-4 h-8 bg-gray-300 rounded w-1/3"></div>

      {/* Filters Section */}
      <div className="flex gap-4 mb-4">
        <div className="h-10 w-32 bg-gray-300 rounded"></div>
        <div className="h-10 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Patient Info Card */}
      <div className="p-4 bg-white rounded-lg shadow-md flex gap-4">
        <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-6 gap-4">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
        </div>
        <div className="mt-2">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};
