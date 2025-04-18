import { useTranslation } from "@/app/i18n/client";
import { useAppSelector } from "@/Redux/Hooks";
import React, { Fragment, useState } from "react";
import { Search } from "react-feather";
import { Form, FormGroup, Input } from "reactstrap";

const SearchHeader = () => {
	const [searchbar, setSearchbar] = useState(false);
	const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
	const { t } = useTranslation(i18LangStatus);

	const handleSearchClick = () => {
		setSearchbar(!searchbar);
	};

	return (
		<Fragment>
			<Form className="form-inline search-form">
				<FormGroup>
					<Input
						className={"form-control-plaintext " + (searchbar ? "open" : "")}
						type="search"
						placeholder={t("search")}
					/>
					<span
						className="d-sm-none mobile-search"
						onClick={() => handleSearchClick()}
					>
						<Search />
					</span>
				</FormGroup>
			</Form>
		</Fragment>
	);
};

export default SearchHeader;
