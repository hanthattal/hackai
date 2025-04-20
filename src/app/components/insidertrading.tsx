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
    <div tabIndex={0} className="collapse collapse-arrow bg-slate-100 rounded-2xl shadow">
      <div className="collapse-title text-xl font-semibold">
        <div className="space-y-6 pt-2">
            <h3 className="text-lg font-semibold text-green-700">Summary</h3>
            <p className="text-sm text-gray-700 mt-2">{insiderSummary?.summary || "No summary available."}</p>
          </div>
      </div>
      
      <div className="collapse-content">
        <div className="space-y-6 pt-2">
          {/* <div>
            <h3 className="text-lg font-semibold text-green-700">Summary</h3>
            <p className="text-sm text-gray-700 mt-2">{insiderSummary?.summary || "No summary available."}</p>
          </div> */}

          <div>
            <h3 className="text-lg font-semibold text-green-700">Key Insider Actions</h3>
            <div className="overflow-auto mt-2">
              <table className="table table-zebra w-full text-sm">
                <thead>
                  <tr className="bg-green-50">
                    <th>Insider</th>
                    <th>Action</th>
                    <th>Shares</th>
                    <th>Value</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(insiderSummary?.key_actions) && insiderSummary.key_actions.length > 0 ? (
                    insiderSummary.key_actions.map((action, idx) => (
                      <tr key={idx}>
                        <td>{action.insider}</td>
                        <td>
                          <span className={action.action === "buy" ? "text-green-600" : "text-red-600"}>
                            {action.action}
                          </span>
                        </td>
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

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-700">📈 Totals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Total Shares Sold</p>
                <p className="font-semibold">{insiderSummary?.totals?.total_shares_sold?.toLocaleString?.() || "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Total Value Sold</p>
                <p className="font-semibold">${insiderSummary?.totals?.total_value_sold?.toLocaleString?.() || "N/A"}</p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Date Range</p>
                <p className="font-semibold text-sm">
                  {insiderSummary?.totals?.date_range?.from || "N/A"} to {insiderSummary?.totals?.date_range?.to || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-green-700">📊 Conclusion</h3>
            <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-4 rounded-lg border-l-4 border-green-500">
              {insiderSummary?.conclusion || "No conclusion available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};