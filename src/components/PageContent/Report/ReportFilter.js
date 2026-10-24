import React from "react";
import DatePicker from "react-date-picker";
import { Button, ConfigProvider } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { addDays, differenceInCalendarDays, format, isSameDay, isSameYear, startOfDay, startOfMonth } from "date-fns";
import POS_THEME from "../../../styles/posTheme";
import "../../../styles/pos.css";
import "../../../styles/reportFilter.css";

// Segmented filters (Delivery, Order No, Report Type) as counter fields: 44px
// tall like the date fields, 4px track padding, nested radii (10 = 6 + 4).
const FILTER_THEME = {
    ...POS_THEME,
    components: {
        ...POS_THEME.components,
        Segmented: {
            trackPadding: 4,
            trackBg: "#f6f8fa",
            borderRadiusLG: 10,
            borderRadius: 6,
            controlPaddingHorizontal: 17,
            fontSizeLG: 14,
            itemColor: "#6b7785",
            itemHoverColor: "#1f2933",
            itemSelectedColor: "#1f2933",
        },
    },
};

// Quick periods, counted back from today.
const PERIODS = [
    { label: "Today", range: (today) => [today, today] },
    { label: "Yesterday", range: (today) => [addDays(today, -1), addDays(today, -1)] },
    { label: "Last 7 days", range: (today) => [addDays(today, -6), today] },
    { label: "Last 30 days", range: (today) => [addDays(today, -29), today] },
    { label: "This month", range: (today) => [startOfMonth(today), today] },
];

const periodText = (from, to) => {
    if (isSameDay(from, to)) return format(from, "d MMM yyyy");
    return `${format(from, isSameYear(from, to) ? "d MMM" : "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`;
};

// A report-specific filter (Delivery, Report Type, ...) in the filter's footer.
export const ReportFilterField = ({ label, children }) => (
    <div className="rf-extra">
        <span className="rf-label">{label}</span>
        {children}
    </div>
);

// The Apply Filter section of the reports: the period (From / To Date, with
// quick periods and a summary of the days covered), the report's own filters
// as children, then Print and Get Report.
const ReportFilter = ({ fromDate, toDate, onFromDateChange, onToDateChange, onGetReport, onPrint, children }) => {
    const today = startOfDay(new Date());
    const valid = !!fromDate && !!toDate && differenceInCalendarDays(toDate, fromDate) >= 0;
    const days = valid ? differenceInCalendarDays(toDate, fromDate) + 1 : 0;

    return (
        <ConfigProvider theme={FILTER_THEME}>
            <section className="card rf-card" aria-label="Apply Filter">
                <div className="rf-body">
                    <div className="rf-period">
                        <div className="rf-dates">
                            <div className="rf-field">
                                <span className="rf-label">From Date</span>
                                <DatePicker
                                    value={fromDate}
                                    onChange={onFromDateChange}
                                    format="dd-MM-y"
                                    clearIcon={null}
                                    calendarAriaLabel="Pick From Date"
                                />
                            </div>
                            <span className="rf-arrow" aria-hidden="true">
                                →
                            </span>
                            <div className="rf-field">
                                <span className="rf-label">To Date</span>
                                <DatePicker
                                    value={toDate}
                                    onChange={onToDateChange}
                                    format="dd-MM-y"
                                    clearIcon={null}
                                    calendarAriaLabel="Pick To Date"
                                />
                            </div>
                        </div>
                        <p className={`rf-summary${valid ? "" : " is-invalid"}`} aria-live="polite">
                            {valid ? (
                                <>
                                    {periodText(fromDate, toDate)}
                                    <span className="rf-dot" aria-hidden="true">·</span>
                                    <strong>
                                        {days} {days === 1 ? "day" : "days"}
                                    </strong>
                                </>
                            ) : (
                                "To Date is before From Date"
                            )}
                        </p>
                    </div>

                    <div className="rf-presets" role="group" aria-label="Quick periods">
                        {PERIODS.map(({ label, range }) => {
                            const [from, to] = range(today);
                            const active = valid && isSameDay(from, fromDate) && isSameDay(to, toDate);
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    className="rf-preset"
                                    aria-pressed={active}
                                    onClick={() => {
                                        onFromDateChange(from);
                                        onToDateChange(to);
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="rf-footer">
                    {children && <div className="rf-extras">{children}</div>}
                    <div className="rf-actions">
                        <Button size="large" icon={<PrinterOutlined />} onClick={() => onPrint()}>
                            Print
                        </Button>
                        <Button size="large" type="primary" onClick={() => onGetReport()} disabled={!valid}>
                            Get Report
                        </Button>
                    </div>
                </div>
            </section>
        </ConfigProvider>
    );
};

export default ReportFilter;
