"use client";

import { useState } from "react";
import { useClient } from "sanity";

import { sanityApiVersion } from "@/lib/sanity/env";

type ReportType = "subscribers" | "comments";

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
};

function toIsoStart(date: string) {
  return date ? new Date(`${date}T00:00:00.000Z`).toISOString() : null;
}

function toIsoExclusiveEnd(date: string) {
  if (!date) {
    return null;
  }

  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString();
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

export function ReportsTool() {
  const client = useClient({ apiVersion: sanityApiVersion });
  const [reportType, setReportType] = useState<ReportType>("subscribers");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const config = REPORT_CONFIG[reportType];

  async function handleExport() {
    setIsExporting(true);
    setStatus(null);

    try {
      const rows = await client.fetch<SubscriberRow[] | CommentRow[]>(config.query, {
        from: toIsoStart(fromDate),
        to: toIsoExclusiveEnd(toDate),
      });

      const header = config.columns.map((column) => escapeCsv(column.label)).join(",");
      const lines = rows.map((row) =>
        config.columns.map((column) => escapeCsv((row as Record<string, unknown>)[column.key])).join(","),
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

  return (
    <div style={{ minHeight: "100vh", background: "#f6faf7", padding: "32px" }}>
      <div
        style={{
          margin: "0 auto",
          maxWidth: "900px",
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
          Export your Studio data as CSV.
        </h1>
        <p style={{ margin: 0, color: "#333333", fontSize: "1rem", lineHeight: 1.8 }}>
          Choose a data type, set a custom period, and download a spreadsheet for comments or subscribers.
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
            </select>
          </label>

          <label style={{ display: "grid", gap: "8px" }}>
            <span style={{ color: "#1b4332", fontWeight: 700 }}>From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
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
              onChange={(event) => setToDate(event.target.value)}
              style={{
                borderRadius: "16px",
                border: "1px solid #d7eadf",
                padding: "12px 14px",
                fontSize: "0.95rem",
              }}
            />
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

        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
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
          {status ? (
            <p style={{ margin: 0, color: "#333333" }}>{status}</p>
          ) : null}
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
