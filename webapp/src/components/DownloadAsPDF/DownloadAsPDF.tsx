import React, { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import Logo from "@/assets/images/logo.png";
import { capitalizeFirstLetter, formatId } from "@/utils/formater";
import Loader from "../Loader/Loader";

interface DownloadAsPDFProps {
  targetRef: React.RefObject<HTMLElement | HTMLDivElement | HTMLTableElement>;
  filename?: string;
  button?: React.ReactNode;
  image?: string;
  firstName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  uhid?: string;
  disable?: boolean;
  headerDetailHiden?: boolean;
}

const DownloadAsPDF: React.FC<DownloadAsPDFProps> = ({
  targetRef,
  headerDetailHiden = false,
  button,
  filename = "file",
  image,
  disable = false,
  firstName,
  lastName,
  age,
  gender,
  uhid
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [loading, setloading] = useState(false);
  const handleDownload = async () => {
    if (disable) return;
    setloading(true);
    const contentElement = targetRef.current;
    const headerElement = headerRef.current;
    if (!contentElement || !headerElement) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Margins in mm
      const marginTop = 5;
      const marginBottom = 5;
      const marginLeft = 5;
      const marginRight = 5;

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const contentWidth = pageWidth - marginLeft - marginRight;
      const contentHeight = pageHeight - marginTop - marginBottom;

      // Render header
      const headerCanvas = await html2canvas(headerElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff"
      });
      const headerImgData = headerCanvas.toDataURL("image/png");
      const headerHeight = (headerCanvas.height * contentWidth) / headerCanvas.width;

      // Render content
      const contentCanvas = await html2canvas(contentElement, {
        useCORS: true,
        scale: 2,
        backgroundColor: "#ffffff"
      });

      const pageCanvas = document.createElement("canvas");
      const ctx = pageCanvas.getContext("2d")!;
      const contentSliceHeightWithHeader =
        (contentCanvas.width * (contentHeight - headerHeight)) / contentWidth;
      const contentSliceHeightWithoutHeader = (contentCanvas.width * contentHeight) / contentWidth;

      let position = 0;
      let heightLeft = contentCanvas.height;
      let pageIndex = 0;

      while (heightLeft > 0) {
        const sliceHeight =
          pageIndex === 0
            ? Math.min(contentSliceHeightWithHeader, heightLeft)
            : Math.min(contentSliceHeightWithoutHeader, heightLeft);

        pageCanvas.width = contentCanvas.width;
        pageCanvas.height = sliceHeight;
        ctx.clearRect(0, 0, pageCanvas.width, pageCanvas.height);

        ctx.drawImage(
          contentCanvas,
          0,
          position,
          contentCanvas.width,
          sliceHeight,
          0,
          0,
          contentCanvas.width,
          sliceHeight
        );

        const slicedImg = pageCanvas.toDataURL("image/png");

        if (pageIndex > 0) pdf.addPage();

        if (pageIndex === 0) {
          // First page: draw header + content
          pdf.addImage(headerImgData, "PNG", marginLeft, marginTop, contentWidth, headerHeight);
          pdf.addImage(
            slicedImg,
            "PNG",
            marginLeft,
            marginTop + headerHeight,
            contentWidth,
            (sliceHeight * contentWidth) / contentCanvas.width
          );
        } else {
          // Other pages: content only
          pdf.addImage(
            slicedImg,
            "PNG",
            marginLeft,
            marginTop,
            contentWidth,
            (sliceHeight * contentWidth) / contentCanvas.width
          );
        }

        heightLeft -= sliceHeight;
        position += sliceHeight;
        pageIndex++;
      }
      setloading(false);

      pdf.save(`${firstName}_UHID_${uhid}_${filename}.pdf`);
    } catch (error) {
      setloading(false);
      console.error("Error generating PDF:", error);
    }
  };

  const borderColor = gender === "Male" ? "#00685F" : gender === "Female" ? "#F14E9A" : "gray";

  const style = {
    border: `2px solid ${borderColor}`
  };
  return (
    <>
      {/* Hidden header element (can be styled for PDF layout) */}
      <div
        ref={headerRef}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "0",
          visibility: "visible",
          zIndex: -1
        }}
        className="w-full p-4 mb-10 flex justify-between items-center bg-white"
      >
        <div className=" w-1/4 ">
          <img alt="Logo" className="w-48 h-24" src={Logo} />
        </div>

        {!headerDetailHiden && (
          <div className="flex">
            <div className="flex  items-center py-4">
              <div
                style={style}
                className={`flex rounded-full  border-2 ${
                  gender == "Male"
                    ? "border-[#00685F]"
                    : gender == "Female"
                    ? "border-[#F14E9A]"
                    : "border-gray-500"
                }   overflow-hidden w-18 h-18 items-center justify-center`}
              >
                <div
                  style={{ background: "#C1D1A8", borderColor: "white" }}
                  className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center"
                >
                  {image ? (
                    <img
                      src="https://www.shutterstock.com/image-photo/8-week-old-black-labrador-260nw-2456159591.jpg"
                      //  src={image}
                      alt="profile"
                      className="w-full h-full"
                    />
                  ) : (
                    <div
                      style={{ color: "#575F4A" }}
                      className="w-full flex  uppercase text-sm font-semibold text-[#575F4A] items-center justify-center"
                    >
                      {firstName?.slice(0, 1)}
                      {lastName?.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <div className="flex mb-1  items-center">
                  <h2 className="text-lg font-semibold">
                    {firstName &&
                      capitalizeFirstLetter(
                        firstName?.length > 15 ? firstName?.slice(0, 15) + "..." : firstName
                      )}{" "}
                    {lastName &&
                      capitalizeFirstLetter(
                        lastName.length > 15 ? lastName.slice(0, 15) + "..." : lastName
                      )}
                  </h2>
                </div>
                <p style={{ color: "#6a7282" }} className="text-lg text-gray-600">
                  UHID:
                  <span style={{ color: "black" }} className="font-semibold text-black">
                    {" "}
                    {formatId(uhid)}
                  </span>
                </p>
              </div>
            </div>
            <div className="border mx-5 h-10 my-auto"></div>
            <div className="flex items-start flex-col justify-center">
              <div>
                <div style={{ color: "#6a7282" }} className="text-gray-500 text-lg font-medium">
                  Gender:{" "}
                  <span style={{ color: "black" }} className="text-black font-semibold text-lg">
                    {gender || "--"}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ color: "#6a7282" }} className="text-gray-500 text-lg font-medium">
                  age:{" "}
                  <span style={{ color: "black" }} className="text-black font-semibold text-lg">
                    {" "}
                    {age || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download button */}
      {!loading ? (
        <div onClick={handleDownload} className="cursor-pointer">
          {button}
        </div>
      ) : (
        <Loader />
      )}
      {/* <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {buttonText}
      </button> */}
    </>
  );
};

export default DownloadAsPDF;
