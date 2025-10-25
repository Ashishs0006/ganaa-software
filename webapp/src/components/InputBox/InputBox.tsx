const InputBox = ({ value, label }: { value: string | number; label?: string }) => {
  return (
    <div
      title={value !== undefined ? value.toString() : undefined}
      className="flex cursor-default flex-col gap-2 text-xs"
    >
      <label className="font-medium">{label}</label>
      <div className="font-semibold p-3 bg-[#F4F2F0] whitespace-nowrap text-nowrap border-[#DEDEDE] border rounded-lg">
        <p className="truncate">{value || "--"}</p>
      </div>
    </div>
  );
};

export default InputBox;
