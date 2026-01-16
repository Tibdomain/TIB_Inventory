import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightCircle, Package, Search, Layers, Users, PieChart, Settings, Clock } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    // Define cards with all their properties
    const actionCards = [
        {
            title: "Inventory Management",
            description: "Add individual components, track stock levels, and manage part information with detailed specifications and documentation.",
            path: "/add-data",
            icon: <Package className="w-12 h-12 text-emerald-600" />,
            stats: "1,245 items tracked",
            action: "Manage Inventory"
        },
        {
            title: "Query & Analytics",
            description: "Search and filter inventory with advanced queries. Generate reports and analyze consumption trends for better decision making.",
            path: "/query-data",
            icon: <Search className="w-12 h-12 text-indigo-600" />,
            stats: "Real-time data access",
            action: "Access Data"
        },
        {
            title: "Assembly Management",
            description: "Create and configure component assemblies, manage build instructions, and track assembly history with full traceability.",
            path: "/assembly",
            icon: <Layers className="w-12 h-12 text-violet-600" />,
            stats: "? assemblies defined",
            action: "Build Assemblies"
        },
        {
            title: "Vendor Management",
            description: "Track suppliers, manage purchase orders, and analyze vendor performance metrics for supply chain optimization.",
            path: "/vendor-management",
            icon: <Users className="w-12 h-12 text-blue-600" />,
            stats: "?",
            action: "Manage Vendors"
        }

    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-inter">
            {/* Header with notification bar */}
            <div className="bg-emerald-600 text-white px-6 py-2 flex justify-between items-center text-sm">
                <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Last system update: Today at 09:32 AM</span>
                </div>
                <div className="flex gap-4">
                    <span>3 pending alerts</span>
                    <span>|</span>
                    <span>System health: Excellent</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
                {/* Header Section with modern styling */}
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
                        Enterprise Platform
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-800 mb-6 tracking-tight">
                        Inventory Management <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Suite</span>
                    </h1>
                    <div className="w-32 h-1.5 bg-gradient-to-r from-emerald-500 to-blue-500 mx-auto mb-8 rounded-full"></div>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Streamline your operations with our comprehensive enterprise inventory solution. 
                        Monitor stock levels, manage assemblies, and optimize your supply chain from a single dashboard.
                    </p>
                </div>

                

                <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Platform Capabilities</h2>

                {/* Cards Container with glass morphism effect */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {actionCards.map((card, index) => (
                        <div 
                            key={index}
                            className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100"
                        >
                            {/* Top color band - varied for each card */}
                            <div className={`h-2 ${
                                index % 6 === 0 ? 'bg-emerald-500' : 
                                index % 6 === 1 ? 'bg-indigo-500' : 
                                index % 6 === 2 ? 'bg-violet-500' : 
                                index % 6 === 3 ? 'bg-blue-500' : 
                                index % 6 === 4 ? 'bg-amber-500' : 
                                'bg-slate-500'
                            }`}></div>
                            
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 rounded-2xl bg-slate-100/80">
                                        {card.icon}
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">{card.stats}</span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-slate-800 mb-3">{card.title}</h3>
                                <p className="text-slate-600 mb-8 leading-relaxed">{card.description}</p>
                                
                                <button 
                                    onClick={() => handleNavigation(card.path)}
                                    className={`flex items-center justify-between w-full py-3 px-5 rounded-xl text-white font-medium transition-all ${
                                        index % 6 === 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 
                                        index % 6 === 1 ? 'bg-indigo-500 hover:bg-indigo-600' : 
                                        index % 6 === 2 ? 'bg-violet-500 hover:bg-violet-600' : 
                                        index % 6 === 3 ? 'bg-blue-500 hover:bg-blue-600' : 
                                        index % 6 === 4 ? 'bg-amber-500 hover:bg-amber-600' : 
                                        'bg-slate-500 hover:bg-slate-600'
                                    }`}
                                >
                                    <span>{card.action}</span>
                                    <ArrowRightCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Footer CTA section */}
                
            </div>
        </div>
    );
};


export default Home;

