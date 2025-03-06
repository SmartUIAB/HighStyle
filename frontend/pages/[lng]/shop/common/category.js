import React, { useState, useContext } from "react";
import { Collapse } from "reactstrap";
import FilterContext from "../../../../helpers/filter/FilterContext";
import { GET_CATEGORY_LIST } from "../../../../GraphQL/Queries/categoriesQueries";
import { useQuery } from "@apollo/client";

const Category = () => {
  const context = useContext(FilterContext);
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const toggleCategory = () => setIsCategoryOpen(!isCategoryOpen);
  const setSelectedCategory = context.setSelectedCategory;

  const { data: categoriesData, loading, error } = useQuery(GET_CATEGORY_LIST);

  const updateCategory = (category) => {
    setSelectedCategory(category);
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  if (error) {
    return <p>Error loading categories: {error.message}</p>;
  }

  const categories = categoriesData?.categories?.categories || [];

  return (
    <div className="collection-collapse-block open">
      <h3 className="collapse-block-title" onClick={toggleCategory}>
        Category
      </h3>
      <Collapse isOpen={isCategoryOpen}>
        <div className="collection-collapse-block-content">
          <div className="collection-brand-filter">
            <ul className="category-list">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    updateCategory("all");
                  }}
                >
                  All Products
                </a>
              </li>

              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      updateCategory(category.name);
                    }}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Collapse>
    </div>
  );
};

export default Category;
