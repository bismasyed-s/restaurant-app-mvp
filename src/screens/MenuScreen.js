import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { fetchMenuData, CATEGORIES } from '../data/menu';
import useTheme from '../hooks/useTheme';
import useCart from '../hooks/useCart';
import useOrders from '../hooks/useOrders';
import MenuItemCard from '../components/MenuItemCard';

/**
 * MenuScreen (Question 4 + Question 5)
 *
 * Q4: loading with useEffect, category filtering, FlatList, header count.
 * Q5: search bar (useRef on TextInput), 400 ms debounce (useRef for the timer),
 *     FlatList ref + back-to-top button, render counter (useRef), recent searches.
 */
export default function MenuScreen({ navigation }) {
  // This hook provides the active palette so menu colors follow the global theme.
  const { colors } = useTheme();
  // This hook dispatches selected menu items into the shared cart.
  const { dispatch } = useCart();
  // This hook keeps manager menu edits in sync with the customer menu.
  const { state: ordersState } = useOrders();
  const menuItems = ordersState.menuItems;
  // This memo rebuilds styles only when the active color palette changes.
  const styles = useMemo(() => makeStyles(colors), [colors]);
  // =========================================================================
  // HOOKS SECTION (every hook and ref has a simple English comment for the viva)
  // =========================================================================

  // HOOK 3: useState for selectedCategory
  // What it does: Tracks which category chip is active ('All', 'Starters', ...).
  // Why it is used: Highlights the chip and triggers the filtering effect when it changes.
  const [selectedCategory, setSelectedCategory] = useState('All');

  // This state selects the sort order so tapping a sort option updates the visible rows.
  const [sortOrder, setSortOrder] = useState('default');

  // This state holds favourite ids so the tapped heart updates and the other cards can stay memoized.
  const [favoriteIds, setFavoriteIds] = useState([]);

  // HOOK 4: useState for isLoading
  // What it does: True while the 1.5 second fake fetch is running.
  // Why it is used: Lets us show a spinner instead of a blank screen.
  const [isLoading, setIsLoading] = useState(true);

  // HOOK 5: useState for error
  // What it does: Stores an error message if loading fails.
  // Why it is used: Lets us show an error screen with a Retry button instead of crashing.
  const [error, setError] = useState(null);

  // HOOK 6: useState for refreshing
  // What it does: True while the user is pulling down to refresh.
  // Why it is used: FlatList's pull-to-refresh needs a boolean to show and hide the spinner.
  const [refreshing, setRefreshing] = useState(false);

  // HOOK 7: useState for failedImageIds
  // What it does: Remembers which item images failed to load.
  // Why it is used: Lets us show a coloured placeholder box instead of a broken image.
  const [failedImageIds, setFailedImageIds] = useState({});

  // ------------------------- Q5 STATE HOOKS --------------------------------

  // HOOK 11: useState for searchText
  // What it does: Holds exactly what the user has typed in the search box right now.
  // Why it is used: The TextInput is "controlled", so it needs state to show the typed text.
  const [searchText, setSearchText] = useState('');

  // HOOK 12: useState for debouncedQuery
  // What it does: Holds the search text AFTER the user has stopped typing for 400 ms.
  // Why it is used: Filtering on every keystroke is wasteful. We filter only with this delayed value.
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // HOOK 13: useState for recentSearches
  // What it does: Stores the last 5 different searches.
  // Why it is used: It must be state (not a ref) because changing it must re-render the chips on screen.
  const [recentSearches, setRecentSearches] = useState([]);

  // HOOK 14: useState for isSearchFocused
  // What it does: True while the search box has the keyboard focus.
  // Why it is used: We only show the recent search chips while the box is focused and empty.
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // HOOK 15: useState for showBackToTop
  // What it does: True when the list has been scrolled down more than 300 pixels.
  // Why it is used: It must be state because showing or hiding the button must re-render the screen.
  const [showBackToTop, setShowBackToTop] = useState(false);

  // ------------------------- Q5 REF HOOKS ----------------------------------

  // REF 1: useRef for the TextInput (inputRef)
  // What it does: Gives us a direct handle to the real TextInput on screen.
  // Why it is used: So we can call inputRef.current.focus() when the search icon is tapped
  // or when the clear button is tapped. Doing this with state would be awkward.
  const inputRef = useRef(null);

  // REF 2: useRef for the debounce timer id (debounceRef)
  // What it does: Stores the id of the running setTimeout between renders.
  // Why it is used: We must remember the old timer id to cancel it on the next keystroke.
  // A ref is perfect because changing it does NOT cause a re-render.
  const debounceRef = useRef(null);

  // REF 3: useRef for the FlatList (flatListRef)
  // What it does: Gives us a handle to the FlatList component.
  // Why it is used: So the back-to-top button can call flatListRef.current.scrollToOffset(...).
  const flatListRef = useRef(null);

  // REF 4: useRef for the previous saved search (previousQueryRef)
  // What it does: Remembers the last search we saved to the recent list.
  // Why it is used: So the same search is not added twice in a row. It does not need to re-render anything.
  const previousQueryRef = useRef('');

  // REF 5: useRef for the render counter (renderCountRef)
  // What it does: Counts how many times this component has rendered.
  // Why it is used: To prove that a ref survives re-renders.
  // NOTE: Changing a ref does NOT trigger a re-render. React does not watch refs.
  // Only useState / useReducer updates cause re-renders. That is why we can safely
  // increase this number on every render without creating an infinite loop.
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  /**
   * Helper function to load menu data (used by the Retry button).
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

  // HOOK 8: useEffect for initial data loading (mount effect)
  // What it does: Runs once when the screen mounts to start the 1.5 second fetch.
  // Why it is used: The empty dependency array [] means "run only on mount".
  // The cleanup function stops state updates if the user leaves before the Promise finishes.
  useEffect(() => {
    let active = true;

    fetchMenuData()
      .then((data) => {
        if (active) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load menu.');
          setIsLoading(false);
        }
      });

    // Cleanup: no state update after unmount
    return () => {
      active = false;
    };
  }, []);

  // This memo derives filtered and sorted rows from their source values.
  // Derived data stays out of state so it cannot become stale or need a syncing effect.
  const visibleItems = useMemo(() => {
    const query = debouncedQuery.toLowerCase();
    const filtered = menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sortOrder === 'priceLow') return filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === 'priceHigh') return filtered.sort((a, b) => b.price - a.price);
    if (sortOrder === 'name') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [menuItems, selectedCategory, debouncedQuery, sortOrder]);

  // HOOK 10: useEffect for updating the screen header title with the item count
  // What it does: Updates the header to show how many items are visible, e.g. "Menu (5)".
  // Why it is used: Runs whenever the visible count changes (category OR search).
  useEffect(() => {
    navigation.setOptions({
      title: `Menu (${visibleItems.length})`,
    });
  }, [visibleItems.length, navigation]);

  // HOOK 16: useEffect for debounce cleanup on unmount
  // What it does: Cancels any pending search timer when the screen closes.
  // Why it is used: Otherwise the timer could fire after unmount and try to update state.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  /**
   * Pull to refresh handler for FlatList
   */
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMenuData()
      .then((data) => {
        setError(null);
        setRefreshing(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to refresh menu.');
        setRefreshing(false);
      });
  };

  // This callback marks a broken image without changing the callback prop for other cards.
  const handleImageError = useCallback((id) => {
    setFailedImageIds((prev) => ({ ...prev, [id]: true }));
  }, []);

  // This callback adds an item to the cart and is shared by every memoized card.
  const handleAddToCart = useCallback((item) => {
    dispatch({ type: 'ADD_ITEM', item });
    Alert.alert('Item Added', `${item.name} added to your cart!`);
  }, [dispatch]);

  // This callback toggles a single favourite id and stays stable across card renders.
  const handleToggleFavorite = useCallback((itemId) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((id) => id !== itemId)
        : [...currentIds, itemId]
    );
  }, []);

  // Q5: save a search into the recent list (max 5, no duplicates, no repeat of the last one)
  const saveRecentSearch = (query) => {
    if (!query) return;
    if (previousQueryRef.current === query) return; // same as last saved search
    previousQueryRef.current = query;
    setRecentSearches((prev) =>
      [query, ...prev.filter((q) => q.toLowerCase() !== query.toLowerCase())].slice(0, 5)
    );
  };

  // Q5: runs on every keystroke. Manual 400 ms debounce using the timer stored in debounceRef.
  const handleSearchChange = (text) => {
    setSearchText(text); // update the input instantly

    // Cancel the previous timer (the user is still typing)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Start a new timer: only after 400 ms of silence do we apply the search
    debounceRef.current = setTimeout(() => {
      const trimmed = text.trim();
      setDebouncedQuery(trimmed);
      saveRecentSearch(trimmed);
    }, 400);
  };

  // Q5: tapping the search icon focuses the TextInput through its ref
  const handleSearchIconPress = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Q5: clear button empties the text and keeps focus in the input
  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current); // cancel any pending search
    }
    setSearchText('');
    setDebouncedQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Q5: tapping a recent search chip fills the box and searches immediately
  const handleRecentPress = (query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    setSearchText(query);
    setDebouncedQuery(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Q5: show the back-to-top button only after scrolling more than 300 pixels
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowBackToTop(offsetY > 300);
  };

  // Q5: scroll the list to the top using the FlatList ref
  const handleBackToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // This callback keeps row rendering separate so memoized cards can skip unchanged props.
  const renderMenuItem = useCallback(({ item }) => (
    <MenuItemCard
      item={item}
      styles={styles}
      colors={colors}
      isFavorite={favoriteIds.includes(item.id)}
      isImageBroken={Boolean(failedImageIds[item.id])}
      onImageError={handleImageError}
      onAddToCart={handleAddToCart}
      onToggleFavorite={handleToggleFavorite}
    />
  ), [styles, colors, favoriteIds, failedImageIds, handleImageError, handleAddToCart, handleToggleFavorite]);


  // =========================================================================
  // CONDITIONAL RENDERS: Loading & Error States
  // =========================================================================

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading delicious menu items...</Text>
        <Text style={styles.loadingSubtext}>Please wait (1.5s simulated delay)</Text>
      </View>
    );
  }

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

  const showRecent =
    isSearchFocused && searchText.length === 0 && recentSearches.length > 0;

  return (
    <View style={styles.container}>
      {/* Q5: Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchRow}>
          <TouchableOpacity
            onPress={handleSearchIconPress}
            style={styles.searchIconButton}
            activeOpacity={0.7}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search dishes..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />

          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Changing this ref does not re-render; changing state does. */}
        {/* Q5: render counter (debug label). It reads the ref value. */}
        <Text style={styles.renderCounter}>Renders: {renderCountRef.current}</Text>

        {/* Q5: recent searches, shown only when focused and empty */}
        {showRecent && (
          <View style={styles.recentWrapper}>
            <Text style={styles.recentLabel}>Recent searches</Text>
            <View style={styles.recentRow}>
              {recentSearches.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={styles.recentChip}
                  onPress={() => handleRecentPress(q)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recentChipText}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Category Chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => setSelectedCategory(category)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort controls */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {[
          { key: 'priceLow', label: 'Price low-high' },
          { key: 'priceHigh', label: 'Price high-low' },
          { key: 'name', label: 'Name A-Z' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortButton, sortOrder === option.key && styles.sortButtonSelected]}
            onPress={() => setSortOrder(option.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.sortButtonText, sortOrder === option.key && styles.sortButtonTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu list */}
      <FlatList
        ref={flatListRef}
        data={visibleItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {debouncedQuery
                ? 'No dishes found. Try a different search!'
                : 'No items found in this category.'}
            </Text>
          </View>
        }
      />

      {/* Q5: floating back-to-top button */}
      {showBackToTop && (
        <TouchableOpacity
          style={styles.backToTopButton}
          onPress={handleBackToTop}
          activeOpacity={0.8}
        >
          <Text style={styles.backToTopText}>↑ Back to top</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Helper to get a subtle background color for placeholder boxes based on category
 */
function getCategoryColor(category, colors) {
  switch (category) {
    case 'Starters':
      return colors.success;
    case 'Mains':
      return colors.primaryLight;
    case 'Desserts':
      return colors.warning;
    case 'Drinks':
      return colors.borderLight;
    default:
      return colors.surface;
  }
}

function makeStyles(colors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.badgeText,
    fontWeight: '700',
    fontSize: 15,
  },

  // ---- Q5 search styles ----
  searchWrapper: {
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
  },
  searchIconButton: {
    paddingRight: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  renderCounter: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
  },
  recentWrapper: {
    marginTop: 4,
  },
  recentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  recentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recentChipText: {
    fontSize: 13,
    color: colors.text,
  },
  backToTopButton: {
    position: 'absolute',
    right: 20,
	paddingHorizontal: 16,
 	height: 44,
 	borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backToTopText: {
    color: colors.badgeText,
    fontSize: 14,
    fontWeight: '700',
  },

  // ---- Q4 styles (unchanged) ----
  chipsWrapper: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.badgeText,
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  sortLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: colors.inputBackground,
  },
  sortButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  sortButtonTextSelected: {
    color: colors.badgeText,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardUnavailable: {
    opacity: 0.55,
    backgroundColor: colors.disabledBackground,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: colors.borderLight,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  specialBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.accent,
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
    color: colors.badgeText,
    fontWeight: '700',
    fontSize: 12,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.disabled,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableBadgeText: {
    color: colors.badgeText,
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
  favoriteButton: {
    paddingHorizontal: 8,
  },
  favoriteText: {
    color: colors.textMuted,
    fontSize: 22,
  },
  favoriteActive: {
    color: colors.primary,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  itemDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  textDisabled: {
    color: colors.disabled,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTag: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  addButtonText: {
    color: colors.badgeText,
    fontWeight: '700',
    fontSize: 13,
  },
  addButtonTextDisabled: {
    color: colors.badgeText,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
}
