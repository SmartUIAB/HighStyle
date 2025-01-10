import React, { Fragment } from "react";
import { useQuery } from "@apollo/client";
import { GET_CATEGORY_LIST } from "../../../GraphQL/Queries/categoriesQueries";
import LocalLink from "../../LocalLink";

const SideBar = () => {
  const {
    data: categoriesData,
    loading,
    refetch,
  } = useQuery(GET_CATEGORY_LIST);

  const closeNav = () => {
    const closemyslide = document.getElementById("mySidenav");
    if (closemyslide) closemyslide.classList.remove("open-side");
  };

  const toggleSubmenu = (event, className) => {
    if (event.target.classList.contains("sub-arrow")) return;

    const nextElement = event.target.nextElementSibling;
    if (nextElement && nextElement.classList.contains(className)) {
      nextElement.classList.remove(className);
    } else {
      document.querySelectorAll(`.${className}`).forEach((value) => {
        value.classList.remove(className);
      });
      nextElement?.classList.add(className);
    }
  };

  return (
    <Fragment>
      <div id="mySidenav" className="sidenav">
        <a href={null} className="sidebar-overlay" onClick={closeNav}></a>
        <nav>
          <a href={null} onClick={closeNav}>
            <div className="sidebar-back text-start">
              <i className="fa fa-angle-left pe-2" aria-hidden="true"></i> Back
            </div>
          </a>
          <ul id="sub-menu" className="sidebar-menu">
            {categoriesData?.categories?.categories?.map((category) => (
              <li key={category.id}>
                <a href="#" onClick={(e) => toggleSubmenu(e, "opensub1")}>
                  {category?.name}
                  <span className="sub-arrow"></span>
                </a>
                {category?.subcategories?.length > 0 && (
                  <ul>
                    {category?.subcategories.map((subcategory) => (
                      <li key={subcategory?.id}>
                        <LocalLink
                          href={`/productList/${subcategory?.id}`}
                          onClick={(e) => toggleSubmenu(e, "opensub2")}
                        >
                          {subcategory?.name}
                          {subcategory?.type === "Physical" && (
                            <span className="sub-arrow"></span>
                          )}
                        </LocalLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Fragment>
  );
};

export default SideBar;
