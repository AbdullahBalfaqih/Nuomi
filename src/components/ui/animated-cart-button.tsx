'use client';

import { ShoppingCart } from 'lucide-react';
import './animated-cart-button.css';

interface AnimatedCartButtonProps {
  onClick: () => void;
}

export default function AnimatedCartButton({ onClick }: AnimatedCartButtonProps) {
  return (
    <button className="CartBtn" onClick={onClick}>
      <span className="IconContainer">
        <ShoppingCart className="icon" />
      </span>
      <span className="text">أضف إلى السلة</span>
    </button>
  );
}
