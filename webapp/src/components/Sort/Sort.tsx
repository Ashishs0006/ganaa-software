import { MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";


const Sort = ({ value }: { value: { title: string; value: string }[] }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [openFilter, setOpenFilter] = useState<boolean>(false);

  const filterRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
      setOpenFilter(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const filterFunction = (sort: string) => {
    if (searchParams.get("sort") === sort) {
      const newSort = searchParams.get("sort")?.startsWith("-") ? sort : `-${sort}`;

      searchParams.set("sort", newSort);
    } else {
      searchParams.set("sort", sort);
    }
    searchParams.delete("page");
    setSearchParams(searchParams);
  };

  const renderSortIcon = (field: string) => {
    const isDescending =
      searchParams.get("sort")?.startsWith("-") && searchParams.get("sort")?.slice(1) === field;
    return isDescending ? "(asc)" : "(dsc)";
  };

  return (
    <div
      id="sort"
      ref={filterRef}
      onClick={(e: SyntheticEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenFilter(!openFilter);
      }}
      className="flex bg-white relative text-xs justify-between  cursor-pointer items-center min-w-[161px] font-medium text-[#505050] px-3 py-2 border border-[#D4D4D4] rounded-lg"
    >
      Sort by:{" "}
      <span className="ml-[2px] mt-[1px] text-black font-semibold!">
        {searchParams.get("sort")
          ? value.find((item) => item.value === searchParams.get("sort")?.replace(/^[-+]/, ""))
              ?.title
          : "Created At"}
        <span className="ml-[4px]  text-black font-semibold!">
          {searchParams.get("sort")?.startsWith("-") ? "(desc)" : "(asc)"}
        </span>
      </span>
      {openFilter && (
        <div className="absolute right-0 top-8 min-w-[161px] overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-xl z-10 flex items-center justify-center">
          <div className="w-full  text-nowrap p-2  whitespace-nowrap gap-2 flex-col flex  items-start justify-center bg-white shadow-lg rounded-lg">
            {value.map((data: { title: string; value: string }, index) => (
              <div className="w-full">
                <div
                  onClick={(_e: SyntheticEvent) => filterFunction(data.value)}
                  className="text-xs flex w-full p-2 hover:bg-gray-200 rounded-lg  justify-between items-center gap-2 cursor-pointer font-semibold"
                >
                  <p>{data.title}</p>
                  {searchParams.get("sort") &&
                  searchParams.get("sort")?.replace(/^[-+]/, "") === data.value
                    ? renderSortIcon(data.value)
                    : "(asc)"}
                </div>
                {value.length > index && <hr className="w-full" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sort;
