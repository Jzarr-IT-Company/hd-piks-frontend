import React from 'react'
import PricingPlanBaneer1 from '../Components/PricingPlanBaneer1/PricingPlanBaneer1'
import TopNavOnly from '../Components/AppNavbar/TopNavOnly'
import AppFooter from '../Components/AppFooter/AppFooter'

function PricingPlan() {
  return (
    <>
      <TopNavOnly />
      <main className="top-nav-content">
        <PricingPlanBaneer1 />
      </main>
      <AppFooter />
    </>
  )
}
  
export default PricingPlan
