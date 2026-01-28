import React from 'react'

function FilterationComponentBttn({ categories = [], onSelect }) {
    const handleClick = (val) => {
        if (onSelect) onSelect(val);
    };

    return (
        <>
            <button
                className="btn btn-light py-2 me-2"
                style={{ minWidth: 150 }}
                onClick={() => handleClick('all')}
            >
                All subcategories
            </button>
            {categories.map((name) => (
                <button
                    className="btn btn-light py-2 me-2"
                    key={name}
                    style={{ minWidth: 150 }}
                    onClick={() => handleClick(name)}
                >
                    {name}
                </button>
            ))}
        </>
    )
}

export default FilterationComponentBttn