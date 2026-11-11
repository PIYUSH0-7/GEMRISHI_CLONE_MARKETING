import React from "react";
import BlueSapphireJewellery from "../../components/BlueSapphireJewellery";
import video from "../../assets/gem_video.mp4"

function VideoBottom() {
	return (
		<>
			<div>
				{/* Video Section */}
				<div className="w-full lg:h-[666px] flex items-center justify-center py-12 lg:py-0 font-poppins">
					<div className="w-full max-w-[1550px] h-auto lg:h-[466px] bg-gradient-to-r from-gray-100 to-gray-200 flex flex-col lg:flex-row items-center justify-between rounded-xl shadow-md overflow-hidden">

						{/* Text Content */}
						<div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 lg:p-12">
							<div className="w-full max-w-[450px] flex flex-col gap-6 text-center lg:text-left">
								<h1 className="text-3xl lg:text-4xl font-bold text-[#0B1D3A] tracking-tight">
									True gemstones are not created. They are discovered.
								</h1>
								<p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
									This video shows how natural gemstones are mined from the earth,
									preserving their original energy and astrological effectiveness.
									At GemRishi, purity starts at the source.
								</p>
							</div>
						</div>

						{/* Video Player */}
						<div className="w-full lg:w-1/2 h-auto lg:h-full flex items-center justify-center p-6 lg:p-12">
							<div className="w-full max-w-[547px] aspect-video rounded-lg overflow-hidden shadow-lg">
								<video
									className="w-full h-full object-cover"
									src={video}
									controls
								/>
							</div>
						</div>
					</div>
				</div>

			</div>
		</>
	);
}

export default VideoBottom;
