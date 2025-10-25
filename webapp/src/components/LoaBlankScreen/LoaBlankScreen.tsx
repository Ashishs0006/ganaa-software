const LoaBlankScreen = () => {
  return (
    <div className=" bg-[#F4F2F0] p-5 lg:px-8 sm:px-4 py-0 pb-10 rounded-lg font-semibold">
      <div className="rounded-2xl h-[200px] bg-white">
        <div className="flex items-center h-full justify-between  border-gray-300">
          <div className="w-full flex h-full justify-center items-center">
            <p>The patient is on LOA today.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoaBlankScreen;
