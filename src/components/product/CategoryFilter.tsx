'use client';

import { motion } from 'framer-motion';
import { CATEGORIES, CategoryId } from '@/lib/constants';

interface CategoryFilterProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex space-x-2 md:flex-wrap md:space-x-0 md:gap-2">
        {/* All category button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectCategory('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === 'all'
              ? 'bg-coffee-500 text-white shadow-lg shadow-coffee-500/25'
              : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200 hover:text-coffee-700'
          }`}
        >
          Бүгд
        </motion.button>
        
        {/* Category buttons */}
        {CATEGORIES.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              selectedCategory === category.id
                ? 'bg-coffee-500 text-white shadow-lg shadow-coffee-500/25'
                : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200 hover:text-coffee-700'
            }`}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
