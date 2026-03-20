// src/components/dashboard/QuickActions.jsx
import React from 'react';
import { FiShoppingBag, FiHeart, FiLock, FiEye, FiArrowRight } from 'react-icons/fi';

const QuickActions = ({ wishlistCount, onNavigate }) => {
  const actions = [
    {
      icon: FiShoppingBag,
      title: 'Browse Shop',
      description: 'Discover new products',
      path: '/shop',
      gradient: 'from-yellow-600 to-orange-600',
      hoverColor: 'yellow'
    },
    {
      icon: FiHeart,
      title: 'My Wishlist',
      description: `${wishlistCount} items saved`,
      path: '/wishlist',
      gradient: 'from-pink-600 to-red-600',
      hoverColor: 'pink'
    },
    {
      icon: FiLock,
      title: 'Security',
      description: 'Change password',
      path: '/reset-password',
      gradient: 'from-yellow-600 to-orange-600',
      hoverColor: 'yellow'
    },
    {
      icon: FiEye,
      title: 'Track Order',
      description: 'Monitor delivery',
      path: '/track-order',
      gradient: 'from-indigo-600 to-blue-600',
      hoverColor: 'yellow'
    }
  ];

  return (
    <div className="p-6 dashboard-card rounded-xl">
      <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-white">
        <FiShoppingBag className="text-yellow-500" />
        Quick Actions
      </h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onNavigate(action.path)}
            className={`flex items-center justify-between w-full p-4 transition-all border border-gray-700 rounded-lg bg-gray-800/50 hover:border-${action.hoverColor}-600/50 group`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${action.gradient}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">{action.title}</p>
                <p className="text-xs text-gray-400">{action.description}</p>
              </div>
            </div>
            <FiArrowRight className={`w-5 h-5 text-gray-500 transition-colors group-hover:text-${action.hoverColor}-500`} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;