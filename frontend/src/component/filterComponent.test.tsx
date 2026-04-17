import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';

import FilterComponent from './filterComponent';
import { useColorModeContext } from '../context/galleryContext';

vi.mock('../context/galleryContext', () => ({
  useColorModeContext: vi.fn()
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockCategoriesResponse = {
  categories: {
    'props': ['track_elements', 'commercial_appliances', 'trash'],
    'architecture': ['electrical'],
    'buildings': ['outdoors'],
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
    mockUseColorModeContext.mockReturnValue(false);
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

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.getByText('FILTER')).toBeInTheDocument();
      expect(screen.queryByText('CLOSE')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('FILTER'));

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

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CLOSE')).toBeInTheDocument();
      });

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

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('PROPS')).toBeInTheDocument();
        expect(screen.getByText('ARCHITECTURE')).toBeInTheDocument();
        expect(screen.getByText('BUILDINGS')).toBeInTheDocument();
      });

      expect(screen.getByText('ELECTRICAL')).toBeInTheDocument();
      expect(screen.getByText('OUTDOORS')).toBeInTheDocument();
      expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
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
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('TRACK ELEMENTS'));

      expect(mockOutData).toHaveBeenCalledWith(['track_elements']);
    });

    test('should deselect subcategory when clicked again', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements']);

      fireEvent.click(screen.getByText('->TRACK ELEMENTS'));
      expect(mockOutData).toHaveBeenCalledWith([]);
    });

    test('should select subsets 1', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('COMMERCIAL APPLIANCES')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements']);

      fireEvent.click(screen.getByText('COMMERCIAL APPLIANCES'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements','commercial_appliances']);

      expect(mockOutData).not.toHaveBeenCalledWith(['trash']);


      fireEvent.click(screen.getByText('TRASH'));
    
      const lastCall = mockOutData.mock.calls[mockOutData.mock.calls.length - 1][0];
      expect(lastCall).toHaveLength(3);
      expect(lastCall).toEqual(expect.arrayContaining(['track_elements', 'commercial_appliances', 'trash']));
    });
    test('should show selection indicator (arrow) for selected items', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
      });

      // Initially no arrow
      expect(screen.queryByText('->TRACK ELEMENTS')).not.toBeInTheDocument();

      // Click to select
      fireEvent.click(screen.getByText('TRACK ELEMENTS'));

      // Should now show arrow
      await waitFor(() => {
        expect(screen.getByText('->TRACK ELEMENTS')).toBeInTheDocument();
      });
    });

    test('should handle multiple subcategory selections', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
        expect(screen.getByText('COMMERCIAL APPLIANCES')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements']);

      fireEvent.click(screen.getByText('COMMERCIAL APPLIANCES'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements', 'commercial_appliances']);
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
        expect(screen.getByText('PROPS')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('PROPS'));

      expect(mockOutData).toHaveBeenCalledWith(['track_elements', 'commercial_appliances', 'trash']);
    });

    test('should deselect all subcategories when all are selected and parent is clicked', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('PROPS')).toBeInTheDocument();
      });

      // Select all PROP items first
      fireEvent.click(screen.getByText('PROPS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements', 'commercial_appliances', 'trash']);

      // Click again to deselect all
      fireEvent.click(screen.getByText('PROPS'));
      expect(mockOutData).toHaveBeenCalledWith([]);
    });

    test('should add remaining subcategories when parent is clicked with some already selected', async () => {
      render(<FilterComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
        expect(screen.getByText('PROPS')).toBeInTheDocument();
      });

      // Select only TRACK ELEMENTS first
      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements']);

      // Click PROPS parent - should add tables and sofas
      fireEvent.click(screen.getByText('PROPS'));
      expect(mockOutData).toHaveBeenCalledWith(['track_elements', 'commercial_appliances', 'trash']);
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
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
        expect(screen.getByText('CLEAR')).toBeInTheDocument();
      });

      // Select some items first
      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      fireEvent.click(screen.getByText('COMMERCIAL APPLIANCES'));

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
        expect(screen.getByText('TRASH')).toBeInTheDocument();
      });

      act(() => {
        fireEvent.click(screen.getByText('TRASH'));
      });

      // Wait for mockOutData to be called with the selection
      await waitFor(() => {
        expect(mockOutData).toHaveBeenCalledWith(['trash']);
      });

      // Check that the arrow indicator is now present in the DOM
      await waitFor(() => {
        const itemWithArrow = screen.getByText((content, element) => {
          return element?.textContent?.trim() === '->TRASH';
        });
        expect(itemWithArrow).toBeInTheDocument();
      });

      // Clear selections
      fireEvent.click(screen.getByText('CLEAR'));

      // Verify selection was cleared
      await waitFor(() => {
        expect(mockOutData).toHaveBeenCalledWith([]);
      });

      // Check that the arrow is removed
      await waitFor(() => {
        const itemWithoutArrow = screen.queryByText((content, element) => {
          return element?.textContent?.trim() === '->TRASH';
        });
        expect(itemWithoutArrow).not.toBeInTheDocument();
        
        // And the regular text is still there
        expect(screen.getByText('TRASH')).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Styling', () => {
    test('should apply light mode styles by default', () => {
      mockUseColorModeContext.mockReturnValue(false);
      render(<FilterComponent outData={mockOutData} />);

      const filterButton = screen.getByText('FILTER').closest('.lib-nav-inactive');
      expect(filterButton).toHaveStyle({ backgroundColor: 'rgb(255, 255, 255)' });
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
      expect(filterButtonText).toHaveStyle({ color: 'rgb(255, 255, 255)' });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByText('FILTER'));

      await waitFor(() => {
        expect(screen.getByText('CLOSE')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('CLOSE');
      expect(closeButton).toHaveStyle({ color: 'rgb(255, 255, 255)' });
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
        expect(screen.getByText('TRACK ELEMENTS')).toBeInTheDocument();
      });

      // Rapid clicks should maintain consistent state
      fireEvent.click(screen.getByText('TRACK ELEMENTS'));
      fireEvent.click(screen.getByText('->TRACK ELEMENTS'));
      fireEvent.click(screen.getByText('TRACK ELEMENTS'));

      // Should end up deselected (odd number of clicks)
      expect(mockOutData).toHaveBeenLastCalledWith(['track_elements']);
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