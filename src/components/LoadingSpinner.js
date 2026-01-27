import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 100 }) => {
  // Cores confirmadas: Vermelho, Laranja, Laranja Claro, Amarelo
  const colors = ['#FF2E2E', '#FF6B00', '#FF9F00', '#FFC107', '#FF9F00', '#FF6B00'];

  // Novo path para uma pétala mais elegante e simétrica
  // Base no centro (250, 250), Ponta em (250, 130)
  const petalPath = "M250,250 C210,210 210,130 250,130 C290,130 290,210 250,250";

  return (
    <div className="loading-spinner-container" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 500 500"
        className="loading-spinner-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {colors.map((color, index) => (
          <path
            key={index}
            d={petalPath}
            fill={color}
            className="loading-petal"
            style={{
              '--rotation': `${index * 60}deg`,
              '--delay': `${index * 0.15}s`
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export default LoadingSpinner;
