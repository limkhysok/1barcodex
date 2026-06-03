import React from "react";

const NAVY = "#1c3456";
const BORDER_COLOR = "#000000";
const OUTER_BORDER = `0px solid ${NAVY}`;

export const ROWS_PER_PAGE = 25;

const CELL_BASE: React.CSSProperties = {
  border: `1px solid ${BORDER_COLOR}`,
  fontSize: "12px",
  lineHeight: "1.6",
  padding: "7px 5px",
  boxSizing: "border-box",
};

const CELL_HEADER: React.CSSProperties = {
  ...CELL_BASE,
  backgroundColor: "#ffffff",
  color: "#000000",
  textAlign: "center",
  fontWeight: "normal",
  fontSize: "14px",
  verticalAlign: "middle",
  padding: "0px 5px 10px 5px",
  
};

const CELL_BODY: React.CSSProperties = {
  ...CELL_BASE,
  backgroundColor: "#ffffff",
  color: "#000000",
  verticalAlign: "middle",
  textAlign: "center",
  fontSize: "13px",
  padding: "0px 5px 10px 5px",
};

const CELL_BODY_ALT: React.CSSProperties = {
  ...CELL_BODY,
  backgroundColor: "#ffffff",
};

const CELL_CENTER: React.CSSProperties = { ...CELL_BODY, textAlign: "center" };
const CELL_CENTER_ALT: React.CSSProperties = { ...CELL_BODY_ALT, textAlign: "center" };

const CELL_SUMMARY: React.CSSProperties = {
  ...CELL_BASE,
  backgroundColor: "#ffffff",
  verticalAlign: "middle",
  borderTopColor: "#000000",
  borderTopWidth: "0px",
  fontSize: "14px",
  padding: "0px 5px 10px 5px",
};

const TITLE: Record<"Sale" | "Receive", string> = {
  Sale:    "ប័ណ្ណស្នើបើកគ្រឿងបន្លាស់",
  Receive: "ប័ណ្ណស្នើបញ្ចូលគ្រឿងបន្លាស់",
};

const TableHead = () => (
  <thead>
    <tr>
      <th style={{ ...CELL_HEADER, width: "33px", }}>ល.រ</th>
      <th style={{ ...CELL_HEADER }}>បរិយាយមុខទំនិញ</th>
      <th style={{ ...CELL_HEADER, width: "22%" }}>លេខកូដ</th>
      <th style={{ ...CELL_HEADER, width: "14%" }}>ឯកតា</th>
      <th style={{ ...CELL_HEADER, width: "12%" }}>បរិមាណ</th>
      <th style={{ ...CELL_HEADER, width: "15%" }}>ផ្សេងៗ</th>
    </tr>
  </thead>
);

const TransactionTemplate = ({ transaction, autoDate, date }: {
  transaction: {
    transaction_type: "Sale" | "Receive";
    items: { barcode: string; product_name: string; unit?: string; quantity: number }[];
  };
  autoDate?: boolean;
  date?: string;
}) => {
  const title = TITLE[transaction.transaction_type];
  const displayDate = autoDate && date
    ? (() => {
        const d = new Date(date);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear());
        return `ថ្ងៃទី ${dd} ខែ ${mm} ឆ្នាំ ${yy}`;
      })()
    : "ថ្ងៃទី....... ខែ....... ឆ្នាំ ........";
  const items = transaction.items;

  const chunks: typeof items[] = [];
  if (items.length === 0) {
    chunks.push([]);
  } else {
    for (let i = 0; i < items.length; i += ROWS_PER_PAGE) {
      chunks.push(items.slice(i, i + ROWS_PER_PAGE));
    }
  }

  return (
    <>
      {chunks.map((chunk, pageIndex) => {
        const isFirst = pageIndex === 0;
        const isLast = pageIndex === chunks.length - 1;
        const startIndex = pageIndex * ROWS_PER_PAGE;

        return (
          <div
            key={`page-${startIndex}`}
            id={`pdf-page-${startIndex}`}
            style={{
              width: "794px",
              minHeight: "1123px",
              padding: "50px 60px 50px",
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: "var(--font-kantumruy, 'KantumruyPro', sans-serif)",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header — first page only */}
            {isFirst && (
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 6px 0", color: "#000000" }}>
                  {title}
                </h1>
                <p style={{ fontSize: "15px", margin: 0, color: "#0d0d0d", fontWeight: "normal" }}>{displayDate}</p>
              </div>
            )}

            {/* Continuation label */}
            {!isFirst && (
              <div style={{
                textAlign: "right",
                marginBottom: "10px",
                fontSize: "10px",
                color: "#888",
                borderBottom: `0px solid ${BORDER_COLOR}`,
                paddingBottom: "6px",
              }}>
                (បន្ត) ទំព័រទី {pageIndex + 1}/{chunks.length}
              </div>
            )}

            {/* Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                border: OUTER_BORDER,
              }}
            >
              <TableHead />
              <tbody>
                {chunk.map((item, idx) => {
                  const isAlt = (startIndex + idx) % 2 === 1;
                  return (
                    <tr key={`${startIndex + idx}-${item.barcode}`}>
                      <td style={isAlt ? CELL_CENTER_ALT : CELL_CENTER}>{startIndex + idx + 1}</td>
                      <td style={{ ...(isAlt ? CELL_BODY_ALT : CELL_BODY), paddingLeft: "8px" }}>{item.product_name}</td>
                      <td style={{ ...(isAlt ? CELL_BODY_ALT : CELL_BODY), paddingLeft: "8px" }}>{item.barcode}</td>
                      <td style={isAlt ? CELL_CENTER_ALT : CELL_CENTER}>{item.unit ?? "Pcs"}</td>
                      <td style={isAlt ? CELL_CENTER_ALT : CELL_CENTER}>{Math.abs(item.quantity)}</td>
                      <td style={isAlt ? CELL_BODY_ALT : CELL_BODY}></td>
                    </tr>
                  );
                })}

                {/* Empty filler rows (min 5 rows on last page) */}
                {isLast && chunk.length < 5 && (["r0","r1","r2","r3","r4"] as const).slice(chunk.length).map((rowKey) => (
                  <tr key={`empty-${startIndex}-${rowKey}`}>
                    <td style={{ ...CELL_BODY, height: "32px" }}>&nbsp;</td>
                    <td style={CELL_BODY}></td>
                    <td style={CELL_BODY}></td>
                    <td style={CELL_BODY}></td>
                    <td style={CELL_BODY}></td>
                    <td style={CELL_BODY}></td>
                  </tr>
                ))}

                {/* Summary row — last page only */}
                {isLast && (
                  <tr>
                    <td style={CELL_SUMMARY}></td>
                    <td style={{ ...CELL_SUMMARY, textAlign: "right", fontWeight: "semibold", paddingRight: "8px" }}>មុខទំនិញសរុប</td>
                    <td style={{ ...CELL_SUMMARY, textAlign: "center", fontWeight: "semibold" }}>{items.length}</td>
                    <td style={{ ...CELL_SUMMARY, textAlign: "right", fontWeight: "semibold", paddingRight: "8px" }}>បរិមាណសរុប</td>
                    <td style={{ ...CELL_SUMMARY, textAlign: "center", fontWeight: "semibold" }}>{items.reduce((sum, i) => sum + Math.abs(i.quantity), 0)}</td>
                    <td style={CELL_SUMMARY}></td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Signature footer — last page only */}
            {isLast && (
              <div style={{ display: "flex", justifyContent: "space-evenly", marginTop: "56px", padding: "0 20px" }}>
                {(["ផ្នែកជាង", "ប្រធានឃ្លាំង"] as const).map((label) => (
                  <div key={label} style={{ textAlign: "center", width: "130px" }}>
                    <p style={{ fontSize: "14px", fontWeight: "normal", margin: "0 0 55px 0", color: "#000000" }}>{label}</p>
                    <div style={{ borderBottom: `1px solid #000000`, width: "100%" }} />
                    <p style={{ fontSize: "14px", color: "#000000", marginTop: "7px" }}>ហត្ថលេខា</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default TransactionTemplate;
