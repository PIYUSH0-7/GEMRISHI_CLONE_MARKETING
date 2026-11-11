import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg"; // hero background image

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const CareerPage = () => {
  return (
    <>
      {/* Hero Section */}
      <div
        className="w-full h-[318px] bg-cover bg-center flex flex-col justify-center items-center text-center"
        style={{ backgroundImage: `url(${AboutBG})` }}
      >
        {/* Breadcrumbs */}
        <div
          className={
            "w-full h-[58px] flex flex-row items-center gap-2 " + PADDING_CLASS
          }
        >
          <a
            href="/"
            className="text-[#444445] cursor-pointer text-base sm:text-[22px]"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
            }}
          >
            Home
          </a>
          <span className="text-[#444445] text-base sm:text-[22px]">&gt;</span>
          <a
            className="text-[#444445] cursor-pointer text-base sm:text-[22px]"
            onClick={() => window.history.back()}
          >
            Career
          </a>
        </div>

        {/* Title */}
        <div className="w-full h-[110px] flex justify-center items-center">
          <h1 className="text-[32px] sm:text-[42px] font-semibold">
            Would you like to join our team?
          </h1>
        </div>

        {/* Tagline */}
        <div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold">
          <p>
            Make money by supporting our team in a spacious environment or at
            your home. Fashions fade, style is eternal.
          </p>
        </div>
      </div>
      {/* Main Content */}
      <div className={"w-full h-auto flex flex-col gap-10 " + PADDING_CLASS}>
        {/* Section Title */}
        <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#264A3F] mt-20 mb-4">
          Current Job Openings
        </h2>

        {/* Job List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job 1 */}
          <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-[22px] font-semibold text-[#264A3F] mb-2">
              Customer Support Executive
            </h3>

            <p className="text-[#555] text-[16px] mb-2">
              <strong>Location:</strong> Remote / Work From Home
            </p>
            <p className="text-[#555] text-[16px] mb-4">
              <strong>Type:</strong> Full-Time
            </p>

            <p className="text-[#666] text-[16px] leading-relaxed mb-6">
              Handle customer queries, assist buyers, resolve issues, and
              maintain excellent communication. Must be comfortable speaking
              with customers and managing CRM systems.
            </p>

     <a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=sameer@gemrishi.com&su=Application%20for%20Customer%20Support%20Executive"
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="px-6 py-2 bg-[#264A3F] text-white rounded-md hover:bg-[#1b362f] transition">
    Apply Now
  </button>
</a>


          </div>

          {/* Job 2 */}
          <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-[22px] font-semibold text-[#264A3F] mb-2">
              Social Media Manager
            </h3>

            <p className="text-[#555] text-[16px] mb-2">
              <strong>Location:</strong> Pune / Hybrid
            </p>
            <p className="text-[#555] text-[16px] mb-4">
              <strong>Type:</strong> Part-Time / Full-Time
            </p>

            <p className="text-[#666] text-[16px] leading-relaxed mb-6">
              Create engaging content, manage social media accounts, plan
              campaigns, and increase brand awareness. Experience with Instagram
              & Facebook ads is preferred.
            </p>

<a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=sameer@gemrishi.com&su=Application%20for%20Social%20Media%20Manager"
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="px-6 py-2 bg-[#264A3F] text-white rounded-md hover:bg-[#1b362f] transition">
    Apply Now
  </button>
</a>


          </div>

          {/* Job 3 */}
          <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-[22px] font-semibold text-[#264A3F] mb-2">
              Video Content Creator
            </h3>

            <p className="text-[#555] text-[16px] mb-2">
              <strong>Location:</strong> Remote
            </p>
            <p className="text-[#555] text-[16px] mb-4">
              <strong>Type:</strong> Freelance / Contract
            </p>

            <p className="text-[#666] text-[16px] leading-relaxed mb-6">
              Produce short-form videos for reels, ads, and product showcases.
              Must know basic editing (CapCut/Premiere). Creative mindset
              required.
            </p>

<a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=sameer@gemrishi.com&su=Application%20for%20Video%20Content%20Creator"
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="px-6 py-2 bg-[#264A3F] text-white rounded-md hover:bg-[#1b362f] transition">
    Apply Now
  </button>
</a>


          </div>

          {/* Job 4 */}
          <div className="border p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-[22px] font-semibold text-[#264A3F] mb-2">
              Warehouse Assistant
            </h3>

            <p className="text-[#555] text-[16px] mb-2">
              <strong>Location:</strong> Pune
            </p>
            <p className="text-[#555] text-[16px] mb-4">
              <strong>Type:</strong> Full-Time
            </p>

            <p className="text-[#666] text-[16px] leading-relaxed mb-6">
              Assist with product packing, QC, inventory updates, and order
              management. Basic computer knowledge is a bonus.
            </p>

        <a
  href="https://mail.google.com/mail/?view=cm&fs=1&to=sameer@gemrishi.com&su=Application%20for%20Warehouse%20Assistant%20Executive"
  target="_blank"
  rel="noopener noreferrer"
>
  <button className="px-6 py-2 bg-[#264A3F] text-white rounded-md hover:bg-[#1b362f] transition">
    Apply Now
  </button>
</a>

          </div>
        </div>

        {/* Extra Bottom Section */}
        <div className="text-center my-20">
          <h3 className="text-[24px] text-[#264A3F] font-semibold mb-4">
            Didn’t find a role suitable for you?
          </h3>
          <p className="text-[#555] text-[18px]">
            Send your resume at{" "}
            <span className="font-semibold text-[#264A3F]">
              careers@gemrishi.com
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default CareerPage;
