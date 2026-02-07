import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useGlobalState } from '../../Context/Context';
import { useNavigate } from 'react-router-dom';
import { fetchCategories } from '../../Services/category';
// NEW: MUI dropdown like HomeBannerSearchFilterationCompo2
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

function HomeBannerSearchbarFilterationCompo() {
    const { homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration } = useGlobalState();
    const [searchQuerry, setSearchQuerry] = useState('');
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    // NEW: MUI dropdown state (same pattern as HomeBannerSearchFilterationCompo2)
    const [open, setOpen] = useState(false);
    const anchorRef = useRef(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const normalize = useCallback((val) => {
        if (typeof val === 'string') return val.trim().toLowerCase();
        if (val == null) return '';
        return String(val).trim().toLowerCase();
    }, []);

    const parentOptions = useMemo(
        () => (Array.isArray(categories) ? categories.map(c => c.name).filter(Boolean) : []),
        [categories]
    );

    const subcategorySuggestions = useMemo(() => {
        if (!categories.length || !homeBannerSearchbarFilteration) return [];
        const parent = categories.find(
            c => normalize(c.name) === normalize(homeBannerSearchbarFilteration)
        );
        if (!parent) return [];
        const subs = parent.children || [];
        let names = subs.map(c => c.name).filter(Boolean);
        const q = normalize(searchQuerry);
        if (q) {
            names = names.filter(n => normalize(n).includes(q));
        }
        const seen = new Set();
        const unique = [];
        for (const n of names) {
            const k = normalize(n);
            if (!k || seen.has(k)) continue;
            seen.add(k);
            unique.push(n);
            if (unique.length >= 8) break;
        }
        return unique;
    }, [categories, homeBannerSearchbarFilteration, searchQuerry, normalize]);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const tree = await fetchCategories(true);
                if (!active) return;
                if (Array.isArray(tree)) setCategories(tree);
            } catch (e) {
                console.error('[HomeBannerSearchbarFilterationCompo] fetchCategories failed', e);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    // Ensure global scope and selectedIndex follow first parent option by default
    useEffect(() => {
        if (!parentOptions.length) return;
        const current = homeBannerSearchbarFilteration && normalize(homeBannerSearchbarFilteration);
        const foundIndex = parentOptions.findIndex(p => normalize(p) === current);
        if (foundIndex >= 0) {
            setSelectedIndex(foundIndex);
            return;
        }
        setSelectedIndex(0);
        setHomeBannerSearchbarFilteration(parentOptions[0]);
    }, [parentOptions, homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration, normalize]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSearchBttn = async () => {
        if (!searchQuerry.trim()) return;
        setShowSuggestions(false);
        navigate(`/search/${searchQuerry.trim()}`);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearchBttn();
    };

    const handleSuggestionClick = (name) => {
        setSearchQuerry(name);
        setShowSuggestions(false);
        navigate(`/search/${encodeURIComponent(name)}`);
    };

    // NEW: dropdown handlers (copied pattern from HomeBannerSearchFilterationCompo2)
    const handleToggle = () => {
        setOpen(prev => !prev);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        const opt = parentOptions[index];
        setHomeBannerSearchbarFilteration(opt);
        setShowSuggestions(true);
        setOpen(false);
    };

    const selectedScope = parentOptions[selectedIndex] || homeBannerSearchbarFilteration || 'Image';

    return (
        <>
            <div className="container d-none d-md-block">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col-sm-12 col-md-9">
                        <div className="mb-0 pb-5">
                            {/* Search bar + autocomplete */}
                            <div style={{ position: 'relative' }} ref={wrapperRef}>
                                <div
                                    className="d-none d-md-flex d-lg-flex align-items-center my-4 w-100"
                                    style={{
                                        minHeight: 60,
                                        background: '#ffffff',
                                        borderRadius: 999,
                                        paddingInline: 14,
                                        border: '1px solid rgba(236,72,153,0.6)',
                                    }}
                                >
                                    {/* Scope dropdown: MUI ButtonGroup + Popper (same as HomeBannerSearchFilterationCompo2) */}
                                    <React.Fragment>
                                        <ButtonGroup ref={anchorRef} aria-label="search scope">
                                            <Button
                                                size="small"
                                                aria-controls={open ? 'split-button-menu' : undefined}
                                                aria-expanded={open ? 'true' : undefined}
                                                aria-label="select search scope"
                                                aria-haspopup="menu"
                                                disabled={!parentOptions.length}
                                                onClick={handleToggle}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    color: '#111827',
                                                    height: '100%',
                                                    border: 'none',
                                                    paddingInline: 10,
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {selectedScope}
                                                <ArrowDropDownIcon color="inherit" fontSize="small" />
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
                                                    <Paper elevation={4}>
                                                        <ClickAwayListener onClickAway={handleClose}>
                                                            <MenuList
                                                                id="split-button-menu"
                                                                autoFocusItem
                                                                style={{ maxHeight: '200px', overflow: 'auto' }}
                                                            >
                                                                {parentOptions.map((option, index) => (
                                                                    <MenuItem
                                                                        key={option}
                                                                        selected={index === selectedIndex}
                                                                        onClick={(event) =>
                                                                            handleMenuItemClick(event, index)
                                                                        }
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

                                    {/* Text input */}
                                    <input
                                        type="text"
                                        className="form-control border-0"
                                        placeholder={`Search ${selectedScope || 'image'} (e.g. wallpapers)`}
                                        style={{
                                            flex: 1,
                                            height: 44,
                                            outline: 'none',
                                            boxShadow: 'none',
                                            background: 'transparent',
                                            fontSize: 14,
                                        }}
                                        onKeyPress={handleKeyPress}
                                        value={searchQuerry}
                                        onChange={(e) => {
                                            setSearchQuerry(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => {
                                            if (subcategorySuggestions.length) setShowSuggestions(true);
                                        }}
                                    />

                                    {/* Round gradient search button on right */}
                                    <button
                                        className="btn border-0"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg,#ec4899,#a855f7)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#ffffff',
                                            marginLeft: 6,
                                        }}
                                        onClick={handleSearchBttn}
                                    >
                                        <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 14 }} />
                                    </button>
                                </div>

                                {/* Autocomplete panel under bar (unchanged) */}
                                {showSuggestions && subcategorySuggestions.length > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            marginTop: 8,
                                            width: '100%',
                                            zIndex: 1050,
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxHeight: 260,
                                                overflowY: 'auto',
                                                background: '#ffffff',
                                                borderRadius: 12,
                                                boxShadow: '0 8px 30px rgba(15,23,42,0.18)',
                                                padding: '6px 0',
                                            }}
                                        >
                                            {subcategorySuggestions.map((name) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => handleSuggestionClick(name)}
                                                    style={{
                                                        width: '100%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        padding: '8px 14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        textAlign: 'left',
                                                        fontSize: 13,
                                                        cursor: 'pointer',
                                                    }}
                                                    className="search-suggestion-row"
                                                >
                                                    <span
                                                        style={{
                                                            width: 22,
                                                            height: 22,
                                                            borderRadius: '50%',
                                                            background: '#f2f3ff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: 10,
                                                            color: '#4f46e5',
                                                            fontSize: 11,
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-magnifying-glass" />
                                                    </span>
                                                    <span style={{ color: '#111827' }}>{name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI rectangular cards (still rendered elsewhere) */}
                            {/* ...existing code for AI tools if you add them here... */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomeBannerSearchbarFilterationCompo;
