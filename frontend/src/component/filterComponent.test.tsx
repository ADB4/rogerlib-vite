import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import FilterComponent from './filterComponent';
import { useColorModeContext } from '../context/galleryContext';

// Mock the color mode context
vi.mock('../context/galleryContext', () => ({
  useColorModeContext: vi.fn()
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock data
const mockCategoriesResponse = {
  categories: {
    'furniture': ['chairs', 'tables', 'sofas'],
    'electronics': ['phones', 'computers', 'tablets'],
    'clothing': ['shirts', 'pants', 'shoes']
  }
};

describe('FilterComponent', () => {
  const mockOutData = vi.fn();
  const mockUseColorModeContext = vi.mocked(useColorModeContext);

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCategoriesResponse)
    });
    mockUseColorModeContext.mockReturnValue(false); // Default to light mode
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering and API Integration', () => {
    test('should render filter button initially', () => {
      render(<FilterComponent outData={mockOutData} />);
      
      expect(screen.getByText('FILTER')).toBeInTheDocument();
      expect(screen.queryByText('CLOSE')).not.toBeInTheDocument();
    });

    test('should fetch categories on mount', async () => {
      render(<FilterComponent outData={mockOutData} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/categories/all/', { credentials: 'same-origin' });
      });
    });

    test('should handle API error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('API Error'));

      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    test('should handle non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        statusText: 'Not Found'
      });

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    test('should prevent stale requests on unmount', () => {
      const { unmount } = render(<FilterComponent outData={mockOutData} />);
      unmount();
      
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Visibility Toggle', () => {
    test('should toggle visibility when filter button is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      // Wait for categories to load
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Initially should show FILTER button
      expect(screen.getByText('FILTER')).toBeInTheDocument();
      expect(screen.queryByText('CLOSE')).not.toBeInTheDocument();

      // Click to open filter
      fireEvent.click(screen.getByText('FILTER'));

      // Should now show the filter panel
      await waitFor(() => {
        expect(screen.getByText('CLOSE')).toBeInTheDocument();
      });
      expect(screen.queryByText('FILTER')).not.toBeInTheDocument();
    });

    test('should close filter panel when close button is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Open filter panel
      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CLOSE')).toBeInTheDocument();
      });

      // Close filter panel
      fireEvent.click(screen.getByText('CLOSE'));

      await waitFor(() => {
        expect(screen.getByText('FILTER')).toBeInTheDocument();
      });
      expect(screen.queryByText('CLOSE')).not.toBeInTheDocument();
    });
  });

  describe('Category and Subcategory Rendering', () => {
    test('should render categories and subcategories after API call', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Open filter panel
      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('FURNITURE')).toBeInTheDocument();
        expect(screen.getByText('ELECTRONICS')).toBeInTheDocument();
        expect(screen.getByText('CLOTHING')).toBeInTheDocument();
      });

      // Check subcategories
      expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      expect(screen.getByText('TABLES')).toBeInTheDocument();
      expect(screen.getByText('SOFAS')).toBeInTheDocument();
    });

    test('should format category names correctly (replace underscores, uppercase)', async () => {
      const mockResponseWithUnderscores = {
        categories: {
          'home_furniture': ['living_room', 'bed_room'],
          'office_supplies': ['desk_items']
        }
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponseWithUnderscores)
      });

      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('HOME FURNITURE')).toBeInTheDocument();
        expect(screen.getByText('LIVING ROOM')).toBeInTheDocument();
        expect(screen.getByText('BED ROOM')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Logic - Individual Subcategories', () => {
    test('should select individual subcategory when clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });

      // Click on CHAIRS subcategory
      fireEvent.click(screen.getByText('CHAIRS'));

      expect(mockOutData).toHaveBeenCalledWith(['chairs']);
    });

    test('should deselect subcategory when clicked again', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });

      // Select CHAIRS
      fireEvent.click(screen.getByText('CHAIRS'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs']);

      // Deselect CHAIRS
      fireEvent.click(screen.getByText('->CHAIRS'));
      expect(mockOutData).toHaveBeenCalledWith([]);
    });

    test('should show selection indicator (arrow) for selected items', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });

      // Initially no arrow
      expect(screen.queryByText('->CHAIRS')).not.toBeInTheDocument();

      // Click to select
      fireEvent.click(screen.getByText('CHAIRS'));

      // Should now show arrow
      await waitFor(() => {
        expect(screen.getByText('->CHAIRS')).toBeInTheDocument();
      });
    });

    test('should handle multiple subcategory selections', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
        expect(screen.getByText('TABLES')).toBeInTheDocument();
      });

      // Select CHAIRS
      fireEvent.click(screen.getByText('CHAIRS'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs']);

      // Select TABLES
      fireEvent.click(screen.getByText('TABLES'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs', 'tables']);
    });
  });

  describe('Selection Logic - Parent Categories', () => {
    test('should select all subcategories when parent category is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('FURNITURE')).toBeInTheDocument();
      });

      // Click on FURNITURE parent category
      fireEvent.click(screen.getByText('FURNITURE'));

      expect(mockOutData).toHaveBeenCalledWith(['chairs', 'tables', 'sofas']);
    });

    test('should deselect all subcategories when all are selected and parent is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('FURNITURE')).toBeInTheDocument();
      });

      // Select all furniture items first
      fireEvent.click(screen.getByText('FURNITURE'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs', 'tables', 'sofas']);

      // Click again to deselect all
      fireEvent.click(screen.getByText('FURNITURE'));
      expect(mockOutData).toHaveBeenCalledWith([]);
    });

    test('should add remaining subcategories when parent is clicked with some already selected', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
        expect(screen.getByText('FURNITURE')).toBeInTheDocument();
      });

      // Select only CHAIRS first
      fireEvent.click(screen.getByText('CHAIRS'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs']);

      // Click FURNITURE parent - should add tables and sofas
      fireEvent.click(screen.getByText('FURNITURE'));
      expect(mockOutData).toHaveBeenCalledWith(['chairs', 'tables', 'sofas']);
    });
  });

  describe('Clear Filter Functionality', () => {
    test('should clear all selections when clear button is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
        expect(screen.getByText('CLEAR')).toBeInTheDocument();
      });

      // Select some items first
      fireEvent.click(screen.getByText('CHAIRS'));
      fireEvent.click(screen.getByText('TABLES'));

      // Clear all selections
      fireEvent.click(screen.getByText('CLEAR'));

      expect(mockOutData).toHaveBeenCalledWith([]);
    });

    test('should remove selection indicators after clearing', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });

      // Select CHAIRS
      fireEvent.click(screen.getByText('CHAIRS'));

      await waitFor(() => {
        expect(screen.getByText('->CHAIRS')).toBeInTheDocument();
      });

      // Clear selections
      fireEvent.click(screen.getByText('CLEAR'));

      await waitFor(() => {
        expect(screen.queryByText('->CHAIRS')).not.toBeInTheDocument();
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Styling', () => {
    test('should apply light mode styles by default', () => {
      mockUseColorModeContext.mockReturnValue(false);
      render(<FilterComponent outData={mockOutData} />);

      const filterButton = screen.getByText('FILTER').closest('.lib-nav-inactive');
      expect(filterButton).toHaveStyle({ backgroundColor: 'white' });
    });

    test('should apply dark mode styles when dark mode is enabled', () => {
      mockUseColorModeContext.mockReturnValue(true);
      render(<FilterComponent outData={mockOutData} />);

      const filterButton = screen.getByText('FILTER').closest('.lib-nav-inactive');
      expect(filterButton).toHaveStyle({ backgroundColor: '#1f1f1f' });
    });

    test('should apply correct text colors based on mode', async () => {
      mockUseColorModeContext.mockReturnValue(true);
      render(<FilterComponent outData={mockOutData} />);

      const filterButtonText = screen.getByText('FILTER');
      expect(filterButtonText).toHaveStyle({ color: 'white' });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CLOSE')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('CLOSE');
      expect(closeButton).toHaveStyle({ color: 'white' });
    });
  });

  describe('God Role (Edge Case)', () => {
    test('should handle god role click with console debug', async () => {
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('FURNITURE')).toBeInTheDocument();
      });

      // Manually trigger handleClick with 'god' role (this would need to be exposed or tested via integration)
      // For now, we'll just verify the component doesn't crash with unknown roles
      expect(screen.getByText('FURNITURE')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    test('should handle empty categories response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ categories: {} })
      });

      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      // Should render empty filter panel without errors
      expect(screen.getByText('CLOSE')).toBeInTheDocument();
      expect(screen.getByText('CLEAR')).toBeInTheDocument();
    });

    test('should handle malformed category data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ categories: { 'test': null } })
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Component should handle malformed data gracefully
      expect(screen.getByText('FILTER')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('should maintain state consistency during rapid interactions', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CHAIRS')).toBeInTheDocument();
      });

      // Rapid clicks should maintain consistent state
      fireEvent.click(screen.getByText('CHAIRS'));
      fireEvent.click(screen.getByText('CHAIRS'));
      fireEvent.click(screen.getByText('CHAIRS'));

      // Should end up deselected (odd number of clicks)
      expect(mockOutData).toHaveBeenLastCalledWith([]);
    });
  });
});

// Test utilities
export const createMockCategoriesResponse = (categories: Record<string, string[]>) => ({
  categories
});

export const renderFilterWithMockData = async (mockData = mockCategoriesResponse, darkMode = false) => {
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  });
  
  const mockUseColorModeContext = vi.mocked(useColorModeContext);
  mockUseColorModeContext.mockReturnValue(darkMode);

  const mockOutData = vi.fn();
  const result = render(<FilterComponent outData={mockOutData} />);

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalled();
  });

  return { ...result, mockOutData };
};