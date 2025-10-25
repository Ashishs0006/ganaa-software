import { AppDropZone, Input } from "@/components";
import { MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import file from "@/assets/images/fileIcon.svg";
import pdfFile from "@/assets/images/pdfIcon.svg";
import classNames from "classnames";

const CheckBox = ({
  checked,
  disable,
  view,
  ContainerClass,
  boxClass,
  files,
  filesString,
  value,
  imageDrop = true,
  name,
  accept = "application/pdf",
  label,
  checkHide = false,
  handleCheck,
  handleDrop,
  handleDeletes
}: {
  view?: string;
  disable?: boolean;
  checkHide?: boolean;
  checked: boolean;
  imageDrop?: boolean;
  ContainerClass?: string;
  boxClass?: string;
  accept?: string;
  value?: string;
  files?: File[];
  filesString?: { filePath: string; fileUrl: string; fileName?: string }[];
  name: string;
  label?: string;
  handleCheck: (_e: SyntheticEvent) => void;
  handleDrop: (_files: File[], _name: string) => void;
  handleDeletes?: (_index: number, _type: string, _name: string) => void;
}) => {
  const handleDelete = (index: number, type: string) => {
    if (handleDeletes) {
      handleDeletes(index, type, name);
    }
  };

  return (
    <div className={`${ContainerClass}`}>
      <div
        className={` w-fit ${
          checkHide ? "hidden" : "flex"
        } text-nowrap whitespace-nowrap items-center justify-start gap-2`}
      >
        <Input
          type="checkbox"
          onChange={handleCheck}
          name={name}
          checked={checked}
          value={value}
          id={value}
          className="accent-[#323E2A] w-4! h-4!"
        />
        {label && (
          <label htmlFor={value} className="whitespace-nowrap text-[13px] font-medium">
            {label}
          </label>
        )}
      </div>
      <div
        className={`flex  items-center ${view ? view : ""}  gap-1 text-nowrap whitespace-nowrap`}
      >
        {imageDrop && (
          <div
            className={classNames(
              `px-3  ml-5 py-1.5 w-fit flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative ${
                checked ? "" : "bg-gray-100"
              } `,
              boxClass
            )}
          >
            <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
              <img src={file} alt="file" className="w-full h-full" />
            </div>
            <AppDropZone
              disabled={!checked||disable}
              onDrop={(files) => {
                handleDrop(files, name);
              }}
              
              accept={accept}
            >
              <div>
                <p className="font-semibold text-[13px]">
                  Drag & Drop or{" "}
                  <span className={`underline ${checked ? "cursor-pointer" : ""}`}>
                    Browse Files
                  </span>
                </p>
                <p className="font-medium text-xs">Format: PDF, Max size: 5MB</p>
              </div>
            </AppDropZone>
          </div>
        )}
        {((filesString && checked && filesString.length > 0) || (files && files.length > 0)) && (
          <View filesString={filesString} files={files} handleDelete={handleDelete} />
        )}
      </div>
    </div>
  );
};

export default CheckBox;

export const View = ({
  files,
  filesString,
  handleDelete
}: {
  files?: File[];
  filesString?: { filePath: string; fileUrl: string; fileName?: string }[];
  handleDelete?: (_index: number, _type: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  const viewref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (viewref.current && !viewref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const handleChange = (index: number, type: string) => {
    if (handleDelete) {
      handleDelete(index, type);
    }
  };

  const handleState = () => {
    setOpen(!open);
  };

  return (
    <div id="view" ref={viewref} className=" text-nowrap relative whitespace-nowrap w-fit">
      <div
        onClick={handleState}
        ref={viewref}
        className="border-dashed cursor-pointer relative border-[#CAD2AA] px-3 py-3 w-fit min-h-4 rounded-[7px] bg-[#FAFFE2] border-2  flex items-start justify-center gap-1"
      >
        <img src={pdfFile} className="w-4 h-4" />
        <p className="text-xs font-bold">View</p>
        <div className="w-2 h-2 items-center justify-center absolute top-0 right-0 rounded-full text-white bg-green-950 flex p-2">
          <p className="text-xs"> {(filesString?.length || 0) + (files?.length || 0)}</p>
        </div>
      </div>
      {(filesString || files) && (
        <div
          className={`bg-gray-100 mt-1 right-0 border absolute z-20 border-gray-50 py-2 px-2 ${
            open ? "flex" : "hidden"
          } flex-col gap-2 w-fit rounded-xl  shadow-xl`}
        >
          {filesString &&
            filesString?.length > 0 &&
            filesString.map((data, index) => (
              <div
                key={index}
                className="py-1 pl-2 pr-20 w-80 text-nowrap whitespace-nowrap flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative"
              >
                <a
                  target="_blank"
                  href={data.fileUrl}
                  className="flex items-center justify-center gap-2 w-80"
                >
                  <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
                    <img src={pdfFile} alt="file" className="w-full h-full" />
                  </div>
                  <div className="w-60">
                    <div className="ml-5 truncate">
                      {data?.fileName ? data?.fileName : data?.filePath?.split("/").pop()}
                    </div>
                  </div>
                </a>
                <svg
                  onClick={() => handleChange(index, "URL")}
                  className="w-3 h-3 absolute top-2 right-2 text-red-500 cursor-pointer"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </div>
            ))}
          {files &&
            files.length > 0 &&
            files.map((data, index) => (
              <div
                key={index}
                className="py-1  w-80 text-nowrap whitespace-normal pl-2 pr-10  flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative"
              >
                <a
                  target="_blank"
                  href={URL.createObjectURL(data)}
                  className="flex items-center justify-center gap-2 w-80"
                >
                  <div className=" w-[30px] h-[30px]  flex items-center overflow-hidden justify-center">
                    <img src={pdfFile} alt="file" className="w-full h-full" />
                  </div>

                  <div className="w-60">
                    <div className="ml-5 truncate">{data.name}</div>
                  </div>
                </a>

                <svg
                  onClick={() => handleChange(index, "FILE")}
                  className="w-3 h-3 absolute top-2 right-2 text-red-500 cursor-pointer"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export const ViewInjury = ({
  files,
  handleDelete,
  mainIndex
}: {
  files?: (File | { filePath: string; fileUrl: string; fileName?: string })[];
  handleDelete?: (_index: number, _mainIndex: number) => void;
  mainIndex: number;
}) => {
  const [open, setOpen] = useState(false);

  const viewref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (viewref.current && !viewref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const handleState = () => {
    setOpen(!open);
  };

  const handleChange = (index: number) => {
    if (handleDelete) {
      handleDelete(index, mainIndex);
    }
  };

  return (
    <div id="view" ref={viewref} className=" text-nowrap whitespace-nowrap">
      <div
        onClick={handleState}
        className="border-dashed cursor-pointer relative border-[#CAD2AA] px-3 py-3 w-fit min-h-4 rounded-[7px] bg-[#FAFFE2] border-2  flex items-start justify-center gap-1"
      >
        <img src={pdfFile} className="w-4" />
        <p className="text-xs font-bold">View</p>
        <div className="w-2 h-2 items-center justify-center absolute top-0 right-0 rounded-full text-white bg-green-950 flex p-2">
          <p className="text-xs"> {files?.length || 0}</p>
        </div>
      </div>
      {files && (
        <div
          className={`bg-gray-100 border absolute z-20 border-gray-50 py-2 px-2 ${
            open ? "flex" : "hidden"
          } flex-col gap-2 w-fit rounded-xl  shadow-xl`}
        >
          {files &&
            files.map(
              (data: File | { filePath: string; fileUrl: string; fileName?: string }, index) => (
                <div
                  key={index}
                  className="py-1  w-60 text-nowrap whitespace-normal pl-2 pr-10  flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative"
                >
                  <a
                    target="_blank"
                    href={!(data instanceof File) ? data?.fileUrl : URL.createObjectURL(data)}
                    className="flex gap-2 w-full items-center justify-center"
                  >
                    <div className=" w-[30px] h-[30px]  flex items-center overflow-hidden justify-center">
                      <img src={pdfFile} alt="file" className="w-full h-full" />
                    </div>
                    <div className="w-full truncate">
                      <p className="ml-5 w-[80%] truncate">
                        {!(data instanceof File)
                          ? data?.fileName
                            ? data?.fileName
                            : data?.filePath?.split("/").pop()
                          : data.name}
                      </p>
                    </div>
                  </a>

                  <svg
                    onClick={() => handleChange(index)}
                    className="w-3 h-3 absolute top-2 right-2 text-red-500 cursor-pointer"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                </div>
              )
            )}
        </div>
      )}
    </div>
  );
};
