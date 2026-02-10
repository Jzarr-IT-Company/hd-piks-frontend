import React, { useState, useEffect, useCallback } from "react";
import { useGlobalState } from "../../Context/Context";
import { useNavigate, useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { getAllImages } from "../../Services/getImages";
import { fetchCategories } from "../../Services/category"; // NEW

function HomeBannerSearchFilterationCompo2({ showOnDesktop = false }) {
	const { homeBannerSearchbarFilteration, setHomeBannerSearchbarFilteration } = useGlobalState();
	const [searchQuerry, setSearchQuerry] = useState("");
	const navigate = useNavigate();
	const { term } = useParams();
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);

	// Parent dropdown options (from real backend categories)
	const [options, setOptions] = useState(["Image", "Video"]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	// All approved images + suggestions
	const [allItems, setAllItems] = useState([]);
	const [suggestions, setSuggestions] = useState([]);

	const normalize = useCallback((val) => {
		if (typeof val === "string") return val.trim().toLowerCase();
		if (val == null) return "";
		return String(val).trim().toLowerCase();
	}, []);

	const getCategoryName = useCallback((cat) => {
		if (!cat) return "";
		if (typeof cat === "string") return cat;
		if (typeof cat === "object") return cat.name || "";
		return String(cat);
	}, []);

	const getSubcategoryName = useCallback((sub) => {
		if (!sub) return "";
		if (typeof sub === "string") return sub;
		if (typeof sub === "object") return sub.name || "";
		return String(sub);
	}, []);

	const getSubSubcategoryName = useCallback((subsub) => {
		if (!subsub) return "";
		if (typeof subsub === "string") return subsub;
		if (typeof subsub === "object") return subsub.name || "";
		return String(subsub);
	}, []);

	useEffect(() => {
		setHomeBannerSearchbarFilteration(options[selectedIndex]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Prefill input on /search/:term
	useEffect(() => {
		if (term) setSearchQuerry(term.replace(/-/g, " "));
	}, [term]);

	// NEW: load real parent categories from /categories (public)
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const tree = await fetchCategories();
				if (!active || !Array.isArray(tree) || !tree.length) return;

				// tree is root categories with children; parents are top level
				const parentNames = tree
					.map((c) => c.name)
					.filter(Boolean);

				if (parentNames.length) {
					setOptions(parentNames);
					setSelectedIndex(0);
					setHomeBannerSearchbarFilteration(parentNames[0]);
				}
			} catch (e) {
				console.error("[HomeBannerSearch] fetchCategories failed", e);
			}
		})();
		return () => {
			active = false;
		};
	}, [setHomeBannerSearchbarFilteration]);

	// Load all approved images once (for suggestions)
	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const data = await getAllImages();
				if (!active) return;
				const approved = data.filter(
					(item) => item.approved === true && item.rejected !== true
				);
				setAllItems(approved);
			} catch (e) {
				console.error("[HomeBannerSearch] getAllImages failed", e);
				if (active) setAllItems([]);
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	// Build suggestions: only sub‑subcategories under current parent + search term
	useEffect(() => {
		if (!allItems.length) {
			setSuggestions([]);
			return;
		}

		const selectedScope = options[selectedIndex] || "";
		const parentItems = allItems.filter(
			(img) => normalize(getCategoryName(img.category)) === normalize(selectedScope)
		);
		if (!parentItems.length) {
			setSuggestions([]);
			return;
		}

		const q = normalize(searchQuerry || term || "");
		let baseItems = parentItems;

		if (q) {
			const direct = parentItems.filter(
				(img) => normalize(getSubcategoryName(img.subcategory)) === q
			);
			if (direct.length) {
				baseItems = direct;
			} else {
				const fuzzy = parentItems.filter((img) => {
					const title = normalize(img.title);
					const desc = normalize(img.description);
					const kws = Array.isArray(img.keywords) ? img.keywords : [];
					return (
						title.includes(q) ||
						desc.includes(q) ||
						kws.some((k) => normalize(k) === q)
					);
				});
				if (fuzzy.length) baseItems = fuzzy;
			}
		}

		const counts = new Map();
		baseItems.forEach((img) => {
			const ss = getSubSubcategoryName(img.subsubcategory);
			if (!ss) return;
			const key = ss.trim();
			if (!key) return;
			counts.set(key, (counts.get(key) || 0) + 1);
		});

		const sorted = Array.from(counts.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([name]) => name);

		setSuggestions(sorted);
	}, [
		allItems,
		options,
		selectedIndex,
		searchQuerry,
		term,
		normalize,
		getCategoryName,
		getSubcategoryName,
		getSubSubcategoryName,
	]);

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

	const selectedScope = options[selectedIndex] || "";

	const doNavigate = (termRaw) => {
		const t = (termRaw || "").trim();
		if (!t) return;
		navigate(`/search/${encodeURIComponent(t)}`);
	};

	const handleSearchBttn = () => {
		const fallback = suggestions[0] || selectedScope || "wallpapers";
		doNavigate(searchQuerry || fallback);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") handleSearchBttn();
	};

	const handleSuggestionClick = (termStr) => {
		setSearchQuerry(termStr);
		doNavigate(termStr);
	};

	const wrapperClassName = showOnDesktop
		? "container-fluid py-3"
		: "container-fluid py-2 d-block d-md-none";

	return (
		<div className={wrapperClassName}>
			<div className="d-flex justify-content-center">
				<div className="w-100" style={{ maxWidth: 900 }}>
					{/* Search bar */}
					<div
						className="d-flex align-items-center my-4 w-100"
						style={{
							minHeight: 60,
							background: '#ffffff',
							borderRadius: 999,
							paddingInline: 14,
							border: '1px solid rgba(236,72,153,0.6)',
						}}
					>
						<React.Fragment>
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
										paddingInline: 10,
										fontSize: 13,
										fontWeight: 600,
										textTransform: "uppercase",
									}}
									onClick={handleToggle}
								>
									{selectedScope || "Category"}
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
												placement === "bottom" ? "center top" : "center bottom",
										}}
									>
										<Paper elevation={4}>
											<ClickAwayListener onClickAway={handleClose}>
												<MenuList
													id="split-button-menu"
													autoFocusItem
													style={{ maxHeight: "200px", overflow: "auto" }}
												>
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
							className="form-control border-0"
							placeholder={`Search free ${selectedScope || "assets"} (e.g. wallpapers)`}
							value={searchQuerry}
							onChange={(e) => setSearchQuerry(e.target.value)}
							onKeyPress={handleKeyPress}
							style={{
								flex: 1,
								height: 42,
								outline: "none",
								boxShadow: "none",
								fontSize: 14,
							}}
						/>

						<button
							onClick={handleSearchBttn}
							style={{
								width: 40,
								height: 40,
								borderRadius: "50%",
								background: "linear-gradient(135deg,#8f5cff,#b84592)",
								border: "none",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "#fff",
								marginLeft: 4,
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 16 16"
								width="15"
								height="15"
							>
								<path d="M11 6a5 5 0 1 1-10 0 5 5 0 0 1 10 0z" />
								<path d="M15.5 15.5l-3-3" />
							</svg>
						</button>
					</div>

					{/* Suggestions slider: only related sub‑subcategories */}
					{suggestions.length > 0 && (
						<div
							className="mt-3 d-flex flex-wrap gap-2 justify-content-center justify-content-md-start"
							style={{ rowGap: 6 }}
						>
							{suggestions.map((s) => (
								<button
									key={s}
									type="button"
									onClick={() => handleSuggestionClick(s)}
									className="btn btn-sm"
									style={{
										borderRadius: 999,
										fontSize: 12,
										paddingInline: 12,
										background: "linear-gradient(90deg, rgb(143, 92, 255), rgb(184, 69, 146))",
										color: "#ffffff",
										border: "1px solid rgb(143, 92, 255)",
										boxShadow: "0 1px 3px rgba(15,23,42,0.15)",
									}}
								>
									{s}
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default HomeBannerSearchFilterationCompo2;
