"use client";
import React from "react";

function ShoppingMap({ activeStep = 2 }) {
	const steps = [1, 2, 3];

	return (
		<>
			<div className="w-full h-auto py-6 flex flex-col items-center justify-end px-4 md:px-6">
				<div className="w-full max-w-[930px]">
					<div className="w-full h-auto flex items-center justify-center gap-3 md:gap-4 lg:gap-6">
						{steps.map((step, index) => (
							<React.Fragment key={step}>
								<div
									className={`
                    flex items-center justify-center rounded-[10px]
                    w-8 h-8 md:w-9 md:h-9 lg:w-[40px] lg:h-[40px]
                    ${activeStep === step ? "bg-[#264A3F]" : "bg-[#ECECEC]"}
                  `}>
									<p
										className={`
                      text-[16px] md:text-[18px] lg:text-[20px] 
                      ${activeStep === step ? "text-white" : "text-black"}
                    `}>
										{step}
									</p>
								</div>

								{index < steps.length - 1 && (
									<div
										className="
                      flex-1 border-t-2 border-dashed border-[#D2CFCF]
                      lg:w-[247px] lg:flex-none
                    "
									/>
								)}
							</React.Fragment>
						))}
					</div>
				</div>

				<div className="w-full max-w-[930px] mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-0">
					<div className="text-center sm:text-left">
						<p className="text-[16px] md:text-[18px] lg:text-[20px] ">
							Billing & Shipping Address
						</p>
					</div>
					<div className="text-center">
						<p className="text-[16px] md:text-[18px] lg:text-[20px] ">
							Review and confirm
						</p>
					</div>
					<div className="text-center sm:text-right">
						<p className="text-[16px] md:text-[18px] lg:text-[20px]  lg:pr-13">
							Payment Option
						</p>
					</div>
				</div>
			</div>
		</>
	);
}

export default ShoppingMap;
