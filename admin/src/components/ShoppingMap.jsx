import React from "react";

function ShoppingMap({ activeStep = 2 }) {
  const steps = [1, 2, 3];

  return (
    // hidden on small & medium, visible only on large+
    <div className="flex w-full h-auto flex-col items-center justify-end py-6 px-6">
      <div className="w-full">
        <div className="w-full h-auto flex items-center justify-center gap-6">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`flex items-center justify-center rounded-[10px] w-10 h-10 ${
                  activeStep === step ? "bg-[#264A3F]" : "bg-[#ECECEC]"
                }`}
              >
                <p
                  className={`text-md ${
                    activeStep === step ? "text-white" : "text-black"
                  }`}
                >
                  {step}
                </p>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 border-t-2 border-dashed border-[#D2CFCF] w-full" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="w-full mt-4 grid grid-cols-3">
        <div className="text-left">
          <p className="text-md">Billing & Shipping<br /> Address</p>
        </div>
        <div className="text-center">
          <p className="text-md">Review and confirm</p>
        </div>
        <div className="text-right">
          <p className="text-md">Payment</p>
        </div>
      </div>
    </div>
  );
}

export default ShoppingMap;
