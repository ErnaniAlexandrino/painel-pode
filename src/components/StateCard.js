import React from 'react';

const StateCard = ({ estado, variant, subtitle, metrics, onViewCandidates }) => {
  return (
    <div className={`consolidated-card consolidated-card--${variant}`}>
      <div className={`consolidated-card__header consolidated-card__header--${variant}`}>
        <div className="consolidated-card__header-text">
          <div className="consolidated-card__header-title">
            {estado} - ELEIÇÕES 2026
          </div>
        </div>
        <div className="consolidated-card__avatar" aria-hidden="true" />
      </div>

      <div className="consolidated-card__body">
        <div className="consolidated-card__subtitle">{subtitle}</div>

        <div className="consolidated-card__metrics">
          {metrics.map((item) => (
            <div className="consolidated-card__metric" key={item.key}>
              <span className="consolidated-card__metric-label">{item.label}</span>
              <span className="consolidated-card__metric-value">{item.value}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className={`consolidated-card__btn consolidated-card__btn--${variant}`}
          onClick={onViewCandidates}
        >
          VISUALIZAR CANDIDATOS
        </button>
      </div>
    </div>
  );
};

export default StateCard;


