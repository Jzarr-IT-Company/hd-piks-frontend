import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUI } from "../../Context/UIContext";
import { useNavigate, useParams } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { usePublicCategoriesQuery } from "../../query/categoryQueries.js";
import { useSearchSuggestionsQuery } from "../../query/searchQueries.js";

const slugifySearchCategory = (value = "") => String(value || "image")
	.trim()
	.toLowerCase()
	.replace(/&/g, " and ")
	.replace(/[^a-z0-9]+/g, "-")
	.replace(/^-+|-+$/g, "");

function HomeBannerSearchFilterationCompo2({
	showOnDesktop = false,
	compact = false,
	hideSearchBarMargin = false,
	hideWrapperPadding = false,
	hideSuggestions = false,
}) {
	const { homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration } = useUI();
	const [searchQuerry, setSearchQuerry] = useState("");
	const navigate = useNavigate();
	const { category, name, term } = useParams();
	const [open, setOpen] = useState(false);
	const anchorRef = useRef(null);
	const suggestionsRowRef = useRef(null);
	const isMobile = useMediaQuery("(max-width:767.98px)");
	const [options, setOptions] = useState(["Image", "Video"]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const categoriesQuery = usePublicCategoriesQuery();

	const normalize = useCallback((val) => {
		if (typeof val === "string") return val.trim().toLowerCase();
		if (val == null) return "";
		return String(val).trim().toLowerCase();
	}, []);

	useEffect(() => {
		const nextTerm = name || term;
		if (nextTerm) setSearchQuerry(decodeURIComponent(nextTerm).replace(/-/g, " "));
	}, [name, term]);

	useEffect(() => {
		const tree = categoriesQuery.data;
		if (!Array.isArray(tree) || !tree.length) return;

		const parentNames = tree.map((c) => c.name).filter(Boolean);
		if (!parentNames.length) return;

		const routeCategory = category ? decodeURIComponent(category).replace(/-/g, " ") : "";
		const current = routeCategory || homeBannerSearchbarFilteration;
		const foundIndex = parentNames.findIndex((item) => normalize(item) === normalize(current));
		const nextIndex = foundIndex >= 0 ? foundIndex : 0;

		setOptions(parentNames);
		setSelectedIndex(nextIndex);
		setHomeBannerSearchbarFilteration(parentNames[nextIndex]);
	}, [categoriesQuery.data, category, homeBannerSearchbarFilteration, normalize, setHomeBannerSearchbarFilteration]);

	const selectedScope = options[selectedIndex] || homeBannerSearchbarFilteration || "Image";
	const suggestionsQuery = useSearchSuggestionsQuery({
		category: selectedScope,
		q: searchQuerry,
		enabled: Boolean(selectedScope),
	});
	const suggestions = suggestionsQuery.data || [];

	const handleMenuItemClick = (event, index) => {
		setSelectedIndex(index);
		setHomeBannerSearchbarFilteration(options[index]);
		setOpen(false);
	};

	const handleToggle = () => setOpen((prevOpen) => !prevOpen);

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) return;
		setOpen(false);
	};

	const doNavigate = (termRaw) => {
		const t = (termRaw || "").trim();
		if (!t) return;
		navigate(`/search/${encodeURIComponent(slugifySearchCategory(selectedScope))}/${encodeURIComponent(t)}`);
	};

	const handleSearchBttn = () => {
		const fallback = suggestions[0]?.value || suggestions[0]?.label || selectedScope || "wallpapers";
		doNavigate(searchQuerry || fallback);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") handleSearchBttn();
	};

	const handleSuggestionClick = (suggestion) => {
		const value = typeof suggestion === "string" ? suggestion : suggestion?.value || suggestion?.label || "";
		setSearchQuerry(value);
		doNavigate(value);
	};

	const scrollSuggestions = useCallback((direction) => {
		const row = suggestionsRowRef.current;
		if (!row) return;
		const step = Math.max(100, Math.floor(row.clientWidth * 0.65));
		row.scrollBy({ left: direction * step, behavior: "smooth" });
	}, []);

	const wrapperClassName = compact
		? "container-fluid p-0"
		: showOnDesktop
			? `container-fluid ${hideWrapperPadding ? "p-0" : "py-3"}`
			: "container-fluid py-2 d-block d-md-none";

	return (
		<div className={wrapperClassName}>
			<div className="d-flex justify-content-center">
				<div className="w-100" style={{ maxWidth: 900 }}>
					<div
						className={`d-flex align-items-center w-100 ${compact || hideSearchBarMargin ? "" : "my-4"}`}
						style={{
							minHeight: compact ? 44 : 60,
							background: "#ffffff",
							borderRadius: 999,
							paddingInline: compact ? 8 : 14,
							border: "1px solid rgba(236,72,153,0.6)",
						}}
					>
						<ButtonGroup ref={anchorRef} aria-label="search scope">
							<Button
								size="small"
								aria-controls={open ? "split-button-menu" : undefined}
								aria-expanded={open ? "true" : undefined}
								aria-label="select search scope"
								aria-haspopup="menu"
								style={{
									backgroundColor: "transparent",
									color: "#111827",
									height: "100%",
									border: "none",
									paddingInline: compact ? 6 : 10,
									fontSize: compact ? 11 : 13,
									fontWeight: 600,
									textTransform: "uppercase",
								}}
								onClick={handleToggle}
							>
								{selectedScope || "Category"}
								<ArrowDropDownIcon color="inherit" fontSize="small" />
							</Button>
						</ButtonGroup>
						<Popper sx={{ zIndex: 1000 }} open={open} anchorEl={anchorRef.current} transition disablePortal>
							{({ TransitionProps, placement }) => (
								<Grow
									{...TransitionProps}
									style={{
										transformOrigin: placement === "bottom" ? "center top" : "center bottom",
									}}
								>
									<Paper elevation={4}>
										<ClickAwayListener onClickAway={handleClose}>
											<MenuList id="split-button-menu" autoFocusItem style={{ maxHeight: "200px", overflow: "auto" }}>
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

						<input
							type="text"
							className="form-control border-0"
							placeholder={`Search free ${selectedScope || "assets"} (e.g. wallpapers)`}
							value={searchQuerry}
							onChange={(e) => setSearchQuerry(e.target.value)}
							onKeyDown={handleKeyPress}
							style={{
								flex: 1,
								height: compact ? 34 : 42,
								outline: "none",
								boxShadow: "none",
								fontSize: compact ? 12 : 14,
								minWidth: 0,
							}}
						/>

						<button
							onClick={handleSearchBttn}
							style={{
								width: compact ? 34 : 40,
								height: compact ? 34 : 40,
								borderRadius: "50%",
								background: "linear-gradient(135deg,#8f5cff,#b84592)",
								border: "none",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
								marginLeft: compact ? 2 : 4,
							}}
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" width={compact ? "13" : "15"} height={compact ? "13" : "15"}>
								<path d="M11 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" />
								<path d="M15.5 15.5l-3-3" />
							</svg>
						</button>
					</div>

					{categoriesQuery.isError && (
						<div className="d-flex justify-content-center justify-content-md-start mb-2">
							<button type="button" className="btn btn-sm btn-outline-danger" onClick={() => categoriesQuery.refetch()}>
								Retry categories
							</button>
						</div>
					)}

					{!hideSuggestions && suggestions.length > 0 && (
						<div className="mt-3">
							<div className="d-flex align-items-center justify-content-between flex-wrap mb-2" style={{ gap: 8 }}>
								<div style={{ fontSize: compact ? 12 : 13, fontWeight: 700, color: "#1f2937", lineHeight: 1.1 }}>
									Search suggestions
								</div>
							</div>

							<div className="position-relative">
								{isMobile && suggestions.length > 2 && (
									<button type="button" onClick={() => scrollSuggestions(-1)} aria-label="Scroll suggestions left" style={arrowStyle("left")}>
										<FiChevronLeft size={14} />
									</button>
								)}

								<div
									ref={suggestionsRowRef}
									className="d-flex gap-2 justify-content-center justify-content-md-start"
									style={{
										rowGap: 6,
										flexWrap: isMobile ? "nowrap" : "wrap",
										overflowX: isMobile ? "auto" : "visible",
										scrollBehavior: "smooth",
										paddingInline: isMobile && suggestions.length > 2 ? 24 : 0,
										scrollbarWidth: "none",
										msOverflowStyle: "none",
									}}
								>
									{suggestions.map((suggestion) => (
										<button
											key={`${suggestion.type}-${suggestion.label}`}
											type="button"
											onClick={() => handleSuggestionClick(suggestion)}
											className="btn btn-sm"
											style={{
												borderRadius: 999,
												fontSize: 12,
												paddingInline: 12,
												background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
												color: "#ffffff",
												border: "1px solid rgb(143, 92, 255)",
												boxShadow: "0 1px 3px rgba(15,23,42,0.15)",
												flex: isMobile ? "0 0 auto" : undefined,
												whiteSpace: "nowrap",
											}}
										>
											{suggestion.label}
										</button>
									))}
								</div>

								{isMobile && suggestions.length > 2 && (
									<button type="button" onClick={() => scrollSuggestions(1)} aria-label="Scroll suggestions right" style={arrowStyle("right")}>
										<FiChevronRight size={14} />
									</button>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

const arrowStyle = (side) => ({
	position: "absolute",
	[side]: -2,
	top: "50%",
	transform: "translateY(-50%)",
	zIndex: 2,
	width: 24,
	height: 24,
	borderRadius: "50%",
	border: "1px solid #d1d5db",
	background: "#fff",
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
});

export default HomeBannerSearchFilterationCompo2;
