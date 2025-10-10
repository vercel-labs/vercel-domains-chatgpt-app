"use client";

import Image from "next/image";
import { useWidgetProps } from "./hooks/use-widget-props";

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
  message?: string;
  results?: DomainResult[];
  summary?: {
    total: number;
    available: number;
    unavailable: number;
    totalPrice: number;
  };
};

export default function Home() {
  const toolOutput = useWidgetProps<DomainCheckOutput>();

  return (
    <div className="font-sans min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            {/* <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <Image
                className="dark:invert"
                src="/vercel.svg"
                alt="Vercel logo"
                width={120}
                height={30}
                priority
              />
            </div> */}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Domain Search
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Ask me to check domain availability and pricing. Try: "Check if example.com is available"
          </p>
        </div>

        {/* Results Section */}
        {toolOutput?.results && toolOutput.results.length > 0 ? (
          <div className="space-y-6">
            {/* Summary Card */}
            {toolOutput.summary && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                  Summary
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {toolOutput.summary.total}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Total Checked
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {toolOutput.summary.available}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Available
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {toolOutput.summary.unavailable}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Unavailable
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${toolOutput.summary.totalPrice}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Total Cost
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Domain Results */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Domain Results
              </h2>
              {toolOutput.results.map((result, index) => (
                <div
                  key={index}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 border-2 transition-all hover:shadow-lg ${
                    result.available
                      ? "border-green-500 dark:border-green-400"
                      : "border-red-500 dark:border-red-400"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          {result.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            result.available
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}
                        >
                          {result.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {result.message}
                      </p>
                      {result.error && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                    {result.available && result.price !== null && (
                      <div className="flex flex-col items-start sm:items-end gap-1">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">
                          ${result.price}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          per {result.period} year{result.period && result.period > 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Welcome State */
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 border border-slate-200 dark:border-slate-700">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  Ready to find your perfect domain?
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
                  Use the chat to check domain availability and pricing instantly.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Try these examples:
                </p>
                <ul className="text-left space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>"Check if mycompany.com is available"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>"What's the price for startup.io?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>"Check availability for example.com, test.org, and demo.net"</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Powered by Vercel Domains API • Built with Next.js and ChatGPT Apps SDK</p>
        </div>
      </div>
    </div>
  );
}
