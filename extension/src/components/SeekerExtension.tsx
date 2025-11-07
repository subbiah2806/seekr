/**
 * SeekerExtension Component
 * Main floating button and expandable side pane
 */

import { useState } from 'react';
import App from '../App';

export function SeekerExtension() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 2147483647, // Maximum z-index value
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 'bold',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        {isOpen ? '✕' : 'S'}
      </button>

      {/* Expandable Right Pane */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            right: '0',
            width: '600px',
            height: '100vh',
            backgroundColor: 'white',
            boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.1)',
            zIndex: 2147483646, // Just below button
            overflowY: 'auto',
            animation: 'seekr-slideIn 0.3s ease-out',
          }}
        >
          <App />
        </div>
      )}

      {/* Add animation keyframes */}
      <style>
        {`
          @keyframes seekr-slideIn {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </>
  );
}
