import { useState } from "react";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("producer");

  const stats = [
    { label: "Credits Issued", value: "2.4M", trend: "+23%" },
    { label: "Verified Producers", value: "156", trend: "+12%" },
    { label: "CO₂ Offset (tons)", value: "89K", trend: "+45%" },
    { label: "Total Value Locked", value: "$12.3M", trend: "+67%" }
  ];

  const features = [
    {
      icon: "🛡️",
      title: "Verifiable Certificates",
      description: "Blockchain-based certificates ensure complete traceability and tamper-proof records of green hydrogen production."
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Comprehensive dashboards for producers, regulators, and buyers with live market data and compliance tracking."
    },
    {
      icon: "✅",
      title: "Automated Compliance",
      description: "Smart contracts handle verification, retirement, and regulatory reporting automatically."
    },
    {
      icon: "🌍",
      title: "Global Registry",
      description: "Unified platform for international green hydrogen credit trading and carbon accounting."
    }
  ];

  const userFlows = {
    producer: [
      "Submit production claim with meter data",
      "Upload certificates and lab reports to IPFS",
      "Wait for certifier verification",
      "Receive minted credits in wallet",
      "Trade or retire credits as needed"
    ],
    certifier: [
      "Review submitted production claims",
      "Verify documents and meter readings",
      "Sign EIP-712 attestation on-chain",
      "Monitor certificate lifecycle",
      "Audit compliance and quality"
    ],
    buyer: [
      "Browse verified credit marketplace",
      "Purchase credits for carbon offsetting",
      "Track credit provenance and history",
      "Retire credits for compliance",
      "Generate audit reports and proofs"
    ]
  };

  const marketplaceListings = [
    {
      id: "GH-001",
      producer: "Nordic Energy AS",
      location: "Norway",
      volume: "500 kg H₂",
      price: "$8.50/kg",
      certification: "HyDit Verified",
      renewable: "Wind Energy",
      available: 450,
      total: 500,
      verified: true
    },
    {
      id: "GH-002", 
      producer: "SolarH2 Corp",
      location: "Germany",
      volume: "1,200 kg H₂",
      price: "$7.80/kg",
      certification: "HyDit Verified",
      renewable: "Solar PV",
      available: 1200,
      total: 1200,
      verified: true
    },
    {
      id: "GH-003",
      producer: "Green Future Ltd",
      location: "Denmark",
      volume: "800 kg H₂", 
      price: "$9.20/kg",
      certification: "HyDit Verified",
      renewable: "Offshore Wind",
      available: 320,
      total: 800,
      verified: true
    }
  ];

  const recentCertificates = [
    {
      id: "CERT-2024-001",
      producer: "EcoH2 Solutions",
      productionDate: "2024-01-15",
      volume: "2,500 kg H₂",
      location: "California, USA",
      energySource: "Solar + Battery",
      verifier: "HyDit Certifiers",
      status: "Active",
      carbonOffset: "12.5 tons CO₂"
    },
    {
      id: "CERT-2024-002",
      producer: "Alpine Hydrogen",
      productionDate: "2024-01-12",
      volume: "1,800 kg H₂", 
      location: "Switzerland",
      energySource: "Hydroelectric",
      verifier: "HyDit Certifiers",
      status: "Partially Retired",
      carbonOffset: "9.0 tons CO₂"
    },
    {
      id: "CERT-2024-003",
      producer: "Aussie Green H2",
      productionDate: "2024-01-10",
      volume: "3,200 kg H₂",
      location: "Western Australia",
      energySource: "Wind Farm",
      verifier: "HyDit Certifiers",
      status: "Active",
      carbonOffset: "16.0 tons CO₂"
    }
  ];

  const additionalFeatures = [
    {
      icon: "⏱️",
      title: "Real-time Monitoring",
      description: "24/7 monitoring of production facilities with IoT sensors and automated reporting systems."
    },
    {
      icon: "🔒",
      title: "Enterprise Security",
      description: "Bank-grade encryption, multi-signature wallets, and comprehensive audit trails for all transactions."
    },
    {
      icon: "🏆",
      title: "International Standards",
      description: "Compliant with ISO 14064, GHG Protocol, and emerging hydrogen certification standards."
    },
    {
      icon: "💰",
      title: "Flexible Pricing",
      description: "Dynamic pricing models, bulk discounts, and escrow services for large institutional buyers."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors mb-6">
              🚀 Now Live on Polygon Testnet
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blockchain-Based
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Green Hydrogen Credits
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Issue, track, and retire verifiable green hydrogen credits with complete transparency, 
              auditability, and tamper-resistance on the blockchain.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                  📈 {stat.trend}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Production-Ready Infrastructure for 
              <span className="text-blue-600"> Green Energy</span>
            </h2>
            <p className="text-xl text-gray-600">
              Built with enterprise-grade security, scalability, and compliance in mind. 
              Every credit is traceable to its production source.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Flows Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Streamlined Workflows for Every User
            </h2>
            <p className="text-xl text-gray-600">
              From production to retirement, every step is transparent, verifiable, and efficient.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex justify-center mb-12">
              <div className="inline-flex rounded-lg bg-white p-1 shadow-lg">
                {Object.keys(userFlows).map((role) => (
                  <button
                    key={role}
                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                      activeTab === role 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={() => setActiveTab(role)}
                  >
                    👥 {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Flow Steps */}
            <div className="space-y-4">
              {userFlows[activeTab as keyof typeof userFlows].map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-white shadow-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="flex-1 text-gray-700">{step}</span>
                  <div className="text-blue-600">✅</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🛒 Live Credit Marketplace
            </h2>
            <p className="text-xl text-gray-600">
              Browse and purchase verified green hydrogen credits from certified producers worldwide.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {marketplaceListings.map((listing, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-mono">
                      {listing.id}
                    </div>
                    {listing.verified && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        ✅ Verified
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.producer}</h3>
                  <p className="text-gray-600 text-sm mb-4">{listing.location}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volume:</span>
                      <span className="font-semibold">{listing.volume}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold text-blue-600">{listing.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-semibold">{listing.available}/{listing.total} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Energy Source:</span>
                      <span className="text-sm">{listing.renewable}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Certified by:</span>
                      <span className="text-sm">{listing.certification}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300">
                    🛒 Purchase Credits
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
              🔍 View All Listings
            </button>
          </div>
        </div>
      </section>

      {/* Registry Section */}
      <section className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              🗄️ Public Certificate Registry
            </h2>
            <p className="text-xl text-gray-600">
              Transparent record of all verified green hydrogen certificates with full traceability and audit trails.
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {recentCertificates.map((cert, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <div className="grid gap-4 md:grid-cols-6 items-center">
                  <div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-mono mb-1">
                      {cert.id}
                    </div>
                    <p className="text-sm text-gray-600">{cert.productionDate}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cert.producer}</p>
                    <p className="text-sm text-gray-600">{cert.location}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cert.volume}</p>
                    <p className="text-sm text-gray-600">{cert.carbonOffset}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700">{cert.energySource}</p>
                    <p className="text-xs text-gray-600">Verified by {cert.verifier}</p>
                  </div>
                  <div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      cert.status === "Active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-orange-100 text-orange-800"
                    }`}>
                      {cert.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-sm transition-colors duration-300">
                      👁️ View
                    </button>
                    <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300">
                      📥
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
              🔍 Search Registry
            </button>
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Advanced Platform Features
            </h2>
            <p className="text-xl text-gray-600">
              Enterprise-grade tools and integrations for professional green hydrogen credit management.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="documentation" className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              📚 Documentation & Resources
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              Comprehensive guides, API documentation, and technical resources for developers and integrators.
            </p>
            
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
                <p className="text-gray-600 text-sm mb-4">Quick start guide for producers and buyers</p>
                <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300">
                  📖 User Guide
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">API Reference</h3>
                <p className="text-gray-600 text-sm mb-4">Complete REST API and GraphQL documentation</p>
                <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300">
                  🗄️ API Docs
                </button>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Contracts</h3>
                <p className="text-gray-600 text-sm mb-4">Solidity contracts and integration guides</p>
                <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-300">
                  🛡️ Contract Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Trading Green Hydrogen Credits?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join the future of carbon accounting with blockchain-verified green hydrogen credits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 hover:bg-white/90 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                Get Started →
              </button>
              <button className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;