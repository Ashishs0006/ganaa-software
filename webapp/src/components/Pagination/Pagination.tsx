import { useSearchParams } from "react-router-dom";

import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import { Button } from "@/components";
import { useEffect } from "react";

const Pagination = ({
  totalPages,
  paramName="page"
}: {
  totalPages: string | number;
  paramName?: string;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get(paramName)) || 1;
  const maxVisiblePages = 3;

  let startPage = Math.max(1, page - 1);
  const endPage = Math.min(+totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (newPage: number) => {
    searchParams.set(paramName, newPage?.toString());
    setSearchParams(searchParams);
  };
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [searchParams.get(paramName)]);

  return (
    +totalPages > 1 &&
    page <= +totalPages && (
      <div id="pagination" className="flex gap-2 mt-3 pb-2 items-center justify-end">
        {/* Previous Button */}
        <Button
          className={`flex items-center hover:bg-gray-300! justify-center p-0! w-10 h-10 ${
            page == 1 ? "text-gray-500" : "text-black"
          } bg-white border border-gray-300 rounded-md`}
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
        >
          <IoIosArrowBack />
        </Button>

        {/* First Page */}
        {startPage > 1 && (
          <Button
            className="flex items-center justify-center p-0! hover:bg-gray-300! w-10 h-10 text-gray-700 bg-white border  rounded-md"
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
        )}

        {startPage > 1 && startPage > 2 && (
          <span className="w-10 h-10 flex items-center justify-center">...</span>
        )}

        {/* Page Numbers */}
        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            className={`flex items-center  justify-center p-0! w-10 h-10 border rounded-md ${
              pageNumber === page
                ? "text-white bg-[#575F4A]  hover:bg-[#575F4A]! border-[#D4D4D4]"
                : "text-gray-700 bg-white border-gray-300 hover:bg-gray-300!"
            }`}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        {/* Last Page */}
        {endPage < +totalPages && (
          <div className="flex gap-1">
            {endPage < +totalPages - 1 && (
              <div className="w-6 h-10 flex items-center justify-center">...</div>
            )}
            <Button
              className="flex items-center hover:bg-gray-300! justify-center w-10 h-10 text-gray-700 bg-white border border-gray-300 rounded-md"
              onClick={() => handlePageChange(+totalPages)}
            >
              {+totalPages}
            </Button>
          </div>
        )}

        {/* Next Button */}
        <Button
          className={`flex items-center justify-center hover:bg-gray-300! w-10 h-10 ${
            page == +totalPages ? "text-gray-500" : "text-black"
          }  bg-white border border-gray-300 rounded-md p-0!`}
          disabled={page === +totalPages}
          onClick={() => handlePageChange(page + 1)}
        >
          <IoIosArrowForward />
        </Button>
      </div>
    )
  );
};

export default Pagination;
