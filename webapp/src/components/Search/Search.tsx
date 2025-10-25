import { SyntheticEvent, useEffect, useRef, useState } from "react";
import Button from "../Button/Button";
import InputRef from "../Input/InputRef";
import { IoSearchOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const query = searchParams.get("search") || "";
  const [inputValue, setInputValue] = useState(query);

  const [displaySearchBar, setDisplaySearchBar] = useState<boolean>(false);

  useEffect(() => {
    if (displaySearchBar) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0); // Timeout ensures focus happens after render
    }
  }, [displaySearchBar]);

  const handleInputChange = (e: SyntheticEvent) => {
    const { value } = e.target as HTMLInputElement;
    setInputValue(value);

    // Set query param immediately (or debounce this too if needed)
    setSearchParams((prev) => {
      if (value) {
        prev.set("search", value);
      } else {
        prev.delete("search");
      }
      return prev;
    });
  };

  return (
    <div className="flex items-center text-nowrap whitespace-nowrap justify-center gap-2">
      {displaySearchBar ? (
        <div className="flex rounded-md border-2 border-[#D4D4D4] overflow-hidden max-w-md mx-auto font-[sans-serif]">
          <InputRef
            ref={inputRef}
            className=" pl-3 min-w-30 rounded-lg text-[#505050] py-2 text-xs  border-none "
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Search . . "
          />

          <Button className="flex items-center rounded-none! hover:bg-white!  cursor-pointer justify-center bg-transparent text-white   px-1 py-0!">
            {displaySearchBar ? (
              <RxCross2
                color="black"
                size={15}
                onClick={() => {
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                  setInputValue("");
                  setDisplaySearchBar(false);
                }}
              />
            ) : (
              <IoSearchOutline size={15} className="" color="black" />
            )}
          </Button>
        </div>
      ) : (
        <div
          onClick={() => {
            setDisplaySearchBar(!displaySearchBar);
          }}
          className="flex cursor-pointer items-center justify-center px-3 py-2 border border-[#D4D4D4] rounded-lg"
        >
          <IoSearchOutline size={15} />
        </div>
      )}
    </div>
  );
};

export default Search;
