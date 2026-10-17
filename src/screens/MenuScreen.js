import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { fetchMenuData, CATEGORIES } from '../data/menu';
import { lightColors } from '../theme/colors';

/**
 * MenuScreen (Question 4 Implementation)
 *
 * Demonstrates:
 * 1. Loading data on mount with a 1.5-second Promise and unmount cleanup.
 * 2. Managing loading, error, and pull-to-refresh states.
 * 3. Horizontal category chips with reactive filtering using useEffect dependencies.
 * 4. FlatList rendering with keyExtractor, Daily Special badges, and greyed-out unavailable items.
 * 5. Dynamic screen header title updating with item count via useEffect.
 */
export default function MenuScreen({ navigation }) {
  // =========================================================================
  // HOOKS SECTION (Every hook has a simple English comment for viva explanation)
  // =========================================================================

  // HOOK 1: useState for menuItems
  // What it does: Holds the complete master list of menu items loaded from the Promise.
  // Why it is used: In React, UI is driven by state. We need to store the data once fetched so components can access and render it.
  const [menuItems, setMenuItems] = useState([]);

  // HOOK 2: useState for filteredItems
  // What it does: Stores the subset of menu items currently displayed based on selected category.
  // Why it is used: Keeps the displayed list separate from the master list so filtering does not lose the original data.
  const [filteredItems, setFilteredItems] = useState([]);

  // HOOK 3: useState for selectedCategory
  // What it does: Tracks which category chip is currently active ('All', 'Starters', 'Mains', etc.).
  // Why it is used: Tells the UI which chip to highlight and triggers the filtering effect when clicked.
  const [selectedCategory, setSelectedCategory] = useState('All');

  // HOOK 4: useState for isLoading
  // What it does: Boolean flag indicating if the 1.5-second initial data fetch is still happening.
  // Why it is used: Shows an ActivityIndicator while data is loading so the user does not see a blank screen.
  const [isLoading, setIsLoading] = useState(true);

  // HOOK 5: useState for error
  // What it does: Stores an error message if loading fails (e.g. when SIMULATE_ERROR is true).
  // Why it is used: Allows rendering an error screen with a "Retry" button instead of crashing the app.
  const [error, setError] = useState(null);

  // HOOK 6: useState for refreshing
  // What it does: Tracks whether the user is actively pulling down the list to reload data.
  // Why it is used: FlatList's pull-to-refresh requires a boolean state to show and hide the top refresh spinner.
  const [refreshing, setRefreshing] = useState(false);

  // HOOK 7: useState for failedImageIds
  // What it does: Keeps track of item IDs whose remote images failed to load.
  // Why it is used: Enables graceful fallback to a colored placeholder box so broken URLs don't break the card layout.
  const [failedImageIds, setFailedImageIds] = useState({});

  /**
   * Helper function to load menu data.
   * Resolves after 1.5 seconds or rejects if SIMULATE_ERROR is true.
   */
  const loadMenu = (isPullToRefresh = false) => {
    if (!isPullToRefresh) {
      setIsLoading(true);
    }
    setError(null);

    let isMounted = true;

    fetchMenuData()
      .then((data) => {
        if (isMounted) {
          setMenuItems(data);
          setIsLoading(false);
          setRefreshing(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Something went wrong while loading the menu.');
          setIsLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  };

  // HOOK 8: useEffect for initial data loading (Mount effect)
  // What it does: Runs once when the MenuScreen first mounts to trigger the 1.5-second fetch.
  // Why it is used: The empty dependency array [] ensures this network simulation runs only on mount.
  // The returned cleanup function sets a flag to prevent state updates if the user leaves before the Promise finishes.
  useEffect(() => {
    let active = true;

    fetchMenuData()
      .then((data) => {
        if (active) {
          setMenuItems(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load menu.');
          setIsLoading(false);
        }
      });

    // Cleanup function: clears active flag so no state update occurs after unmount
    return () => {
      active = false;
    };
  }, []); // Empty dependency array = run only once on mount

  // HOOK 9: useEffect for category filtering
  // What it does: Re-filters menuItems whenever selectedCategory or menuItems changes, updating filteredItems.
  // Why it is used: useEffect with dependencies [selectedCategory, menuItems] ensures that anytime the user
  // taps a chip or the master menu reloads, the filtered list updates automatically.
  // (NOTE: If this dependency array is left empty, changing the category chip will never update filteredItems!)
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setFilteredItems(filtered);
    }
  }, [selectedCategory, menuItems]);

  // HOOK 10: useEffect for updating screen header title with item count
  // What it does: Updates the navigation bar title with the number of visible items, e.g., "Menu (16)".
  // Why it is used: Runs whenever filteredItems changes so the header accurately reflects the filtered count.
  useEffect(() => {
    navigation.setOptions({
      title: `Menu (${filteredItems.length})`,
    });
  }, [filteredItems.length, navigation]);

  /**
   * Pull to refresh handler for FlatList
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMenuData()
      .then((data) => {
        setMenuItems(data);
        setError(null);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to refresh menu.');
        setRefreshing(false);
      });
  };

  /**
   * Handles image load error by marking this item ID as failed
   */
  const handleImageError = (id) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  };

  /**
   * Category icon helper for fallback placeholder boxes
   */
  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'Starters':
        return '🥗';
      case 'Mains':
        return '🥩';
      case 'Desserts':
        return '🍰';
      case 'Drinks':
        return '🍹';
      default:
        return '🍽️';
    }
  };

  // =========================================================================
  // CONDITIONAL RENDERS: Loading & Error States
  // =========================================================================

  // Loading State
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={lightColors.primary} />
        <Text style={styles.loadingText}>Loading delicious menu items...</Text>
        <Text style={styles.loadingSubtext}>Please wait (1.5s simulated delay)</Text>
      </View>
    );
  }

  // Error State with Retry Button
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops! Could Not Load Menu</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => loadMenu(false)}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Retry Loading</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =========================================================================
  // RENDER ITEM CARD
  // =========================================================================
  const renderMenuItem = ({ item }) => {
    const isImageBroken = failedImageIds[item.id];

    return (
      <View
        style={[
          styles.card,
          !item.isAvailable && styles.cardUnavailable, // Greyed-out unavailable items
        ]}
      >
        {/* Item Image with Fallback Placeholder Box */}
        <View style={styles.imageContainer}>
          {!isImageBroken ? (
            <Image
              source={{ uri: item.image }}
              style={styles.itemImage}
              resizeMode="cover"
              onError={() => handleImageError(item.id)}
            />
          ) : (
            <View style={[styles.imageFallback, { backgroundColor: getCategoryColor(item.category) }]}>
              <Text style={styles.fallbackEmoji}>{getCategoryEmoji(item.category)}</Text>
              <Text style={styles.fallbackText}>{item.category}</Text>
            </View>
          )}

          {/* Daily Special Badge */}
          {item.isSpecial && (
            <View style={styles.specialBadge}>
              <Text style={styles.specialBadgeText}>Daily Special ⭐</Text>
            </View>
          )}

          {/* Unavailable Badge */}
          {!item.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeaderRow}>
            <Text
              style={[styles.itemName, !item.isAvailable && styles.textDisabled]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.itemPrice, !item.isAvailable && styles.textDisabled]}
            >
              ${item.price.toFixed(2)}
            </Text>
          </View>

          <Text
            style={[styles.itemDescription, !item.isAvailable && styles.textDisabled]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          {/* Card Footer: Category tag & Add button */}
          <View style={styles.cardFooter}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                !item.isAvailable && styles.addButtonDisabled,
              ]}
              disabled={!item.isAvailable}
              onPress={() => {
                Alert.alert('Item Added', `${item.name} added to your selection!`);
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.addButtonText,
                  !item.isAvailable && styles.addButtonTextDisabled,
                ]}
              >
                {item.isAvailable ? '+ Add to Cart' : 'Unavailable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Chips Horizontal ScrollView */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Menu Items FlatList with keyExtractor & pull-to-refresh */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[lightColors.primary]}
            tintColor={lightColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items found in this category.</Text>
          </View>
        }
      />
    </View>
  );
}

