"use client";

import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";

import { sanityApiVersion } from "@/lib/sanity/env";

type ReportType = "subscribers" | "comments" | "traffic";
type TrafficPreset = "today" | "week" | "month" | "thisMonth" | "custom";

type SubscriberRow = {
  email: string;
  source?: string;
  subscribedAt?: string;
};

type CommentRow = {
  name: string;
  email?: string;
  message?: string;
  approved?: boolean;
  submittedAt?: string;
  postTitle?: string;
  replyTo?: string;
};

type TrafficRow = {
  visitorId?: string;
  path?: string;
  referrer?: string;
  visitedAt?: string;
};

type DailyTrafficRow = {
  day: string;
  pageViews: number;
  uniqueVisitors: number;
};

type TopPageRow = {
  path: string;
  pageViews: number;
  uniqueVisitors: number;
};

const TRAFFIC_QUERY = `*[
  _type == "siteVisit" &&
  (!defined($from) || dateTime(coalesce(visitedAt, _createdAt)) >= dateTime($from)) &&
  (!defined($to) || dateTime(coalesce(visitedAt, _createdAt)) < dateTime($to))
] | order(coalesce(visitedAt, _createdAt) desc) {
  visitorId,
  path,
  referrer,
  "visitedAt": coalesce(visitedAt, _createdAt)
}`;

const REPORT_CONFIG: Record<
  ReportType,
  {
    title: string;
    description: string;
    filename: string;
    query: string;
    columns: { key: string; label: string }[];
  }
> = {
  subscribers: {
    title: "Subscribers CSV",
    description: "Download newsletter subscribers for a custom period.",
    filename: "subscribers",
    query: `*[
      _type == "newsletterSubscriber" &&
      (!defined($from) || dateTime(coalesce(subscribedAt, _createdAt)) >= dateTime($from)) &&
      (!defined($to) || dateTime(coalesce(subscribedAt, _createdAt)) < dateTime($to))
    ] | order(coalesce(subscribedAt, _createdAt) desc) {
      email,
      source,
      "subscribedAt": coalesce(subscribedAt, _createdAt)
    }`,
    columns: [
      { key: "email", label: "Email" },
      { key: "source", label: "Source" },
      { key: "subscribedAt", label: "Subscribed At" },
    ],
  },
  comments: {
    title: "Comments CSV",
    description: "Download comments and replies for a custom period.",
    filename: "comments",
    query: `*[
      _type == "comment" &&
      (!defined($from) || dateTime(coalesce(createdAt, _createdAt)) >= dateTime($from)) &&
      (!defined($to) || dateTime(coalesce(createdAt, _createdAt)) < dateTime($to))
    ] | order(coalesce(createdAt, _createdAt) desc) {
      name,
      email,
      message,
      approved,
      "submittedAt": coalesce(createdAt, _createdAt),
      "postTitle": post->title,
      "replyTo": parentComment->name
    }`,
    columns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "postTitle", label: "Post" },
      { key: "replyTo", label: "Reply To" },
      { key: "approved", label: "Approved" },
      { key: "submittedAt", label: "Submitted At" },
      { key: "message", label: "Message" },
    ],
  },
  traffic: {
    title: "Traffic CSV",
    description: "Download raw visit logs for a custom period.",
    filename: "traffic",
    query: TRAFFIC_QUERY,
    columns: [
      { key: "visitedAt", label: "Visited At" },
      { key: "visitorId", label: "Visitor ID" },
      { key: "path", label: "Path" },
      { key: "referrer", label: "Referrer" },
    ],
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function startOfMonth() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysAgo(days: number) {
  const date = startOfToday();
  date.setDate(date.getDate() - days);
  return date;
}

function getPresetDates(preset: TrafficPreset) {
  const today = formatDateInput(startOfToday());

  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "week":
      return { from: formatDateInput(daysAgo(6)), to: today };
    case "month":
      return { from: formatDateInput(daysAgo(29)), to: today };
    case "thisMonth":
      return { from: formatDateInput(startOfMonth()), to: today };
    case "custom":
    default:
      return { from: "", to: "" };
  }
}

function parseDateInput(date: string) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function toIsoStart(date: string) {
  const parsed = parseDateInput(date);
  return parsed ? parsed.toISOString() : null;
}

