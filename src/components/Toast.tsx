import { useEffect } from "react";
import clsx from "clsx";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  message: string;
  type: "success" | "info" | "error";
  onClose: () => void;
};

const Toast: React.FC<Props> = ({ message, type, onClose }) => {
  useEffect(() => {
    if (message) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [message, onClose]);

  return (
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
        {message}.
      </span>
      <XMarkIcon className="w-5 h-5 cursor-pointer" onClick={onClose} />
    </div>
  );
};

export default Toast;
