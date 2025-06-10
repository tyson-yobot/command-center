import React from 'react';

export default function LeadScraper() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Lead Scraper Tools</h1>
          <p className="text-blue-200 text-lg">Choose your lead generation tool</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Apollo Tool */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Apollo</h3>
              <p className="text-blue-200 mb-6">Professional contact database</p>
              <button 
                onClick={() => window.open('https://apollo.io', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Launch Apollo
              </button>
            </div>
          </div>

          {/* Apify Tool */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Apify</h3>
              <p className="text-blue-200 mb-6">Web scraping automation</p>
              <button 
                onClick={() => window.open('https://apify.com', '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Launch Apify
              </button>
            </div>
          </div>

          {/* PhantomBuster Tool */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">PhantomBuster</h3>
              <p className="text-blue-200 mb-6">LinkedIn automation</p>
              <button 
                onClick={() => window.open('https://phantombuster.com', '_blank')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Launch PhantomBuster
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}