import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
function AppNavbarOffcanvasContentCompo({ handleClose }) {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleCLoseBtn = () => {
        handleClose()
    }
    return (
        <>
            <div style={{ marginBottom: 0 }}>
                <Accordion
                    expanded={expanded === 'panel1'}
                    onChange={handleChange('panel1')}
                    disableGutters
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        className='border-bottom'
                        style={{ boxShadow: "none" }}

                    >
                        Explore
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="d-flex flex-column" style={{ gap: "3px 0px" }}>
                            <div className="text-start w-100" >
                                <Link className='btn btn-light w-100 fw-semibold py-4' style={{ textAlign: "start" }} onClick={handleCLoseBtn} to={`/member`}>Member</Link>
                            </div>
                            <div className="text-start w-100" >
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' style={{ textAlign: "start" }} onClick={handleCLoseBtn} to={`/collection/${"Artificial Chirstmas Trees"}`}>Collection</Link>
                            </div>
                            <div className="text-start w-100" >
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' style={{ textAlign: "start" }} onClick={handleCLoseBtn} to={`/collection/${"Premium"}`}>Premium</Link>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel2'}
                    onChange={handleChange('panel2')}
                    disableGutters
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                        className='border-bottom'
                        style={{ boxShadow: "none" }}
                    >
                        Images
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="d-flex flex-column" style={{ gap: "3px 0px" }}>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Vector"}`}>Vector</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Photos"}`}>Photos</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"AI Images"}`}>AI Images</Link>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel3'}
                    onChange={handleChange('panel3')}
                    disableGutters
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3-content"
                        id="panel3-header"
                        className='border-bottom'
                        style={{ boxShadow: "none" }}
                    >
                        Videos
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="d-flex flex-column" style={{ gap: "3px 0px" }}>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Backgrounds and others"}`}>Backgrounds and others</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Nature"}`}>Nature</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Travel and places"}`}>Travel and places</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Business and technology"}`}>Business and technology</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"People and emotions"}`}>People and emotions</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Events"}`}>Events</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Food and drinks"}`}>Food and drinks</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Sports"}`}>Sports</Link>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <Accordion
                    expanded={expanded === 'panel4'}
                    onChange={handleChange('panel4')}
                    disableGutters
                    className='border-bottom border-end border-start'
                    style={{ boxShadow: "none" }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel4-content"
                        id="panel4-header"
                    >
                        PSD
                    </AccordionSummary>
                    <AccordionDetails>
                        <div className="d-flex flex-column" style={{ gap: "3px 0px" }}>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Stationery"}`}>Stationery</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Social media"}`}>Social media</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Greeting cards"}`}>Greeting cards</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Flyers"}`}>Flyers</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Logos"}`}>Logos</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Business cards"}`}>Business cards</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Posters"}`}>Posters</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Invitation cards"}`}>Invitation cards</Link>
                            </div>
                            <div className="text-start w-100">
                                <Link className='btn btn-light w-100 fw-semibold py-4 text-start' onClick={handleCLoseBtn} to={`/collection/${"Banners"}`}>Banners</Link>
                            </div>
                        </div>
                    </AccordionDetails>
                </Accordion>
                <div className="text-start w-100 border-bottom border-end border-start">
                    <Link className='btn  w-100 fw-semibold py-3 text-start' onClick={handleCLoseBtn} target='_blank' to={`https://design.hdpiks.com/`}>Creating Design</Link>
                </div>
                <div className="text-start w-100 border-bottom border-end border-start">
                    <Link className='btn  w-100 fw-semibold py-3 text-start' onClick={handleCLoseBtn} to={`/pricing`}>Pricing</Link>
                </div>
            </div>
        </>
    )
}

export default AppNavbarOffcanvasContentCompo