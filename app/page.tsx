"use client";

import { useWidgetProps } from "./hooks/use-widget-props";
import { useDisplayMode } from "./hooks/use-display-mode";

type DomainResult = {
  name: string;
  available: boolean;
  price: number | null;
  period: number | null;
  priceError?: string | null;
  error?: string;
  message: string;
};

type DomainCheckOutput = {
  result?: {
    structuredContent?: {
      message?: string;
      results?: DomainResult[];
      summary?: {
        total: number;
        available: number;
        unavailable: number;
        totalPrice: number;
      };
    };
  };
};

// Mock data for testing - comment out when done
const MOCK_DATA: DomainCheckOutput = {
  result: {
    structuredContent: {
      message: "Checked 15 domains: 12 available, 3 unavailable. Total cost for available domains: $156.87 USD",
      results: [
        { name: "useworkflow.com", available: false, price: null, period: null, message: "Domain useworkflow.com is not available for purchase" },
        { name: "useworkflow.dev", available: false, price: null, period: null, message: "Domain useworkflow.dev is not available for purchase" },
        { name: "useworkflow.app", available: false, price: null, period: null, message: "Domain useworkflow.app is not available for purchase" },
        { name: "useworkflow.io", available: true, price: 44.99, period: 1, message: "Domain useworkflow.io is available for $44.99 USD for 1 year" },
        { name: "useworkflow.ai", available: true, price: 140.00, period: 2, message: "Domain useworkflow.ai is available for $140.00 USD for 2 years" },
        { name: "useworkflow.xyz", available: true, price: 1.99, period: 1, message: "Domain useworkflow.xyz is available for $1.99 USD for 1 year" },
        { name: "useworkflow.org", available: true, price: 8.99, period: 1, message: "Domain useworkflow.org is available for $8.99 USD for 1 year" },
        { name: "useworkflow.me", available: true, price: 11.99, period: 1, message: "Domain useworkflow.me is available for $11.99 USD for 1 year" },
        { name: "useworkflow.net", available: true, price: 13.50, period: 1, message: "Domain useworkflow.net is available for $13.50 USD for 1 year" },
        { name: "useworkflow.tech", available: true, price: 13.99, period: 1, message: "Domain useworkflow.tech is available for $13.99 USD for 1 year" },
        { name: "useworkflow.space", available: true, price: 4.99, period: 1, message: "Domain useworkflow.space is available for $4.99 USD for 1 year" },
        { name: "useworkflow.cloud", available: false, price: null, period: null, message: "Domain useworkflow.cloud is not available for purchase" },
        { name: "useworkflow.studio", available: true, price: 21.99, period: 1, message: "Domain useworkflow.studio is available for $21.99 USD for 1 year" },
        { name: "useworkflow.academy", available: true, price: 21.99, period: 1, message: "Domain useworkflow.academy is available for $21.99 USD for 1 year" },
        { name: "useworkflow.agency", available: true, price: 19.99, period: 1, message: "Domain useworkflow.agency is available for $19.99 USD for 1 year" },
      ],
      summary: {
        total: 15,
        available: 12,
        unavailable: 3,
        totalPrice: 308.40,
      },
    },
  },
};

export default function Home() {
  const toolOutput = useWidgetProps<DomainCheckOutput>();
  const displayMode = useDisplayMode();
  
  // Extract the actual domain data from the nested structure
  // Uncomment the line below to test with mock data
  // const domainData = MOCK_DATA.result?.structuredContent;
  const domainData = toolOutput?.result?.structuredContent;

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative">
      {/* Fullscreen Toggle Buttons */}
      {displayMode !== "fullscreen" ? (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => {
            if (typeof window !== "undefined" && window?.openai?.requestDisplayMode) {
              window.openai.requestDisplayMode({ mode: "fullscreen" });
            }
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      ) : (
        <button
          aria-label="Exit fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-lg ring-1 ring-slate-900/10 dark:ring-white/10 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => {
            if (typeof window !== "undefined" && window?.openai?.requestDisplayMode) {
              window.openai.requestDisplayMode({ mode: "inline" });
            }
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
            />
          </svg>
        </button>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {domainData?.results && domainData.results.length > 0 ? (
          <div className="space-y-6">
            {domainData.summary && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {domainData.summary.total}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Total Checked
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {domainData.summary.available}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Available
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {domainData.summary.unavailable}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Unavailable
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${domainData.summary.totalPrice}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Total Cost
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Domain Results - Grid Layout */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                All Results
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {domainData.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {result.name}
                        </div>
                        {result.period && result.period > 1 && result.available && (
                          <div className="mt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {result.period} Year Domain
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {result.available ? (
                          <>
                            <div className="text-right">
                              <div className="font-semibold text-slate-900 dark:text-white">
                                ${result.price}
                              </div>
                            </div>
                            <button
                              className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              aria-label={`Add ${result.name} to cart`}
                            >
                              <svg
                                className="w-5 h-5 text-slate-700 dark:text-slate-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Skeleton Loading State */
          <div className="space-y-6">
            {/* Skeleton Summary Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <div className="h-9 bg-slate-200 dark:bg-slate-700 rounded w-16 mx-auto mb-2 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 mx-auto animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skeleton Grid */}
            <div>
              <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-28 mb-4 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-12 animate-pulse"></div>
                        <div className="h-9 w-9 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
