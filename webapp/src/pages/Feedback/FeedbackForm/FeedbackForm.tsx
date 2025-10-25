import { SyntheticEvent, useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";

import { Button } from "@/components";

import feedbackBanner from "@/assets/images/Mask Group 35.png";
import logo from "@/assets/images/logoInwhite.png";
import { useNavigate, useParams } from "react-router-dom";
import handleError from "@/utils/handleError";
import { getFeedback, getFeedbackQuestionaire, updateFeedback } from "@/apis";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formatDate,
  formatId
} from "@/utils/formater";
import toast from "react-hot-toast";

const FeedbackForm = () => {
  const { id, aid } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<{ type: string; question: string }[]>([]);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [patientData, setPatientData] = useState<{
    uhid?: string;
    firstName?: string;
    gender?: string;
    lastName?: string;
    admissionDateTime?: string;
    dischargeDate?: string;
    dischargeStatus?: string;
    phoneNumber?: string;
    phoneNumberCountryCode?: string;
    patientPic?: string;
    feedbackInfo?: {
      _id: string;
      patientId: string;
      patientAdmissionHistoryId: string;
      status: string;
      questionAnswer: { question: string; answer: string }[];
    };
    centerMap?: string;
  }>({});
  const [ratings, setRatings] = useState<number[]>([]);

  const fetchQuestions = async (status: string, datas: { question: string; answer: string }[]) => {
    const { data } = await getFeedbackQuestionaire();
    setQuestions(data?.data);
    setRatings(Array(data?.data?.length).fill(0));
    if (status === "Completed") {
      if (data?.data?.length > 0) {
        const updatedAnswers = data?.data?.map((question: { question: string }) => {
          const existingAnswer = datas?.find((ans) => ans?.question === question?.question);
          return {
            question: question?.question,
            answer: existingAnswer ? existingAnswer?.answer : ""
          };
        });
        setAnswers(updatedAnswers);
        setRatings(updatedAnswers.map((ans: { answer: string }) => parseInt(ans.answer)));
      }
    }
  };

  const fetchFeedback = async (id: string, aid: string) => {
    try {
      const response = await getFeedback(id, aid);
      if (response.status === 200) {
        setPatientData(response?.data?.data);
        await fetchQuestions(
          response?.data?.data?.feedbackInfo?.status,
          response?.data?.data.feedbackInfo?.questionAnswer
        );
      }
    } catch (error) {
      console.log(error);
      handleError(error);
      setTimeout(() => navigate(-1), 2000);
    }
  };

  useEffect(() => {
    if (aid && id) fetchFeedback(id, aid);
  }, [id, aid]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleStarClick = (index: number, rating: number) => {
    if (patientData?.feedbackInfo?.status === "Completed") return;
    const questionText = questions[index]?.question;
    setRatings((prev) => {
      const updated = [...prev];
      updated[index] = rating;
      return updated;
    });
    setAnswers((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex((ans) => ans.question === questionText);
      if (existingIndex !== -1) {
        updated[existingIndex].answer = rating.toString();
      } else {
        updated.push({ question: questionText, answer: rating.toString() });
      }
      return updated;
    });
  };

  const renderStars = (questionIndex: number, selectedRating: number) => {
    const getColor = (rating: number) => {
      if (rating >= 9) return "bg-green-600 text-white";
      if (rating >= 8) return "bg-green-500 text-white";
      if (rating >= 7) return "bg-lime-500 text-white";
      if (rating === 6) return "bg-yellow-400 text-black";
      if (rating === 5) return "bg-yellow-500 text-black";
      if (rating === 4) return "bg-orange-400 text-white";
      if (rating === 3) return "bg-orange-500 text-white";
      if (rating === 2) return "bg-red-500 text-white";
      return "bg-red-700 text-white"; // rating 1
    };

    return Array.from({ length: 10 }, (_, i) => i + 1).map((rating) => (
      <div key={rating} className="relative w-fit">
        <div
          className={`md:w-10  w-6 h-6 md:h-10 rounded flex items-center justify-center font-medium cursor-pointer ${getColor(
            rating
          )} ${selectedRating === rating ? "md:ring-2 ring-1 ring-offset-1 ring-black" : ""}`}
          onClick={() => handleStarClick(questionIndex, rating)}
        >
          {rating}
        </div>
        {selectedRating === rating && (
          <FaCheck className="absolute -bottom-5 right-1 md:right-2 text-green-700" />
        )}
      </div>
    ));
  };

  const handleSubmit = async () => {
    if (patientData?.feedbackInfo?.status === "Completed") return;
    if (!id && !aid) throw Error("Invalid id or aid");

    if (id && aid) {
      if (
        answers.length == 4 &&
        answers.every((item) => item.answer && item.answer.trim() !== "")
      ) {
        const response = await updateFeedback(id, aid, { questionAnswer: answers });
        if (response.status === 200) {
          navigate("/feedback/review", {
            replace: true,
            state: { mapLink: patientData.centerMap }
          });
        }
      } else {
        toast.error("Kindly Fill All The Details");
      }
    }
  };

  const handleChange = (e: SyntheticEvent, data: { question: string }) => {
    if (patientData?.feedbackInfo?.status == "Completed") return;
    const { value } = e.target as HTMLInputElement;
    setAnswers((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex((ans) => ans.question === data.question);
      if (existingIndex !== -1) {
        updated[existingIndex].answer = value;
      } else {
        updated.push({ question: data.question, answer: value });
      }
      return updated;
    });
  };

  return (
    <div id="feedback" className="bg-[#F4F2F0] py-16">
      <div className="container lg:px-24 px-3">
        <div className="w-full relative">
          <img className="w-full" src={feedbackBanner} alt="feedack" />
          <div className="absolute flex md:justify-center items-start gap-1 flex-col bottom-[20%] left-[10%] lg:left-[4%] lg:bottom-[20%]">
            <img className="lg:w-[60%] w-[20%] h-auto ml-2" src={logo} alt="logo" />
            <p className="text-white text-[15px] lg:text-[42px]">Feedback Form</p>
          </div>
        </div>
        <div className="bg-[#f9f9e6] rounded-3xl overflow-hidden ">
          <div className=" mx-auto ">
            <div className=" p-6 lg:p-12 rounded-lg bg-[#f9f9e6]  text-center ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-0 items-center lg:grid-cols-5!">
                <div className=" lg:col-span-1 md:col-span-2 mx-auto">
                  <div className="h-fit max-w-xl rounded-xl ">
                    <div className=" flex">
                      <div className="flex md:flex-row flex-col gap-2 md:gap-0 items-center py-4">
                        <div
                          className={`flex rounded-full  border-2 ${
                            patientData.gender == "Male"
                              ? "border-[#00685F]"
                              : patientData.gender == "Female"
                              ? "border-[#F14E9A]"
                              : "border-gray-500"
                          }   overflow-hidden w-20 h-20 items-center justify-center`}
                        >
                          <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                            {patientData?.patientPic ? (
                              <img
                                src={patientData?.patientPic}
                                alt="profile"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                                <div className="w-full uppercase text-[13px] font-semibold text-center">
                                  {patientData?.firstName?.slice(0, 1)}
                                  {patientData?.lastName?.slice(0, 1)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="md:ml-4">
                          <div className="flex mb-1 text-nowrap whitespace-nowrap  items-center">
                            <h2 className="text-[14px] font-semibold">
                              {patientData?.firstName &&
                                capitalizeFirstLetter(
                                  patientData?.firstName.length > 15
                                    ? patientData?.firstName.slice(0, 15) + "..."
                                    : patientData?.firstName
                                )}{" "}
                              {patientData?.lastName &&
                                capitalizeFirstLetter(
                                  patientData?.lastName.length > 15
                                    ? patientData?.lastName.slice(0, 15) + "..."
                                    : patientData?.lastName
                                )}
                            </h2>
                          </div>
                          <p className="text-[14px] text-gray-600">
                            UHID:
                            <span className="font-semibold text-black">
                              {formatId(patientData?.uhid)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-600">Mobile Number</p>
                  <p className="font-bold text-black">
                    {patientData?.phoneNumber
                      ? `${patientData?.phoneNumberCountryCode} ${patientData?.phoneNumber}`
                      : "--"}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-600">Admission Date &amp; Time</p>
                  <p className="font-bold text-black">
                    {(patientData?.admissionDateTime &&
                      formatDate(patientData?.admissionDateTime)) ||
                      "--"}
                    ,{" "}
                    {(patientData?.admissionDateTime &&
                      convertBackendDateToTime(patientData?.admissionDateTime)) ||
                      "--"}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-600 h-fit">Discharge Date</p>
                  <p className="font-bold text-black h-fit">
                    {(patientData?.dischargeDate && formatDate(patientData?.dischargeDate)) || "--"}
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="text-gray-600">Discharge Status</p>
                  <p className="font-bold text-black">{patientData?.dischargeStatus || "--"}</p>
                </div>
                {/* Message */}
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-bold">
                  We deeply value your feedback as they help us enhance the care and support we
                  provide.
                </h3>
                <p className="mt-2 mx-auto md:w-1/2 font-medium text-sm text-gray-600">
                  Please share your experience with us and let us know how we can make our services
                  even better for you and others in the future!
                </p>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="bg-white">
            <div className="mx-auto md:pt-12 md:pb-12 pt-6 pb-0 lg:mt-6 mt-0  flex flex-col items-start gap-10 rounded-lg md:w-3/4 md:px-0 px-4">
              {questions.length > 0 &&
                questions.map((data: { type: string; question: string }, index) =>
                  data?.type === "rating" ? (
                    <div key={index} className=" h-fit">
                      <div className="mb-2 text-xs font-medium">Question {index + 1}</div>
                      <p className="mb-4 text-lg font-semibold text-black">{data?.question}</p>
                      <div className="flex md:m-10 m-5 pt-0 justify-between md:w-96 md:gap-4 gap-1">
                        {renderStars(index, ratings[index])}
                      </div>
                    </div>
                  ) : (
                    <div className="md:my-10 h-fit" key={index}>
                      <p className="md:mb-4 text-lg font-semibold text-black">{data?.question}</p>
                      <textarea
                        value={answers.find((ans) => ans.question === data?.question)?.answer || ""}
                        name={data?.question}
                        className="resize-none border-2 w-full border-gray-300 rounded-lg p-4 focus:outline-none focus:border-primary-dark"
                        placeholder="Enter"
                        cols={120}
                        rows={4}
                        disabled={patientData?.feedbackInfo?.status === "Completed"}
                        onChange={(e: SyntheticEvent) => handleChange(e, data)}
                      />
                    </div>
                  )
                )}

              {/* Submit Button */}
              <div className="md:my-5 mb-5 w-full flex items-center justify-center">
                <Button
                  onClick={() => {
                    handleSubmit();
                  }}
                  disabled={patientData?.feedbackInfo?.status === "Completed"}
                  className={`py-3 text-white w-50 md:w-96 rounded-lg   ${
                    patientData?.feedbackInfo?.status === "Completed"
                      ? "bg-gray-400"
                      : "bg-[#575F4A] hover:bg-[#575F4A]!"
                  }`}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thank You Modal */}
      {/* <Modal
        isOpen={toggleRatingModal}
        toggleModal={() => setToggleRatingModal(!toggleRatingModal)}
        // crossIcon={true}
      >
        <div className="flex rounded-xl px-6 py-16 items-center justify-center">
          <div className="relative w-full max-w-md text-center rounded-lg">
            <h2 className="text-xl font-bold mb-4">Thank you for your valuable feedback</h2>
            <p className="mb-4 text-sm px-3 py-2 font-medium text-gray-600">
              We truly appreciate you taking the time to share your experience with us.
            </p>
            <hr className="my-4" />
            <p className="mb-4 max-w-sm mx-auto font-bold">
              If you enjoyed our service, we’d love to hear your thoughts on Google as well!
            </p>
            <div
              onClick={() => navigate("/")}
              className="flex py-3 mt-10 cursor-pointer items-center justify-center rounded-xl border border-[#AEAEAE] p-2 hover:shadow-md"
            >
              <FcGoogle className="text-3xl mr-5" />
              <span className="font-semibold text-gray-500"> Write a review </span>
              <div className="ml-auto flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-gray-500 mr-2" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal> */}
    </div>
  );
};

export default FeedbackForm;
