import { Link } from "wouter";
import { FaceFrownIcon } from "@heroicons/react/24/outline";

const NotFound: React.FC = () => (
  <div className="flex flex-1 flex-col justify-center items-center gap-4">
    <FaceFrownIcon className="w-8 h-8" />
    <h1 className="text-3xl">404 Not Found</h1>
    <Link
      to="/"
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
    >
      Go to home page
    </Link>
  </div>
);

export default NotFound;
