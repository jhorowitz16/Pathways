import React, { useState, useEffect } from 'react';

const DriverDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      backgroundColor: '#0f0f23',
      minHeight: '100vh',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: '#1a1a2e',
        padding: '24px',
        borderRadius: '0 16px 16px 0'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#4f46e5',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px'
            }}>🚛</div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Delivery drivers</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#9ca3af',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Last-mile optimization
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { icon: '🏠', label: 'Dashboard', active: true },
                { icon: '🚛', label: 'Deliveries' },
                { icon: '📍', label: 'Deliveries' },
                { icon: '👥', label: 'Customers' },
                { icon: '📈', label: 'Rankings' },
                { icon: '📊', label: 'LeaderMetric' },
                { icon: '📋', label: 'History' },
                { icon: '⚙️', label: 'Settings' }
              ].map((item, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: item.active ? '#ffffff' : '#9ca3af',
                    backgroundColor: item.active ? '#4f46e5' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}>
                    <span style={{ fontSize: '16px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '24px' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: '#1a1a2e',
            padding: '12px 20px',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>Rose Dillan</span>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              RD
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 120px)' }}>
          {/* Map Section */}
          <div style={{ flex: 1 }}>
            <div style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '24px',
              height: '70%',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 3D Map Simulation */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #0f0f23 0%, #1a1a2e 50%, #2d2d4a 100%)',
                borderRadius: '12px',
                position: 'relative',
                perspective: '1000px'
              }}>
                {/* Grid Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                  transform: 'rotateX(60deg) translateZ(-50px)',
                  transformOrigin: 'center center'
                }} />

                {/* Delivery Points */}
                {[
                  { top: '20%', left: '25%', color: '#10b981', label: 'Large and Bulky', status: 'completed' },
                  { top: '35%', left: '45%', color: '#f59e0b', label: 'Large and Bulky', status: 'in-progress' },
                  { top: '55%', left: '30%', color: '#ef4444', label: 'Large and Bulky', status: 'pending' },
                  { top: '40%', left: '65%', color: '#8b5cf6', label: 'Live and Bulky', status: 'completed' },
                  { top: '65%', left: '55%', color: '#06b6d4', label: 'Overnight', status: 'in-progress' }
                ].map((point, index) => (
                  <div key={index} style={{
                    position: 'absolute',
                    top: point.top,
                    left: point.left,
                    transform: 'translate(-50%, -50%)'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: point.color,
                      borderRadius: '50%',
                      boxShadow: `0 0 20px ${point.color}`,
                      animation: 'pulse 2s infinite'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '-40px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(26, 26, 46, 0.95)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      whiteSpace: 'nowrap',
                      border: '1px solid rgba(79, 70, 229, 0.3)'
                    }}>
                      {point.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Controls */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <button style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(26, 26, 46, 0.8)',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>+</button>
                <button style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(26, 26, 46, 0.8)',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>-</button>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginTop: '20px',
              height: '25%'
            }}>
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                flex: 1
              }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 8px 0' }}>Optimized Routes</h3>
                <p style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>$12300</p>
                <p style={{ fontSize: '12px', color: '#10b981', margin: 0 }}>+12% increase from previous time frame</p>
              </div>
              
              <div style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px',
                flex: 1
              }}>
                <h3 style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 16px 0' }}>Revenue/KM</h3>
                <div style={{ height: '80px', position: 'relative' }}>
                  {/* Simple Chart Bars */}
                  <div style={{ display: 'flex', alignItems: 'end', height: '100%', gap: '4px' }}>
                    {[0.6, 0.8, 0.4, 0.9, 0.7, 0.5, 0.8, 0.6, 0.9, 0.7].map((height, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: `${height * 100}%`,
                        backgroundColor: i === 4 ? '#4f46e5' : '#374151',
                        borderRadius: '2px'
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Earnings Cards */}
            {[
              { label: 'Pending', amount: '$24.01', change: '+12%', color: '#10b981' },
              { label: 'Pending', amount: '$39791', change: '+8.1%', color: '#10b981' },
              { label: 'Pending', amount: '$78130', change: '+5.2%', color: '#10b981' }
            ].map((card, index) => (
              <div key={index} style={{
                backgroundColor: '#1a1a2e',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>{card.label}</span>
                  <span style={{ fontSize: '12px', color: card.color }}>{card.change}</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{card.amount}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>vs previous period</div>
                <button style={{
                  width: '100%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginTop: '12px',
                  cursor: 'pointer'
                }}>
                  {index === 0 ? 'COLLECT' : 'VIEW MORE'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;