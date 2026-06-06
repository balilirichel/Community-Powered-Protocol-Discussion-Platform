import type { ReactNode } from 'react';

interface CardListProps {
  children: ReactNode;
  className?: string;
}

const CardList: React.FC<CardListProps> = ({ children, className = '' }) => (
  <div className={`grid grid-cols-1 gap-4 ${className}`}>{children}</div>
);

export default CardList;
