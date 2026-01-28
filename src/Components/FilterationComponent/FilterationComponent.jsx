import React, { useMemo } from 'react'
import FilterationComponentBttn from '../FilterationComponentBttn/FilterationComponentBttn'

function FilterationComponent({ changeCategory, subcategories = [], onSelectSubcategory, categoryname = '' }) {
    const categoryLabel = useMemo(() => {
        if (!categoryname) return 'Category';
        const readable = categoryname.charAt(0).toUpperCase() + categoryname.slice(1);
        return `Category/${readable}`;
    }, [categoryname]);

    const handleChangeCategoryname = (name) => {
        changeCategory(name)
    }
    return (
        <>
            {/* <section className=''>
                <div className="container py-4 bg-white">
                    <div className="row">
                        <div className="col-12">
                            <div className="row d-flex justify-content-center align-items-center">
                                <div className="col-md-2 py-0">
                                    <p className='text-white mt-2 py-2 text-center' style={{ background: "linear-gradient(90deg, rgba(85, 36, 163, 1) 0%, rgba(163,85, 217, 1) 100%)" }}>{categoryLabel}</p>
                                </div>
                                <div className="col-md-10">
                                    <div
                                        className="d-flex py-2 overflow-auto flex-nowrap"
                                        style={{ overflowY: "hidden", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
                                    >
                                        <FilterationComponentBttn categories={subcategories} onSelect={onSelectSubcategory} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}
        </>
    )
}

export default FilterationComponent
