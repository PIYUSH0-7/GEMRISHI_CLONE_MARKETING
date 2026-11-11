import React from "react";
import AboutBG from "../../assets/AboutUs/AboutBG.svg"; // hero background image

const PADDING_CLASS = "px-6 sm:px-10 md:px-20 lg:px-32";

const CaratToRattiConverter = () => {
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
            Carat To Ratti Converter
          </a>
        </div>

        {/* Title */}
        <div className="w-full h-[110px] flex justify-center items-center">
          <h1 className="text-[32px] sm:text-[42px] font-semibold">
            Carat To Ratti Converter
          </h1>
        </div>

        {/* Tagline */}
        <div className="w-full h-[150px] flex flex-col items-center text-center text-[18px] sm:text-[22px] font-semibold">
          <p>
            Use Our Carat to Ratti converter and Simplify gemstone measurements
            and find accurate conversions for your precious stones.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={"w-full h-auto flex flex-col gap-8 " + PADDING_CLASS}>

        {/* Converter Title */}
        <h2 className="text-[26px] font-semibold text-[#264A3F] mt-20">
          Carat to Ratti, Gram & Milligram Converter
        </h2>

        {/* React Logic */}
        {(() => {
          const [carat, setCarat] = React.useState("");
          const [formula, setFormula] = React.useState("formula1");

          const caratValue = parseFloat(carat) || 0;

          // Formula values
          const formulas = {
            formula1: { ratti: 1.09, mg: 180 },  // 1 carat = 1.09 ratti and 180 mg
            formula2: { ratti: 1.66, mg: 120 },  // 1 carat = 1.66 ratti and 120 mg
          };

          const selected = formulas[formula];

          // Calculations
          const ratti = (caratValue * selected.ratti).toFixed(3);
          const mg = (caratValue * selected.mg).toFixed(2);
          const gram = (mg / 1000).toFixed(3); // 1000mg = 1g

          return (
            <div className="flex items-center justify-between">
              <div className="w-full max-w-xl p-6 border rounded-xl shadow bg-white">

                {/* Carat Input */}
                <label className="block text-[#264A3F] font-semibold text-lg mb-2">
                  Enter Carat:
                </label>
                <input
                  type="number"
                  value={carat}
                  onChange={(e) => setCarat(e.target.value)}
                  placeholder="Enter value in Carat"
                  className="w-full p-3 border rounded-md mb-4"
                />

                {/* Dropdown */}
                <label className="block text-[#264A3F] font-semibold text-lg mb-2">
                  Select Formula:
                </label>
                <select
                  value={formula}
                  onChange={(e) => setFormula(e.target.value)}
                  className="w-full p-3 border rounded-md mb-4"
                >
                  <option value="formula1">1 Carat = 1.09 Ratti (180 mg)</option>
                  <option value="formula2">1 Carat = 1.66 Ratti (120 mg)</option>
                </select>

                {/* Formula Info */}
                <p className="text-[#444] mb-4 text-sm">
                  <strong>
                    {formula === "formula1"
                      ? "1 Carat = 1.09 Ratti = 180 mg"
                      : "1 Carat = 1.66 Ratti = 120 mg"}
                  </strong>
                </p>

                {/* Output Fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="font-semibold text-[#264A3F]">Ratti:</label>
                    <input
                      className="w-full p-3 border rounded-md text-[#333]"
                      value={ratti}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#264A3F]">Gram:</label>
                    <input
                      className="w-full p-3 border rounded-md text-[#333]"
                      value={gram}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#264A3F]">Milligram:</label>
                    <input
                      className="w-full p-3 border rounded-md text-[#333]"
                      value={mg}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}


        {/* ---------------------------------- */}
        {/* Info Section Below Converter */}
        {/* ---------------------------------- */}

        <h2 className="text-[26px] font-semibold text-[#264A3F]">
          Understanding Ratti & Carat
        </h2>

        <p className="text-[#464646] text-[18px] leading-relaxed">
          In India, gemstone buyers commonly encounter the term <strong>“Ratti”</strong>.
          It originates from the Sanskrit word <strong>Raktika</strong> and has been
          historically used for measuring small objects.
        </p>

        <p className="text-[#464646] text-[18px] leading-relaxed">
          There are two types of Ratti:
        </p>

        <ul className="list-disc pl-6 text-[#626262] text-[18px]">
          <li><strong>Sunari Ratti</strong> – used by goldsmiths for metals</li>
          <li><strong>Pakki Ratti</strong> – used for gemstone measurements</li>
        </ul>

        <p className="text-[#464646] text-[18px] leading-relaxed">
          Since gemstones are now internationally weighed in <strong>Carats</strong>,
          many buyers get confused between both units. To simplify this, our converter
          helps you understand accurate conversions.
        </p>

        {/* Conversion Table */}
        <h2 className="text-[26px] font-semibold text-[#264A3F] mt-4">
          Standard Conversions
        </h2>

        <ul className="list-disc pl-6 text-[#626262] text-[18px] leading-relaxed">
          <li>1 Carat = <strong>1.11 Ratti</strong></li>
          <li>1 Ratti = <strong>0.90 Carat</strong></li>
          <li>1 Carat = <strong>0.20 Gram</strong></li>
          <li>1 Carat = <strong>120 Milligrams</strong></li>
        </ul>

        {/* Disclaimer */}
        <p className="text-[#626262] text-[18px] italic">
          Always verify gemstone weights with certified labs such as IGI, GIA, GTL, or GRS.
        </p>

        {/* Educational Resources */}
        <h2 className="text-[26px] font-semibold text-[#264A3F]">
          Educational Resources
        </h2>

        <ul className="list-disc pl-6 text-[#626262] text-[18px] leading-relaxed">
          <li><strong>GIA –</strong> Understanding gemstone measurements & carat weight</li>
          <li><strong>IGS –</strong> Guide to gemstone weight conversions</li>
          <li><strong>CalculatorSoup –</strong> Carat Weight Calculator</li>
          <li><strong>Wikipedia –</strong> Ratti (Unit)</li>
          <li><strong>BIS –</strong> Indian gemstone measurement standards</li>
        </ul>

        {/* CTA */}
        <div className="text-center mb-24">
          <p className="text-[#264A3F] font-semibold text-[20px] mb-4">
            For Crystal Jewelry Visit{" "}
            <a href="https://mandalagoodvibes.com/" target="_blank" className="underline">
              Mandala Good Vibes
            </a>
          </p>
          <p className="text-[#264A3F] font-semibold text-[20px]">
            For Original Gemstones Visit{" "}
            <a href="https://gemrishi.com/" target="_blank" className="underline">
              Gemrishi
            </a>
          </p>
        </div>

      </div>


    </>
  );
};

export default CaratToRattiConverter;
