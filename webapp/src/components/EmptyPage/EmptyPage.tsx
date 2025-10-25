import { Link } from "react-router-dom";

import { Button } from "@/components";
import noData from "@/assets/images/noData.png";

const EmptyPage = ({
  title,
  subtitle,
  links,
  hidden,
  buttonText
}: {
  hidden?: boolean;
  title?: string;
  subtitle?: string;
  links?: string;
  buttonText?: string;
}) => {
  return (
    <div
      id="EmptyPage"
      className="container flex  w-full mt-20 flex-col gap-5 items-center justify-center"
    >
      <img alt="no data" src={noData} className="w-[10%]" />

      <p className="font-bold text-2xl">{title}</p>

      <p className="font-medium text-xs">{subtitle}</p>

      {!hidden && links && (
        <Link to={links}>
          <Button className="!font-semibold !text-xs" variant="contained">
            {buttonText}
          </Button>
        </Link>
      )}
    </div>
  );
};

export default EmptyPage;
