import noRecords from "@/assets/images/emptyRecord.svg";

const EmptyRecord = ({ className }: { className?: string }) => {
  return (
    <div className={`flex w-fit h-fit flex-col items-center ${className} justify-center gap-6`}>
      <img alt="nodata" src={noRecords} />
      <p className="text-[14px] font-semibold">Empty Records</p>
    </div>
  );
};

export default EmptyRecord;
