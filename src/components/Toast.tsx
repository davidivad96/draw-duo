import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ToastType } from "../types";

type Props = {
  message: string;
  type: ToastType;
  onClose: () => void;
};

const Toast: React.FC<Props> = ({ message, type, onClose }) => (
  <div
    className={clsx(
      "fixed flex justify-between items-center right-5 w-full max-w-xs p-4 mb-4 text-sm rounded-lg",
      {
        "bg-red-100 text-red-800": type === "error",
        "bg-green-100 text-green-800": type === "success",
        "bg-blue-100 text-blue-800": type === "info",
      }
    )}
  >
    <span className="font-normal text-md">
      {type === "error" ? "Error: " : type === "success" ? "Success: " : ""}
      {message}
    </span>
    <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={onClose} />
  </div>
);

export default Toast;