function toIsoExclusiveEnd(date: string) {
  const parsed = parseDateInput(date);

  if (!parsed) {
    return null;
  }

  parsed.setDate(parsed.getDate() + 1);
  return parsed.toISOString();
}

function toLocalDayKey(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return formatDateInput(date);
}

function formatReadableDate(day: string) {
  const parsed = parseDateInput(day);

  if (!parsed) {
    return day;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeCsv(value: unknown) {
  const stringValue =
    value === null || value === undefined ? "" : String(value).replace(/\r?\n/g, " ");
  const escaped = stringValue.replaceAll('"', '""');
  return /[",]/.test(escaped) ? `"${escaped}"` : escaped;
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function buildTrafficSummary(rows: TrafficRow[]) {
  const uniqueVisitorSet = new Set<string>();
  const dailyMap = new Map<string, { pageViews: number; visitors: Set<string> }>();
  const pageMap = new Map<string, { pageViews: number; visitors: Set<string> }>();

  for (const row of rows) {
    const visitorId = row.visitorId?.trim();
    const path = row.path?.trim() || "/";
    const dayKey = toLocalDayKey(row.visitedAt);

    if (visitorId) {
      uniqueVisitorSet.add(visitorId);
    }

    if (dayKey) {
      const currentDay = dailyMap.get(dayKey) || {
        pageViews: 0,
        visitors: new Set<string>(),
      };

      currentDay.pageViews += 1;

      if (visitorId) {
        currentDay.visitors.add(visitorId);
      }

      dailyMap.set(dayKey, currentDay);
    }

    const currentPage = pageMap.get(path) || {
      pageViews: 0,
      visitors: new Set<string>(),
    };

    currentPage.pageViews += 1;

    if (visitorId) {
      currentPage.visitors.add(visitorId);
    }

    pageMap.set(path, currentPage);
  }

  const dailyRows: DailyTrafficRow[] = Array.from(dailyMap.entries())
    .map(([day, value]) => ({
      day,
      pageViews: value.pageViews,
      uniqueVisitors: value.visitors.size,
    }))
    .sort((a, b) => (a.day < b.day ? 1 : -1));

  const topPages: TopPageRow[] = Array.from(pageMap.entries())
    .map(([path, value]) => ({
      path,
      pageViews: value.pageViews,
      uniqueVisitors: value.visitors.size,
    }))
    .sort((a, b) => b.pageViews - a.pageViews)
    .slice(0, 8);

  return {
    uniqueVisitors: uniqueVisitorSet.size,
    pageViews: rows.length,
    activeDays: dailyRows.length,
    averageViewsPerVisitor:
      uniqueVisitorSet.size > 0 ? (rows.length / uniqueVisitorSet.size).toFixed(1) : "0.0",
    dailyRows,
    topPages,
  };
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        borderRadius: "18px",
        border: "1px solid #d7eadf",
        background: "#ffffff",
        padding: "18px",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#1b4332",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "10px 0 0",
          color: "#4b2b70",
          fontFamily: "var(--font-fraunces), serif",
          fontSize: "2.2rem",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export function ReportsTool() {
  const client = useClient({ apiVersion: sanityApiVersion });
  const [reportType, setReportType] = useState<ReportType>("subscribers");
  const [trafficPreset, setTrafficPreset] = useState<TrafficPreset>("week");
  const [fromDate, setFromDate] = useState(() => getPresetDates("week").from);
  const [toDate, setToDate] = useState(() => getPresetDates("week").to);
  const [status, setStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [trafficStatus, setTrafficStatus] = useState<string | null>(null);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(false);
  const [trafficRows, setTrafficRows] = useState<TrafficRow[]>([]);

  const config = REPORT_CONFIG[reportType];
  const trafficSummary = useMemo(() => buildTrafficSummary(trafficRows), [trafficRows]);

  useEffect(() => {
    async function loadTraffic() {
      setIsLoadingTraffic(true);
      setTrafficStatus(null);

      try {
        const rows = await client.fetch<TrafficRow[]>(TRAFFIC_QUERY, {
          from: toIsoStart(fromDate),
          to: toIsoExclusiveEnd(toDate),
        });

        setTrafficRows(rows);
      } catch {
        setTrafficRows([]);
        setTrafficStatus("Traffic analytics could not be loaded right now.");
      } finally {
        setIsLoadingTraffic(false);
      }
    }

    void loadTraffic();
  }, [client, fromDate, toDate]);

  async function handleExport() {
    setIsExporting(true);
    setStatus(null);

    try {
      const rows = await client.fetch<SubscriberRow[] | CommentRow[] | TrafficRow[]>(
        config.query,
        {
          from: toIsoStart(fromDate),
          to: toIsoExclusiveEnd(toDate),
        },
      );

      const header = config.columns.map((column) => escapeCsv(column.label)).join(",");
      const lines = rows.map((row) =>
        config.columns
          .map((column) => escapeCsv((row as Record<string, unknown>)[column.key]))
          .join(","),
      );
      const csv = [header, ...lines].join("\n");
      const fromLabel = fromDate || "all-time";
      const toLabel = toDate || "today";

      downloadCsv(`${config.filename}-${fromLabel}-to-${toLabel}.csv`, csv);
      setStatus(`Downloaded ${rows.length} row${rows.length === 1 ? "" : "s"} successfully.`);
    } catch {
      setStatus("The export could not be created right now. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  function applyTrafficPreset(preset: TrafficPreset) {
    setTrafficPreset(preset);

    if (preset === "custom") {
      return;
    }

    const range = getPresetDates(preset);
    setFromDate(range.from);
    setToDate(range.to);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f6faf7", padding: "32px" }}>
      <div
        style={{
          margin: "0 auto",
          maxWidth: "1040px",
          display: "grid",
          gap: "24px",
        }}
      >
        <div
          style={{
            borderRadius: "24px",
            border: "1px solid #d7eadf",
            background: "#ffffff",
            padding: "28px",
            boxShadow: "0 18px 35px -28px rgba(75, 43, 112, 0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#4b2b70",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Reports
          </p>
          <h1
            style={{
              margin: "12px 0 8px",
              color: "#4b2b70",
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "2.8rem",
              lineHeight: 1,
            }}
          >
            Traffic, comments, and subscribers.
          </h1>
          <p style={{ margin: 0, color: "#333333", fontSize: "1rem", lineHeight: 1.8 }}>
            Track visits over time, review how many readers are showing up, and export your important Studio data whenever you need it.
          </p>

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {[
                { label: "Today", value: "today" },
                { label: "Last 7 days", value: "week" },
                { label: "Last 30 days", value: "month" },
                { label: "This month", value: "thisMonth" },
                { label: "Custom", value: "custom" },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => applyTrafficPreset(preset.value as TrafficPreset)}
                  style={{
                    borderRadius: "999px",
                    border:
                      trafficPreset === preset.value
                        ? "1px solid #4b2b70"
                        : "1px solid #d7eadf",
                    background:
                      trafficPreset === preset.value ? "#4b2b70" : "#ffffff",
                    color: trafficPreset === preset.value ? "#ffffff" : "#1b4332",
                    padding: "10px 16px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              }}
            >
              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ color: "#1b4332", fontWeight: 700 }}>From date</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setTrafficPreset("custom");
                    setFromDate(event.target.value);
                  }}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #d7eadf",
                    padding: "12px 14px",
                    fontSize: "0.95rem",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "8px" }}>
                <span style={{ color: "#1b4332", fontWeight: 700 }}>To date</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setTrafficPreset("custom");
                    setToDate(event.target.value);
                  }}
                  style={{
                    borderRadius: "16px",
                    border: "1px solid #d7eadf",
                    padding: "12px 14px",
                    fontSize: "0.95rem",
                  }}
                />
              </label>
            </div>
          </div>

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "14px",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            }}
          >
            <StatCard
              label="Unique visitors"
              value={isLoadingTraffic ? "..." : trafficSummary.uniqueVisitors}
            />
            <StatCard
              label="Page views"
              value={isLoadingTraffic ? "..." : trafficSummary.pageViews}
            />
            <StatCard
              label="Tracked days"
              value={isLoadingTraffic ? "..." : trafficSummary.activeDays}
            />
            <StatCard
              label="Views per visitor"
              value={isLoadingTraffic ? "..." : trafficSummary.averageViewsPerVisitor}
            />
          </div>

          {trafficStatus ? (
            <p style={{ margin: "16px 0 0", color: "#8a2f2f" }}>{trafficStatus}</p>
          ) : null}

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "20px",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            }}
          >
            <div
              style={{
                borderRadius: "20px",
                background: "#f8fcfa",
                border: "1px solid #d7eadf",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#4b2b70",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                Daily breakdown
              </p>
              <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                {trafficSummary.dailyRows.length ? (
                  trafficSummary.dailyRows.slice(0, 10).map((row) => (
                    <div
                      key={row.day}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        borderTop: "1px solid #d7eadf",
                        paddingTop: "10px",
                      }}
                    >
                      <div>
                        <p style={{ margin: 0, color: "#1b4332", fontWeight: 700 }}>
                          {formatReadableDate(row.day)}
                        </p>
                        <p style={{ margin: "4px 0 0", color: "#333333" }}>
                          {row.uniqueVisitors} visitor{row.uniqueVisitors === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p style={{ margin: 0, color: "#4b2b70", fontWeight: 700 }}>
                        {row.pageViews} views
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: "#333333", lineHeight: 1.7 }}>
                    No tracked visits yet for this period.
                  </p>
                )}
              </div>
            </div>

            <div
              style={{
                borderRadius: "20px",
                background: "#f8fcfa",
                border: "1px solid #d7eadf",
                padding: "18px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#4b2b70",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                Top pages
              </p>
              <div style={{ marginTop: "12px", display: "grid", gap: "10px" }}>
                {trafficSummary.topPages.length ? (
                  trafficSummary.topPages.map((row) => (
                    <div
                      key={row.path}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        borderTop: "1px solid #d7eadf",
                        paddingTop: "10px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            color: "#1b4332",
                            fontWeight: 700,
                            wordBreak: "break-word",
                          }}
                        >
                          {row.path}
                        </p>
                        <p style={{ margin: "4px 0 0", color: "#333333" }}>
                          {row.uniqueVisitors} visitor{row.uniqueVisitors === 1 ? "" : "s"}
                        </p>
                      </div>
                      <p style={{ margin: 0, color: "#4b2b70", fontWeight: 700 }}>
                        {row.pageViews} views
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ margin: 0, color: "#333333", lineHeight: 1.7 }}>
                    Top pages will appear here once traffic starts coming in.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: "24px",
            border: "1px solid #d7eadf",
            background: "#ffffff",
            padding: "28px",
            boxShadow: "0 18px 35px -28px rgba(75, 43, 112, 0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#4b2b70",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            CSV exports
          </p>
          <h2
            style={{
              margin: "12px 0 8px",
              color: "#4b2b70",
              fontFamily: "var(--font-fraunces), serif",
              fontSize: "2.2rem",
              lineHeight: 1,
            }}
          >
            Download your stored data.
          </h2>
          <p style={{ margin: 0, color: "#333333", fontSize: "1rem", lineHeight: 1.8 }}>
            Use the same date range above to export subscribers, comments, or raw traffic logs as a CSV file.
          </p>

          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={{ color: "#1b4332", fontWeight: 700 }}>Data type</span>
              <select
                value={reportType}
                onChange={(event) => setReportType(event.target.value as ReportType)}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #d7eadf",
                  padding: "12px 14px",
                  fontSize: "0.95rem",
                }}
              >
                <option value="subscribers">Subscribers</option>
                <option value="comments">Comments</option>
                <option value="traffic">Traffic</option>
              </select>
            </label>
          </div>

          <div
            style={{
              marginTop: "20px",
              borderRadius: "20px",
              background: "#f8fcfa",
              border: "1px solid #d7eadf",
              padding: "18px",
            }}
          >
            <p style={{ margin: 0, color: "#4b2b70", fontWeight: 700 }}>{config.title}</p>
            <p style={{ margin: "8px 0 0", color: "#333333", lineHeight: 1.8 }}>
              {config.description}
            </p>
          </div>

          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              style={{
                border: 0,
                borderRadius: "999px",
                background: "#4b2b70",
                color: "#ffffff",
                padding: "12px 20px",
                fontWeight: 700,
                cursor: isExporting ? "not-allowed" : "pointer",
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              {isExporting ? "Preparing CSV..." : "Download CSV"}
            </button>
            {status ? <p style={{ margin: 0, color: "#333333" }}>{status}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export const reportsTool = {
  name: "reports",
  title: "Reports",
  component: ReportsTool,
};
