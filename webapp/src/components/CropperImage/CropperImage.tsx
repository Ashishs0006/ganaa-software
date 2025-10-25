import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

import { RxRotateCounterClockwise } from "react-icons/rx";

import { Button } from "@/components";
import { CroppedArea, ImageCropperProps } from "@/components/CropperImage/types";

const getCroppedImg = (
  imageSrc: string,
  croppedAreaPixels: CroppedArea,
  rotation: number = 0
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      const newWidth = image.width * cos + image.height * sin;
      const newHeight = image.width * sin + image.height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (ctx) {
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(radians);
        ctx.drawImage(image, -image.width / 2, -image.height / 2);

        const croppedCanvas = document.createElement("canvas");
        croppedCanvas.width = croppedAreaPixels.width;
        croppedCanvas.height = croppedAreaPixels.height;
        const croppedCtx = croppedCanvas.getContext("2d");

        if (croppedCtx) {
          croppedCtx.drawImage(
            canvas,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          );

          croppedCanvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], "cropped_image.jpg", { type: "image/jpeg" });
              resolve(file);
            } else {
              reject(new Error("Canvas is empty"));
            }
          }, "image/jpeg");
        }
      } else {
        reject(new Error("Canvas context is null"));
      }
    };
    image.onerror = () => reject(new Error("Failed to load image"));
  });
};

const CropperImage = ({ image, onCropDone, onCropCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const onCropComplete = useCallback((_: CroppedArea, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropDone = async () => {
    if (croppedAreaPixels) {
      const croppedFile = await getCroppedImg(image, croppedAreaPixels, rotation);
      onCropDone(croppedFile);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="relative bg-white p-5 rounded-lg shadow-lg">
        <div className="w-72 h-96 relative">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={3 / 3}
            rotation={rotation}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <Button
            name="save"
            onClick={handleCropDone}
            className=" text-xs! px-[30px]! py-[10px]! rounded-lg!"
            variant="contained"
            size="base"
          >
            Crop
          </Button>

          <RxRotateCounterClockwise
            size={20}
            className="cursor-pointer"
            onClick={() => setRotation((prev) => prev + 90)}
          />
          <Button
            type="submit"
            name="next"
            className="text-xs! py-[10px]! rounded-lg!"
            variant="outlined"
            size="base"
            onClick={onCropCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropperImage;
