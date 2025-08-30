import { useState } from "react";

const Registry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [energyFilter, setEnergyFilter] = useState("all");

  // Clean, relevant data for HyDit platform
  const certificates = [
    {
      id: "HYDIT-001",
      tokenId: "GH001",
      producer: "EcoHydro Solutions",
      volume: "1,250",
      energySource: "Solar + Wind",
      productionDate: "2024-01-15",
      verificationDate: "2024-01-18",
      status: "VERIFIED",
      verifier: "HyDit Certifiers",
      txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
      ipfsCid: "QmXoYpYz4K9R8vMnPqFe2wQxTr7UvBc6NmHgJkLpOiU8hV",
      creditsMinted: "1,250",
      location: "California, USA",
      carbonIntensity: "2.1 kg CO2/kg H2",
    },
    {
      id: "HYDIT-002",
      tokenId: "GH002",
      producer: "Nordic Green Hydrogen",
      volume: "850",
      energySource: "Hydroelectric",
      productionDate: "2024-01-12",
      verificationDate: "2024-01-16",
      status: "VERIFIED",
      verifier: "HyDit Certifiers",
      txHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef123a",
      ipfsCid: "QmYpZq5K9R8vMnPqFe2wQxTr7UvBc6NmHgJkLpOiU8hW",
      creditsMinted: "850",
      location: "Norway",
      carbonIntensity: "1.8 kg CO2/kg H2",
    },
    {
      id: "HYDIT-003",
      tokenId: "GH003",
      producer: "Australian Solar H2",
      volume: "2,100",
      energySource: "Solar",
      productionDate: "2024-01-10",
      verificationDate: null,
      status: "PENDING",
      verifier: "HyDit Certifiers",
      txHash: null,
      ipfsCid: "QmZqAr6K9R8vMnPqFe2wQxTr7UvBc6NmHgJkLpOiU8hX",
      creditsMinted: "0",
      location: "Queensland, Australia",
      carbonIntensity: "2.3 kg CO2/kg H2",
    },
    {
      id: "HYDIT-004",
      tokenId: "GH004",
      producer: "WindHydro Corp",
      volume: "750",
      energySource: "Wind",
      productionDate: "2024-01-08",
      verificationDate: "2024-01-20",
      status: "VERIFIED",
      verifier: "HyDit Certifiers",
      txHash: "0x3c4d5e6f7890abcdef1234567890abcdef123a2b",
      ipfsCid: "QmArBs7K9R8vMnPqFe2wQxTr7UvBc6NmHgJkLpOiU8hY",
      creditsMinted: "750",
      location: "Texas, USA",
      carbonIntensity: "1.9 kg CO2/kg H2",
    },
  ];

  const statusConfig = {
    VERIFIED: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "✓",
      label: "Verified",
    },
    PENDING: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: "⏳",
      label: "Pending",
    },
    REVOKED: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: "✗",
      label: "Revoked",
    },
  };

  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch =
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.producer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cert.status === statusFilter;
    const matchesEnergy =
      energyFilter === "all" ||
      cert.energySource.toLowerCase().includes(energyFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesEnergy;
  });

  const totalVolume = certificates.reduce(
    (sum, cert) => sum + parseFloat(cert.volume.replace(/[^\d.]/g, "")),
    0
  );
  const verifiedCount = certificates.filter(
    (cert) => cert.status === "VERIFIED"
  ).length;
  const totalCredits = certificates.reduce(
    (sum, cert) => sum + parseFloat(cert.creditsMinted),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Green Hydrogen Registry
            </h1>
            <p className="text-xl md:text-2xl text-cyan-100 mb-8 max-w-3xl mx-auto">
              Transparent public registry of all verified green hydrogen
              production certificates
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-cyan-600 px-8 py-3 rounded-lg font-semibold hover:bg-cyan-50 transition-colors">
                View All Certificates
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-cyan-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {certificates.length}
            </div>
            <div className="text-gray-600">Total Certificates</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {verifiedCount}
            </div>
            <div className="text-gray-600">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Volume (kg)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {totalCredits.toLocaleString()}
            </div>
            <div className="text-gray-600">Credits Minted</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔍</span>
            Search & Filters
          </h2>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by certificate ID or producer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REVOKED">Revoked</option>
              </select>
              <select
                value={energyFilter}
                onChange={(e) => setEnergyFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="solar">Solar</option>
                <option value="wind">Wind</option>
                <option value="hydro">Hydroelectric</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Certificates ({filteredCertificates.length})
          </h2>
          <p className="text-gray-600">
            Browse all green hydrogen production certificates
          </p>
        </div>

        <div className="space-y-6">
          {filteredCertificates.map((cert) => {
            const statusInfo =
              statusConfig[cert.status as keyof typeof statusConfig];

            return (
              <div
                key={cert.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Certificate Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {cert.id}
                          </h3>
                          <p className="text-gray-500">
                            Token ID: {cert.tokenId}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusInfo.color}`}
                        >
                          {statusInfo.icon} {statusInfo.label}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Producer:
                          </span>
                          <p className="text-gray-900">{cert.producer}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Volume:
                          </span>
                          <p className="text-gray-900">{cert.volume} kg</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Energy Source:
                          </span>
                          <p className="text-gray-900">{cert.energySource}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Location:
                          </span>
                          <p className="text-gray-900">{cert.location}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Carbon Intensity:
                          </span>
                          <p className="text-gray-900">
                            {cert.carbonIntensity}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Verification Details */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Verification Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Verifier:
                          </span>
                          <p className="text-gray-900">{cert.verifier}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Production Date:
                          </span>
                          <p className="text-gray-900">{cert.productionDate}</p>
                        </div>
                        {cert.verificationDate && (
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Verified Date:
                            </span>
                            <p className="text-gray-900">
                              {cert.verificationDate}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-semibold text-gray-700">
                            Credits Minted:
                          </span>
                          <p className="text-gray-900">{cert.creditsMinted}</p>
                        </div>
                      </div>
                    </div>

                    {/* Blockchain Links */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Blockchain Proof
                      </h4>
                      <div className="space-y-3">
                        {cert.txHash && (
                          <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            <span>🔗</span>
                            View Transaction
                          </button>
                        )}
                        <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                          <span>📄</span>
                          View Metadata (IPFS)
                        </button>
                        {cert.status === "VERIFIED" && (
                          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            <span>📥</span>
                            Download Certificate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Registry?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The most transparent and trustworthy registry for green hydrogen
              certificates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Blockchain Verified
              </h3>
              <p className="text-gray-600">
                All certificates are immutably stored on the blockchain with
                full transparency
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Third-Party Audited
              </h3>
              <p className="text-gray-600">
                Independent verification by certified environmental auditors
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Global Standards
              </h3>
              <p className="text-gray-600">
                Compliant with international green hydrogen certification
                standards
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registry;
