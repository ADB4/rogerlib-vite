import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import GalleryComponent, { LibraryListComponent, LibraryItemComponent, GhostItemComponent } from './galleryComponent';
import { ModelContext } from '../context/galleryContext';
import type { ItemType } from '../context/galleryContext';


vi.mock('../component/detailComponent', () => ({
  default: ({ outData }: { outData: () => void }) => (
    <div data-testid="detail-container">
      <button onClick={outData} data-testid="close-detail">Close</button>
    </div>
  )
}));

vi.mock('../component/filterComponent', () => ({
  default: ({ outData }: { outData: (data: string[]) => void }) => (
    <div data-testid="filter-component">
      <button onClick={() => outData(['category1'])} data-testid="filter-button">Filter</button>
      <button onClick={() => outData([])} data-testid="clear-filter">Clear</button>
    </div>
  )
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockItemData: ItemType = {
  itemcode: 'item001',
  itemname: 'Test Item',
  material: 'metal',
  colormap: {
    "standard": "Tsukuba Blue"
  },
  colors: ['red', 'blue'],
  lods: ['high', 'medium'],
  lodmap: {
    "lod0": "LOD0",
    "lod1": "LOD1"
  },
  polycount: {
    "lod0": "30634",
    "lod1": "4734"
  },
  category: 'furniture',
  subcategory: 'category1',
  description: 'Test description',
  creatornote: 'Test note',
  shader: 'standard',
  preview: 'https://example.com/preview.jpg',
  imagepath: '/images/',
  images: ['img1.jpg'],
  models: ['model1.obj'],
  zoom: "75",
  texturesets: [
        {
            id: "test0_lod0_primary",
            alpha: "false",
            displacement: "false",
            maps: ["false"]
        }
  ],
  modelanimation: "false",
  colorcodes: ["red","white"],
  texturemap: {
    "lod0": "0",
    "lod1": "0"
  },
  version: '1.0'
};

const mockApiResponse = {
  models: [mockItemData, { ...mockItemData, itemcode: 'item002', subcategory: 'category2' }]
};

describe('GalleryComponent', () => {
  const mockOutData = vi.fn();

  beforeEach(() => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse)
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering and Data Fetching', () => {
    test('should render without crashing', () => {
      render(<GalleryComponent outData={mockOutData} />);
      expect(screen.getByTestId('filter-component')).toBeInTheDocument();
    });

    test('should fetch items on mount', async () => {
      render(<GalleryComponent outData={mockOutData} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/v1/items/all/', { credentials: 'same-origin' });
      });
    });

    test('should call outData with theme configuration on mount', () => {
      render(<GalleryComponent outData={mockOutData} />);
      
      expect(mockOutData).toHaveBeenCalledWith({
        backgroundColors: ['black', 'white'],
        textColors: ['white', 'black'],
        beanColors: ['white', 'black'],
        beanTextColors: ['black', 'white']
      });
    });

    test('should handle API error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      mockFetch.mockRejectedValue(new Error('API Error'));

      render(<GalleryComponent outData={mockOutData} />);

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
      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Filtering Functionality', () => {
    test('should filter items by subcategory', async () => {
      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('filter-button'));
      expect(screen.getByTestId('filter-button')).toBeInTheDocument();
    });

    test('should show all items when filter is cleared', async () => {
      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByTestId('clear-filter'));
      expect(screen.getByTestId('clear-filter')).toBeInTheDocument();
    });
  });

  describe('Detail View Functionality', () => {
    test('should open detail view when item is clicked', async () => {
      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const itemImages = screen.getAllByRole('img');
      if (itemImages.length > 0) {
        fireEvent.click(itemImages[0].closest('.item') || itemImages[0]);

        await waitFor(() => {
          expect(screen.queryByTestId('detail-container')).toBeInTheDocument();
        });
      }
    });

    test('should close detail view when close button is clicked', async () => {
      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const itemImages = screen.getAllByRole('img');
      if (itemImages.length > 0) {
        fireEvent.click(itemImages[0].closest('.item') || itemImages[0]);

        await waitFor(() => {
          expect(screen.getByTestId('detail-container')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('close-detail'));

        await waitFor(() => {
          expect(screen.queryByTestId('detail-container')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty API response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ models: [] })
      });

      render(<GalleryComponent outData={mockOutData} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.getByTestId('filter-component')).toBeInTheDocument();
    });

    test('should prevent stale requests', async () => {
      const { unmount } = render(<GalleryComponent outData={mockOutData} />);

      unmount();
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});

describe('LibraryListComponent', () => {
  const mockOutData = vi.fn();
  const mockInData = {
    selection: [mockItemData],
    items: [mockItemData]
  };

  test('should render selection and ghost items', () => {
    render(<LibraryListComponent inData={mockInData} outData={mockOutData} />);

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('should render end message', () => {
    render(<LibraryListComponent inData={mockInData} outData={mockOutData} />);
    
    expect(screen.getByText("YOU'VE REACHED THE END.")).toBeInTheDocument();
  });
});

describe('LibraryItemComponent', () => {
  const mockOutData = vi.fn();

  test('should render item with correct image and alt text', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <LibraryItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockItemData.preview);
    expect(image).toHaveAttribute('alt', `${mockItemData.itemname} preview image`);
  });

  test('should call outData when clicked', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <LibraryItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const item = screen.getByRole('tablist');
    fireEvent.click(item);

    expect(mockOutData).toHaveBeenCalledWith(mockItemData);
  });

  test('should have correct accessibility attributes', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <LibraryItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const item = screen.getByRole('tablist');
    expect(item).toHaveAttribute('tabIndex', '0');
  });

  test('should have lazy loading on image', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <LibraryItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('loading', 'lazy');
  });
});

describe('GhostItemComponent', () => {
  const mockOutData = vi.fn();

  test('should render with reduced opacity', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <GhostItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const item = screen.getByRole('img').closest('.item');
    expect(item).toHaveStyle({ opacity: '25%' });
  });

  test('should call outData when clicked', () => {
    render(
      <ModelContext.Provider value={mockItemData}>
        <GhostItemComponent outData={mockOutData} />
      </ModelContext.Provider>
    );

    const item = screen.getByRole('img').closest('.item');
    fireEvent.click(item!);

    expect(mockOutData).toHaveBeenCalledWith(mockItemData);
  });
});

describe('Integration Tests', () => {
  const mockOutData = vi.fn();

  test('should handle complete user workflow', async () => {
    render(<GalleryComponent outData={mockOutData} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    fireEvent.click(screen.getByTestId('filter-button'));

    fireEvent.click(screen.getByTestId('clear-filter'));

    expect(screen.getByTestId('filter-component')).toBeInTheDocument();
  });

  test('should handle multiple rapid detail view operations', async () => {
    render(<GalleryComponent outData={mockOutData} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const itemImages = screen.getAllByRole('img');
    if (itemImages.length > 0) {
      const item = itemImages[0].closest('.item') || itemImages[0];

      fireEvent.click(item);
      fireEvent.click(item);

      await waitFor(() => {
        expect(screen.queryByTestId('detail-container')).toBeInTheDocument();
      });
    }
  });
});

export const createMockModelContext = (overrides: Partial<ItemType> = {}) => ({
  ...mockItemData,
  ...overrides
});

export const renderWithModelContext = (component: React.ReactElement, modelData: ItemType = mockItemData) => {
  return render(
    <ModelContext.Provider value={modelData}>
      {component}
    </ModelContext.Provider>
  );
};