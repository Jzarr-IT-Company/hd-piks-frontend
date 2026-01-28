import React from 'react'
import terms from '../../assets/terms.png'

function TermsAndConditionsBanner1() {
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="">
                    <div className="card text-bg-dark">
                        <img src={terms} className="card-img" alt="..." />
                        <div 
                            className="card-img-overlay d-flex justify-content-center align-items-center"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Overlay color with opacity
                            }}
                        >
                            <p className="card-title text-center display-3">Terms And Conditions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TermsAndConditionsBanner1
