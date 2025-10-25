import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { IAppDropZone, IOnDropProps } from "@/components/AppDropZone/types";

const AppDropZone = ({ accept, onDrop, children, disabled = false, ...props }: IAppDropZone) => {
  const _onDrop = useCallback<IOnDropProps>(
    (acceptedFiles) => {
      if (onDrop) onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: _onDrop });

  return (
    <div {...getRootProps()} {...props}>
      <input {...getInputProps()} accept={accept} disabled={disabled} />
      {children}

      {isDragActive && (
        <div className="fixed top-56 bottom-10 left-10 right-10 bg-[#ffffffd2] z-50 border-4 border-dashed border-blue-500 rounded-xl flex items-center justify-center">
          <p className="font-bold text-2xl">Drop you files here</p>
        </div>
      )}
    </div>
  );
};

export default AppDropZone;
