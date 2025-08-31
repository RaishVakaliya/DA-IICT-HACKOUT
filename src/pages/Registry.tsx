import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2 } from "lucide-react";

const Registry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [energyFilter, setEnergyFilter] = useState("all");

  const publicListings = useQuery(api.hydrogen_listings.getPublicListings);

  // Re-map listings to fit 'certificate' structure if needed for UI, or adjust UI directly
  // For now, let's adjust the UI directly to use listing properties

  const statusConfig: { [key: string]: { color: string; icon: string; label: string } } = {
    active: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "✓",
      label: "Active",
    },
    inactive: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: "⏳",
      label: "Inactive",
    },
    sold_out: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: "✗",
      label: "Sold Out",
    },
  };

  const filteredCertificates = publicListings?.filter((cert: any) => {
    const matchesSearch =
      (cert.producerDetails?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.producerDetails?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())) &&
      cert.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || cert.listingStatus === statusFilter;
    const matchesEnergy =
      energyFilter === "all" ||
      cert.energySource.toLowerCase().includes(energyFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesEnergy;
  });

  const totalVolume =
    filteredCertificates?.reduce(
      (sum: any, cert: any) => sum + cert.quantityKg,
      0
    ) || 0;
  const activeCount =
    filteredCertificates?.filter((cert: any) => cert.listingStatus === "active")
      .length || 0;
  const totalHydcoinValue =
    filteredCertificates?.reduce(
      (sum: any, cert: any) => sum + cert.pricePerKg * cert.quantityKg,
      0
    ) || 0;

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
              {publicListings?.length || 0}
            </div>
            <div className="text-gray-600">Total Certificates</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {activeCount}
            </div>
            <div className="text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {totalVolume.toLocaleString()}
            </div>
            <div className="text-gray-600">Total Volume (kg)</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">
              {totalHydcoinValue.toLocaleString()}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="sold_out">Sold Out</option>
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
            Certificates ({filteredCertificates?.length || 0})
          </h2>
          <p className="text-gray-600">
            Browse all green hydrogen production certificates
          </p>
        </div>

        {publicListings === undefined ? (
          <div className="text-center py-8"><Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" /><p className="text-gray-600">Loading certificates...</p></div>
        ) : filteredCertificates?.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No certificates found matching your criteria.</p>
        ) : (
          <div className="space-y-6">
            {filteredCertificates?.map((cert: any) => {
              const statusInfo =
                statusConfig[cert.listingStatus as keyof typeof statusConfig];

              if (!statusInfo) return null; // Fallback for unexpected status

              return (
                <div
                  key={cert._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Certificate Details */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {cert.producerDetails?.companyName || "N/A"}
                            </h3>
                            <p className="text-gray-500">
                              Listing ID: {cert._id}
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
                            <p className="text-gray-900">{cert.producerDetails?.fullname || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Volume:
                            </span>
                            <p className="text-gray-900">{cert.quantityKg} kg</p>
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
                              Price per kg:
                            </span>
                            <p className="text-gray-900">{cert.pricePerKg} Hydcoin</p>
                          </div>
                          {cert.certificationDetails && (<div>
                            <span className="text-sm font-semibold text-gray-700">
                              Certification:
                            </span>
                            <p className="text-gray-900">{cert.certificationDetails}</p>
                          </div>)}
                        </div>
                      </div>

                      {/* Verification Details - Adjust for listings */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          Listing Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Listed On:
                            </span>
                            <p className="text-gray-900">{new Date(cert.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Last Updated:
                            </span>
                            <p className="text-gray-900">{new Date(cert.updatedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-700">
                              Total Value:
                            </span>
                            <p className="text-gray-900">{(cert.pricePerKg * cert.quantityKg).toLocaleString()} Hydcoin</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions/Links - Adjust for listings */}
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          Actions
                        </h4>
                        <div className="space-y-3">
                          <a href={`/purchase/${cert._id}`} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                            <span>🛒</span>
                            Purchase Listing
                          </a>
                          {cert.producerDetails && (
                            <a href={`/profile/${cert.producerDetails._id}`}
                               className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                              <span>👤</span>
                              View Seller Profile
                            </a>
                          )}
                          {cert.listingStatus === "active" && cert.producerDetails && (
                            <a href={`/profile/${cert.producerDetails._id}`} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                              <span>✉️</span>
                              Contact Seller
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
