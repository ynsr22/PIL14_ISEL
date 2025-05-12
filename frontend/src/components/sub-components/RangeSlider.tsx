"use client";

import React from "react";
import Slider, { SliderProps } from "@mui/material/Slider";
import Box from "@mui/material/Box";

interface RangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    currency?: string;
    formatValue?: (value: number) => string;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
    min,
    max,
    value,
    onChange,
    step = 10,
    currency = "€",
    formatValue = (val) => `${val}${currency}`,
}) => {
    // prepare marks and change handler
    const mid = Math.round(((min + max) / 2) / step) * step;
    const marks = [
        { value: min, label: formatValue(min) },
        { value: mid, label: formatValue(mid) },
        { value: max, label: formatValue(max) },
    ];
    const handleChange: SliderProps['onChange'] = (_event, newValue) => {
        if (Array.isArray(newValue)) onChange(newValue as [number, number]);
    };

    return (
        <Box sx={{ width: '100%', pt: 3, pb: 2, px: 3 }}>
            <Slider
                value={value}
                onChange={handleChange}
                min={min}
                max={max}
                step={step}
                marks={marks}
                valueLabelDisplay="auto"
                disableSwap
                sx={{
                    color: 'black',
                    height: 8,
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-rail': { color: '#e5e7eb', height: 8 },
                    '& .MuiSlider-thumb': {
                        height: 20,
                        width: 20,
                        backgroundColor: '#fff',
                        border: '2px solid black',
                        '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 8px rgba(0,0,0,0.16)' },
                        '&.Mui-active': { boxShadow: '0 0 0 14px rgba(0,0,0,0.16)' },
                    },
                }}
            />
        </Box>
    );
};

export default React.memo(RangeSlider);