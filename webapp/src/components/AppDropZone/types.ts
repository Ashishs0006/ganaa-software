import { HTMLAttributes } from "react";
import { DropEvent, FileRejection } from "react-dropzone";

export type IOnDropProps = <T extends File>(
  _acceptedFiles: T[],
  _fileRejections: FileRejection[],
  _event: DropEvent
) => void;

export interface IAppDropZone extends Omit<HTMLAttributes<HTMLDivElement>, "onDrop"> {
  onDrop?: <T extends File>(_acceptedFiles: T[]) => void;
  accept?: string;
  disabled?: boolean;
}
