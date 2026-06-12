import React from 'react';
import { getTagColor } from '../services/api';

export default function Tag({ label }) {
  const cls = getTagColor(label);
  return <span className={`tag ${cls}`}>{label}</span>;
}
