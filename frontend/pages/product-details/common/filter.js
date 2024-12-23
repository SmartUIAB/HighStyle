import { useQuery } from "@apollo/client";
import React, { useState } from "react";
import { Collapse } from "reactstrap";
import { GET_CATEGORY_LIST } from "../../../GraphQL/Queries/categoriesQueries";

const Filter = () => {
  const backClick = () => {
    document.getElementById("filter").style.left = "-365px";
  };

  const [isBrandOpen, setIsBrandOpen] = useState(true);

  const {
    data: categoriesData,
    loading,
    refetch,
  } = useQuery(GET_CATEGORY_LIST);

  const toggleBrand = () => setIsBrandOpen(!isBrandOpen);

  return (
    <div className="collection-filter-block creative-card creative-inner">
      <div className="collection-mobile-back" onClick={backClick}>
        <span className="filter-back">
          <i className="fa fa-angle-left" aria-hidden="true"></i>
          back
        </span>
      </div>
      <div className="collection-collapse-block border-0 open">
        <h3 className="collapse-block-title mb-0" onClick={toggleBrand}>
          brand
        </h3>
        <Collapse isOpen={isBrandOpen}>
          <div className="collection-collapse-block-content">
            <div className="collection-brand-filter">
              <ul className="category-list">
                {categoriesData?.categories?.categories?.map((item, i) => (
                  <li>
                    <a href={null}>{item?.name}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default Filter;
