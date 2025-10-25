export interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
  export interface ImageCropperProps {
    image: string;
    onCropDone: (_croppedImage: File) => void;
    onCropCancel: () => void;
  }