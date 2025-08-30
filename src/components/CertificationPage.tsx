import React from "react";

const CertificationPage = () => {
  const certificationPrograms = [
    {
      id: 1,
      title: "Green Hydrogen Producer",
      description: "Certification for companies producing green hydrogen using renewable energy",
      duration: "6-8 weeks",
      cost: "$5,000",
      level: "Advanced",
      requirements: ["Renewable energy source", "Carbon footprint < 2kg CO2/kg H2", "Third-party verification"],
      image: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Carbon Offset Verifier",
      description: "Become a certified verifier for carbon offset projects worldwide",
      duration: "4-6 weeks",
      cost: "$3,500",
      level: "Intermediate",
      requirements: ["Environmental science background", "Audit experience", "Regulatory compliance"],
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Sustainable Aviation Fuel Auditor",
      description: "Specialized certification for SAF production and distribution auditing",
      duration: "8-10 weeks",
      cost: "$7,500",
      level: "Expert",
      requirements: ["Aviation industry experience", "Chemical engineering background", "International standards knowledge"],
      image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      title: "Renewable Energy Certifier",
      description: "Certify renewable energy projects and issue RECs",
      duration: "5-7 weeks",
      cost: "$4,200",
      level: "Intermediate",
      requirements: ["Energy sector experience", "Technical assessment skills", "Regulatory knowledge"],
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop"
    }
  ];

  const benefits = [
    {
      icon: "🏆",
      title: "Industry Recognition",
      description: "Gain credibility and recognition in the environmental certification industry"
    },
    {
      icon: "💼",
      title: "Career Advancement",
      description: "Open doors to new opportunities and higher positions in sustainability"
    },
    {
      icon: "🌍",
      title: "Global Impact",
      description: "Contribute to global sustainability efforts and climate action"
    },
    {
      icon: "💰",
      title: "Higher Earnings",
      description: "Certified professionals typically earn 20-30% more than non-certified peers"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional Certification
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Become a certified environmental professional and lead the transition to a sustainable future
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                View Programs
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
            <div className="text-gray-600">Certified Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">15+</div>
            <div className="text-gray-600">Certification Programs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">95%</div>
            <div className="text-gray-600">Pass Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Countries Served</div>
          </div>
        </div>
      </div>

      {/* Certification Programs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Certifications</h2>
          <p className="text-gray-600">Choose from our comprehensive range of environmental certification programs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {certificationPrograms.map((program) => (
            <div key={program.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="relative">
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {program.level}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{program.title}</h3>
                <p className="text-gray-600 mb-4">{program.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost:</span>
                    <span className="font-bold text-xl text-blue-600">{program.cost}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {program.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <span className="text-blue-500 mr-2">•</span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits of Certification</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover how professional certification can transform your career and impact
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Process Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Certification Process</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simple steps to achieve your professional certification
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply</h3>
            <p className="text-gray-600">Submit your application and required documents</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Study</h3>
            <p className="text-gray-600">Access our comprehensive study materials</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Exam</h3>
            <p className="text-gray-600">Take the certification examination</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">4</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Certify</h3>
            <p className="text-gray-600">Receive your professional certification</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificationPage;