/**
 * Helper to get a subtle background color for placeholder boxes based on category
 */
function getCategoryColor(category) {
  switch (category) {
    case 'Starters':
      return '#E8F5E9';
    case 'Mains':
      return '#FFEBEE';
    case 'Desserts':
      return '#FFF3E0';
    case 'Drinks':
      return '#E1F5FE';
    default:
      return '#F5F5F5';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: lightColors.background,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: lightColors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: lightColors.textMuted,
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: lightColors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: lightColors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  chipsWrapper: {
    backgroundColor: lightColors.background,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingVertical: 10,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: lightColors.inputBackground,
    borderWidth: 1,
    borderColor: lightColors.border,
  },
  chipSelected: {
    backgroundColor: lightColors.primary,
    borderColor: lightColors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: lightColors.textSecondary,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: lightColors.card,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: lightColors.borderLight,
  },
  cardUnavailable: {
    opacity: 0.55,
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: lightColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  specialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: lightColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  specialBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#616161',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  cardContent: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: lightColors.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: lightColors.primary,
  },
  itemDescription: {
    fontSize: 13,
    color: lightColors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  textDisabled: {
    color: lightColors.disabled,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: lightColors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: lightColors.textSecondary,
    textTransform: 'uppercase',
  },
  addButton: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: lightColors.disabled,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  addButtonTextDisabled: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: lightColors.textSecondary,
  },
});
