import React, { useState } from "react";
import { Link } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ChevronRight } from "lucide-react";
import { useNavbarMegaMenuQuery } from "../../query/navbarMenuQueries.js";
import { buildNavbarMegaMenu } from "../../utils/navbarMenuConfig.js";

const fallbackMenuItems = buildNavbarMegaMenu([]);

function AppNavbarOffcanvasContentCompo({ handleClose }) {
    const [expanded, setExpanded] = useState(false);
    const { menuItems } = useNavbarMegaMenuQuery();
    const items = menuItems?.length ? menuItems : fallbackMenuItems;

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const closeMenu = () => {
        handleClose();
    };

    return (
        <nav className="mobile-nav-menu" aria-label="Mobile navigation">
            <Link className="mobile-nav-menu__plain-link" onClick={closeMenu} to="/">
                Home
            </Link>

            {items.map((item) => (
                <Accordion
                    key={item.slug}
                    expanded={expanded === item.slug}
                    onChange={handleChange(item.slug)}
                    disableGutters
                    square
                    className="mobile-nav-menu__accordion"
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${item.slug}-content`}
                        id={`${item.slug}-header`}
                        className="mobile-nav-menu__summary"
                    >
                        <span>{item.label}</span>
                    </AccordionSummary>
                    <AccordionDetails className="mobile-nav-menu__details">
                        <Link
                            className="mobile-nav-menu__view-all"
                            onClick={closeMenu}
                            to={item.path}
                        >
                            View all {item.label}
                            <ChevronRight size={15} strokeWidth={2.4} />
                        </Link>

                        {item.subcategories.length ? (
                            <div className="mobile-nav-menu__subgrid">
                                {item.subcategories.map((subcategory) => (
                                    <Link
                                        key={subcategory.id}
                                        className="mobile-nav-menu__sub-link"
                                        onClick={closeMenu}
                                        to={subcategory.path}
                                    >
                                        <span>{subcategory.label}</span>
                                        <ChevronRight size={14} strokeWidth={2.4} />
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="mobile-nav-menu__empty">
                                New sub categories will appear here soon.
                            </div>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}

            <Link className="mobile-nav-menu__plain-link" onClick={closeMenu} to="/pricing">
                Pricing
            </Link>
            <a
                className="mobile-nav-menu__plain-link"
                href="https://www.elvify.com/blog/"
                target="_self"
                rel="noopener noreferrer"
                onClick={closeMenu}
            >
                Blog
            </a>
        </nav>
    );
}

export default AppNavbarOffcanvasContentCompo;
