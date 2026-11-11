import React from "react";
import { useNavigate } from "react-router-dom";
import AboutBG from "../../assets/AboutUs/AboutBG.svg";

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32"; // consistent padding

const RingSize = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <div
        className="w-full h-[318px] bg-cover bg-center"
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
              navigate("/");
            }}
          >
            Home
          </a>
          <span className="text-[#444445] text-base sm:text-[22px]">&gt;</span>
          <a
            onClick={() => navigate(-1)}
            className="text-[#444445] cursor-pointer text-base sm:text-[22px]"
          >
            Ring Size Guide
          </a>
        </div>

        {/* Title */}
        <div className="w-full h-[110px] flex justify-center items-center text-center">
          <h1 className="text-[32px] sm:text-[42px]  font-semibold">
            Ring Size Guide
          </h1>
        </div>

        {/* Tagline */}
        <div className="w-full h-[150px] flex flex-col items-center text-center text-[20px] sm:text-[26px] font-semibold ">
          <p>Experience the perfect fit with rings from</p>
          <p>GEMRISHI</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={"w-full h-auto flex flex-col gap-6 " + PADDING_CLASS}>
        {/* Introduction */}
        <p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mt-20 mb-6">
          Selecting the correct ring size is essential for comfort and security.
          A ring that is too loose may fall off, while a tight ring can be
          uncomfortable and difficult to remove. Whether you are shopping for an
          engagement ring, wedding band, or a fashion ring, knowing the right
          size ensures a perfect fit.
        </p>

        {/* How to Measure Your Ring Size */}
        <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
          How to Measure Your Ring Size
        </h2>
        <p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
          To measure your ring size at home, you can use a ring size chart, a
          piece of string or floss, or a ring measurement tool. If using string
          or floss, be careful not to stretch it too taut, as this can lead to
          an inaccurate measurement. For more accuracy, use a ring sizer which
          could be a ring-measuring tape or a keyring type ring sizer with metal
          loops of different sizes. A perfect ring fit should be snug enough not
          to fall off but loose enough to slide over your knuckle with some
          resistance.
        </p>

        {/* Ring Size Chart */}
        <h3 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
          Ring Size Chart
        </h3>
        <p className="text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
          Below is a standard ring size chart with corresponding diameters and
          circumferences. Use this chart to determine your ring size based on
          the measurement of your finger.
        </p>
		<p>
			Note: For orders above ₹20,000, we provide a complimentary ring sizing loop after payment. It will help you determine your precise ring size and is shipped within 3 to 10 days, depending on your location.
		</p>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border px-4 py-2 text-[16px] sm:text-[18px]">
                  UK Size
                </th>
                <th className="border px-4 py-2 text-[16px] sm:text-[18px]">
                  US Size
                </th>
                <th className="border px-4 py-2 text-[16px] sm:text-[18px]">
                  Indian Size
                </th>
                <th className="border px-4 py-2 text-[16px] sm:text-[18px]">
                  Circumference of Ring (mm)
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                { uk: "H½", us: "4¼", india: "7", circ: 47.4 },
                { uk: "I", us: "4½", india: "8", circ: 48.0 },
                { uk: "J", us: "4¾", india: "9", circ: 48.7 },
                { uk: "K", us: "5¼", india: "10", circ: 50.0 },
                { uk: "L", us: "5¾", india: "11", circ: 51.2 },
                { uk: "L½", us: "6", india: "12", circ: 51.9 },
                { uk: "M½", us: "6½", india: "13", circ: 53.1 },
                { uk: "N½", us: "7", india: "14", circ: 54.4 },
                { uk: "O", us: "7¼", india: "15", circ: 55.1 },
                { uk: "P", us: "7¾", india: "16", circ: 56.3 },
                { uk: "P½", us: "8", india: "17", circ: 57.0 },
                { uk: "Q½", us: "8½", india: "18", circ: 58.3 },
                { uk: "R", us: "8¾", india: "19", circ: 58.9 },
                { uk: "S", us: "9¼", india: "20", circ: 60.2 },
                { uk: "S½", us: "9½", india: "21", circ: 60.8 },
                { uk: "T½", us: "10", india: "22", circ: 62.1 },
                { uk: "U", us: "10¼", india: "23", circ: 62.7 },
                { uk: "V", us: "10¾", india: "24", circ: 64.0 },
                { uk: "V½", us: "11", india: "25", circ: 64.6 },
                { uk: "W½", us: "11½", india: "26", circ: 65.9 },
                { uk: "X½", us: "12", india: "27", circ: 67.2 },
                { uk: "Y", us: "12¼", india: "28", circ: 67.8 },
                { uk: "Z½", us: "12¾", india: "29", circ: 69.1 },
                { uk: "13", us: "13", india: "30", circ: 69.7 },
                { uk: "13½", us: "13½", india: "31", circ: 71.0 },
                { uk: "Z2", us: "13¾", india: "32", circ: 71.7 },
                { uk: "14¼", us: "14¼", india: "33", circ: 72.9 },
                { uk: "14¾", us: "14¾", india: "34", circ: 74.2 },
                { uk: "15", us: "15", india: "35", circ: 74.8 },
                { uk: "15½", us: "15½", india: "36", circ: 76.1 },
                { uk: "16", us: "16", india: "37", circ: 77.4 },
              ].map((row, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2 text-[16px] sm:text-[18px]">
                    {row.uk}
                  </td>
                  <td className="border px-4 py-2 text-[16px] sm:text-[18px]">
                    {row.us}
                  </td>
                  <td className="border px-4 py-2 text-[16px] sm:text-[18px]">
                    {row.india}
                  </td>
                  <td className="border px-4 py-2 text-[16px] sm:text-[18px]">
                    {row.circ}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Tips */}
        <h3 className="text-[20px] sm:text-[24px] font-semibold text-[#264A3F] mb-4">
          Additional Tips
        </h3>
        <ul className="list-disc pl-6 text-[#626262] text-[16px] sm:text-[18px] leading-relaxed mb-6">
          <li>Measure your finger at the end of the day when it is warm.</li>
          <li>Avoid measuring when your fingers are swollen or cold.</li>
          <li>
            If you're between sizes, it's generally recommended to size up.
          </li>
          <li>
            Consider the width of the ring; wider bands may require a slightly
            larger size.
          </li>
          <li>
            If purchasing a ring as a surprise, the average women's ring size is
            between 5 and 7, and men's is between 10 and 11.
          </li>
        </ul>

        {/* Conclusion */}
        <p className="text-[#464646] text-[16px] sm:text-[20px] leading-relaxed mb-24">
          Selecting the correct ring size is essential for comfort and security.
          A ring that is too loose may fall off, while a tight ring can be
          uncomfortable and difficult to remove. Whether you are shopping for an
          engagement ring, wedding band, or a fashion ring, knowing the right
          size ensures a perfect fit.
        </p>
      </div>
    </>
  );
};

export default RingSize;
