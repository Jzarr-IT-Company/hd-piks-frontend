import React, { useState, useEffect } from "react";
import { useGlobalState } from "../../Context/Context";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const options = ["Photos", "Videos", "Vector", "PSD", "Ai images", "Templates", "Icons", "Mockups"];

function HomeBannerSearchFilterationCompo2() {
    const { homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration } = useGlobalState();
    const [searchQuerry, setSearchQuerry] = useState("");
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef(null);
    const [selectedIndex, setSelectedIndex] = React.useState(1);

    // To ensure the UI renders first
    useEffect(() => {
        setHomeBannerSearchbarFilteration(options[selectedIndex]); // Set default filteration value when component loads
    }, []); // Empty dependency array to run only once on mount

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setHomeBannerSearchbarFilteration(options[index]);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleSearchBttn = () => {
        navigate(`/search/${homeBannerSearchbarFilteration}/${searchQuerry}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearchBttn();
        }
    };

    return (
        <div className="container-fluid py-2 d-block d-md-none">
            <div className="row justify-content-center">
                <div className="col-12">
                    <div className="d-flex align-items-center" style={{ height: "48px", background: "white" }}>
                        <React.Fragment>
                            <ButtonGroup
                                ref={anchorRef}
                                aria-label="Button group with a nested menu"
                            >
                                <Button
                                    size="small"
                                    aria-controls={open ? 'split-button-menu' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-label="select merge strategy"
                                    aria-haspopup="menu"
                                    style={{
                                        backgroundColor: "white", color: "black", height: "100%", border: "none"
                                    }}
                                    onClick={handleToggle}
                                >
                                    <ArrowDropDownIcon color="dark" />
                                </Button>
                            </ButtonGroup>
                            <Popper
                                sx={{ zIndex: 1000 }}
                                open={open}
                                anchorEl={anchorRef.current}
                                role={undefined}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        style={{
                                            transformOrigin:
                                                placement === 'bottom' ? 'center top' : 'center bottom',
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener onClickAway={handleClose}>
                                                <MenuList id="split-button-menu" autoFocusItem style={{ height: "200px", overflow: "auto" }}>
                                                    {options.map((option, index) => (
                                                        <MenuItem
                                                            key={option}
                                                            selected={index === selectedIndex}
                                                            onClick={(event) => handleMenuItemClick(event, index)}
                                                        >
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </React.Fragment>

                        <input
                            type="text"
                            className="form-control"
                            placeholder={`Search For Free ${homeBannerSearchbarFilteration}`}
                            value={searchQuerry}
                            onChange={(e) => setSearchQuerry(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{
                                flex: 1, height: "48px", border: "none", outline: "none", boxShadow: "none", fontSize: "14px"
                            }}
                        />
                        <button
                            onClick={handleSearchBttn}
                            style={{
                                width: "30px", height: "100%", backgroundColor: "white", border: "none",
                                display: "flex", alignItems: "center", justifyContent: "center"
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="bi bi-search"
                                viewBox="0 0 16 16"
                                width="14"
                                height="14"
                            >
                                <path d="M11 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" />
                                <path d="M15.5 15.5l-3-3" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeBannerSearchFilterationCompo2;
