import React from "react";

export type InsiderSummary = {
  summary: string;
  key_actions: {
    insider: string;
    action: "buy" | "sell";
    shares: number;
    value_usd: number;
    transaction_date: string;
  }[];
  totals: {
    total_shares_sold: number;
    total_value_sold: number;
    date_range: { from: string; to: string };
  };
  conclusion: string;
};

export const InsiderTradingSection = ({ insiderSummary }: { insiderSummary: InsiderSummary }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">\ud83d\udcc4 Summary</h2>
        <p className="text-sm text-gray-700">{insiderSummary?.summary || "No summary available."}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">\ud83e\uddd1\u200d\ud83d\udcbc Key Insider Actions</h2>
        <div className="overflow-auto">
          <table className="table table-zebra w-full text-sm">
            <thead>
              <tr>
                <th>Insider</th>
                <th>Action</th>
                <th>Shares</th>
                <th>Value</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(insiderSummary.key_actions) && insiderSummary.key_actions.length > 0 ? (
                insiderSummary.key_actions.map((action, idx) => (
                  <tr key={idx}>
                    <td>{action.insider}</td>
                    <td>{action.action}</td>
                    <td>{action.shares.toLocaleString()}</td>
                    <td>${action.value_usd.toLocaleString()}</td>
                    <td>{action.transaction_date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500">No insider actions available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">\ud83d\udcca Totals</h2>
        <p>Total Shares Sold: {insiderSummary?.totals?.total_shares_sold?.toLocaleString?.() || "N/A"}</p>
        <p>Total Value Sold: ${insiderSummary?.totals?.total_value_sold?.toLocaleString?.() || "N/A"}</p>
        <p>Date Range: {insiderSummary?.totals?.date_range?.from || "N/A"} to {insiderSummary?.totals?.date_range?.to || "N/A"}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold">\ud83d\udcc8 Conclusion</h2>
        <p className="text-sm text-gray-700">{insiderSummary?.conclusion || "No conclusion available."}</p>
      </div>
    </div>
  );
};
