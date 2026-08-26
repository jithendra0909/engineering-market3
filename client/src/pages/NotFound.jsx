import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, Store, ArrowLeft, HelpCircle } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <Helmet>
        <title>Page Not Found — Engineering Market</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you are looking for does not exist or has been removed on Engineering Market." />
      </Helmet>

      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 border border-[#EAEAF0] shadow-sm">
        {/* Visual Icon Badge */}
        <div className="w-16 h-16 bg-[#F3EEFC] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-8 h-8 text-[#6D3FD6]" />
        </div>

        <span className="inline-block px-3 py-1 bg-[#F3EEFC] text-[#6D3FD6] text-xs font-bold rounded-full mb-3 tracking-wide uppercase">
          404 Error
        </span>

        <h1 className="text-2xl font-black text-[#14121F] mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
          The link you followed may be broken, expired, or the item might have been removed by the seller.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[#EAEAF0] text-sm font-semibold text-[#14121F] hover:bg-[#F7F7FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D3FD6] text-sm font-semibold text-white hover:bg-[#4C2A96] transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" /> Home
          </Link>

          <Link
            to="/general-market"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F3EEFC] text-sm font-semibold text-[#6D3FD6] hover:bg-[#EAE1FB] transition-colors"
          >
            <Store className="w-4 h-4" /> General Market
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
