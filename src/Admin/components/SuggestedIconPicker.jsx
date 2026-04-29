import React, { useMemo } from "react";
import { Autocomplete, Box, Stack, TextField } from "@mui/material";
import * as LucideIcons from "lucide-react";
import {
  DEFAULT_SUGGESTED_STYLE_ICON,
  getSuggestedStyleIcon,
  getSuggestedStyleIconOption,
  recommendSuggestedStyleIcon,
} from "../../utils/suggestedStyleIcons.js";

const EXCLUDED_EXPORTS = new Set([
  "createLucideIcon",
  "default",
  "icons",
  "Icon",
  "LucideIcon",
]);

const readableIconName = (value) =>
  String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim();

const ICON_OPTIONS = Object.entries(LucideIcons)
  .filter(([name, value]) => {
    if (EXCLUDED_EXPORTS.has(name)) return false;
    return typeof value === "function" || typeof value === "object";
  })
  .map(([value]) => ({
    value,
    label: readableIconName(value),
    searchText: `${value} ${readableIconName(value)}`.toLowerCase(),
  }))
  .sort((left, right) => left.label.localeCompare(right.label));

const ICON_OPTION_BY_LOWER = ICON_OPTIONS.reduce((acc, option) => {
  acc[option.value.toLowerCase()] = option;
  return acc;
}, {});

const optionFromValue = (value) =>
  ICON_OPTIONS.find((option) => option.value === value) ||
  ICON_OPTION_BY_LOWER[String(value || "").trim().toLowerCase()] ||
  getSuggestedStyleIconOption(value);

export default function SuggestedIconPicker({
  value,
  onChange,
  label = "Search icon",
  context = "",
}) {
  const recommendedIcon = useMemo(
    () => recommendSuggestedStyleIcon(context),
    [context]
  );
  const recommendedOption = optionFromValue(recommendedIcon);

  return (
    <Autocomplete
      size="small"
      fullWidth
      openOnFocus
      autoHighlight
      clearOnEscape
      noOptionsText="No matching icons"
      options={ICON_OPTIONS}
      value={optionFromValue(value || recommendedIcon || DEFAULT_SUGGESTED_STYLE_ICON)}
      onChange={(_event, option) => {
        onChange(option?.value || DEFAULT_SUGGESTED_STYLE_ICON);
      }}
      filterOptions={(options, state) => {
        const query = state.inputValue.trim().toLowerCase();
        const base = query
          ? options.filter((option) => option.searchText.includes(query))
          : [
              recommendedOption,
              ...options.filter((option) => option.value !== recommendedOption.value),
            ];
        return base.slice(0, 80);
      }}
      getOptionLabel={(option) => option?.label || ""}
      isOptionEqualToValue={(option, selected) => option.value === selected.value}
      renderOption={(props, option) => {
        const OptionIcon = LucideIcons[option.value] || getSuggestedStyleIcon(option.value);
        const isRecommended = option.value === recommendedOption.value;
        return (
          <Box component="li" {...props} key={option.value}>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
              <OptionIcon size={17} />
              <span>{option.label}</span>
              {isRecommended ? (
                <Box component="span" sx={{ color: "primary.main", fontSize: 12, fontWeight: 700 }}>
                  Suggested
                </Box>
              ) : null}
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Search: car, camera, office..." />
      )}
    />
  );
}
