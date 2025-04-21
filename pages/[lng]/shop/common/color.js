import React, { useState, useContext } from "react";
import { useQuery } from "@apollo/client";
import { Collapse } from "reactstrap";
import FilterContext from "../../../../helpers/filter/FilterContext";
import { GET_PHYSICAL_PRODUCT } from "../../../../GraphQL/Queries/productQueries";

const Color = () => {
  const context = useContext(FilterContext);
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const {
    data: allPhysicalProductData,
    loading,
    error,
  } = useQuery(GET_PHYSICAL_PRODUCT);

  // Extract and deduplicate colors
  const colors =
    allPhysicalProductData?.physicalProducts?.products?.flatMap(
      (product) => product.colors
    ) || [];
  const uniqueColors = [...new Set(colors)];

  if (error) {
    return <h4>Error loading colors</h4>;
  }

  return (
    <div className="collection-collapse-block open">
      <h3 className="collapse-block-title" onClick={toggle}>
        Colors
      </h3>
      <Collapse isOpen={isOpen}>
        <div className="collection-collapse-block-content">
          <div className="color-selector">
            <ul className="color-list">
              {loading ? (
                <h4>Loading...</h4>
              ) : uniqueColors.length > 0 ? (
                uniqueColors.map((color, i) => (
                  <li
                    key={i}
                    className={`color-item ${
                      context.selectedColor === color ? "active" : ""
                    }`}
                    onClick={() => context.setSelectedColor(color)}
                  >
                    {color}
                  </li>
                ))
              ) : (
                <h4>No Colors Available</h4>
              )}
            </ul>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default Color;
