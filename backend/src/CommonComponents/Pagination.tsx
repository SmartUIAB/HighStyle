import React from "react";
import { IconButton } from "@mui/material";
import { FirstPage, LastPage, NavigateBefore, NavigateNext } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/Redux/Hooks";

const Pagination = ({ count, rowsPerPage, page, onPageChange, onRowsPerPageChange }: any) => {
    const handleFirstPageButtonClick = () => onPageChange(0);
    const handleBackButtonClick = () => onPageChange(page - 1);
    const handleNextButtonClick = () => onPageChange(page + 1);
    const handleLastPageButtonClick = () => onPageChange(Math.ceil(count / rowsPerPage) - 1);

    const { i18LangStatus } = useAppSelector((store) => store.LangReducer);
    const { t } = useTranslation(i18LangStatus);

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "10px", color: "rgba(0, 0, 0, 0.54)",
            fontSize: "13px"
        }}>
            <span style={{ marginRight: "10px" }}>{t("rowsPerPage")}:</span>
            <select value={rowsPerPage} onChange={onRowsPerPageChange} style={{ marginRight: "10px", cursor: "pointer", height: "24px", maxWidth: "100%", userSelect: "none", paddingLeft: "8px", paddingRight: "24px", boxSizing: "content-box", fontSize: "inherit", color: "inherit", border: "none", backgroundColor: "transparent", appearance: "none", direction: "ltr" }}>
                {[5, 10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                ))}
            </select>
            <span>
                {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, count)} of {count}
            </span>
            <IconButton onClick={handleFirstPageButtonClick} disabled={page === 0}>
                <FirstPage />
            </IconButton>
            <IconButton onClick={handleBackButtonClick} disabled={page === 0}>
                <NavigateBefore />
            </IconButton>
            <IconButton onClick={handleNextButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                <NavigateNext />
            </IconButton>
            <IconButton onClick={handleLastPageButtonClick} disabled={page >= Math.ceil(count / rowsPerPage) - 1}>
                <LastPage />
            </IconButton>
        </div>
    );
};

export default Pagination;
