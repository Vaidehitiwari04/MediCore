import React from 'react';
import './Loader.css';

export default function Loader({ text = 'Loading data…' }) {
  return (
    <div className="loader-wrap">
      <div className="loader-ring" />
      <p className="loader-text">{text}</p>
    </div>
  );
}