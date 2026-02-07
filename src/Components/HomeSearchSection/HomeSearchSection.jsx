import React from "react";
import HomeBannerSearchbarFilterationCompo from "../HomeBannerSearchbarFilterationCompo/HomeBannerSearchbarFilterationCompo";
import HomeBannerSearchFilterationCompo2 from "../HomeBannerSearchFilterationCompo2/HomeBannerSearchFilterationCompo2";
import AppNavbarBanner1Compo from "../AppNavbarBanner1Compo/AppNavbarBanner1Compo";
import AiToolsCards from "../AiToolsCards/AiToolsCards";

function HomeSearchSection() {
	return (
		<section className="container-fluid py-3">
			<div className="mx-auto" style={{ maxWidth: 1200 }}>
				{/* Desktop search bar */}
				<HomeBannerSearchbarFilterationCompo />

				{/* AI tools cards row */}
				<div className="mt-3 mb-2 px-2 px-md-0">
					<AiToolsCards
						onSelect={(tool) => {
							// optional: handle navigation or tracking here
							console.log("AI tool clicked:", tool.id);
						}}
					/>
				</div>

				{/* Mobile / secondary search bar + sub-subcategory suggestions */}
				<div className="mt-2">
					<HomeBannerSearchFilterationCompo2 />
				</div>

				{/* Extra banner/CTA below search + AI tools */}
				<div className="mt-3">
					<AppNavbarBanner1Compo />
				</div>
			</div>
		</section>
	);
}

export default HomeSearchSection;
