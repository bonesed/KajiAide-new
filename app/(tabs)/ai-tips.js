import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated, 
  RefreshControl,
  Dimensions,
  Image
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';
import Loading from '../../src/components/Loading';
import { getAiSuggestions, createTaskFromSuggestion, trackUserAction } from '../../src/services/aiSuggestionsService';
import { addTask } from '../../src/store/slices/tasksSlice';
import EmptyState from '../../src/components/EmptyState';
import { handleError } from '../../src/utils/errorHandling';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const AiTipsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [error, setError] = useState(null);
  
  // アニメーション値
  const fadeAnim = new Animated.Value(0);
  const translateY = new Animated.Value(50);
  
  // 初回ロード時のアニメーション
  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // 提案を取得する関数
  const fetchSuggestions = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getAiSuggestions({
        type: currentFilter,
        refresh
      });
      
      setSuggestions(data);
      
      // 初回ロード時またはエラー後にアニメーション
      if (loading || error) {
        animateIn();
      }
    } catch (err) {
      handleError(err, {
        showAlert: true,
        context: { screen: 'AiTips', action: 'fetchSuggestions' }
      });
      setError('提案の取得中にエラーが発生しました。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFilter, loading, error]);
  
  // 初回ロード
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);
  
  // プルダウンでリフレッシュ
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSuggestions(true);
  }, [fetchSuggestions]);
  
  // フィルターの変更
  const handleFilterChange = (filter) => {
    if (filter !== currentFilter) {
      setCurrentFilter(filter);
      fadeAnim.setValue(0);
      translateY.setValue(30);
      setLoading(true);
    }
  };
  
  // 提案からタスク作成
  const handleCreateTask = async (suggestion) => {
    try {
      const taskData = createTaskFromSuggestion(suggestion);
      const newTask = await dispatch(addTask(taskData)).unwrap();
      
      // ユーザーアクション追跡
      trackUserAction('like_suggestion', {
        suggestionId: suggestion.id,
        suggestionTitle: suggestion.title
      });
      
      // 成功メッセージ
      navigation.navigate('index'); // ホーム画面に移動
    } catch (err) {
      handleError(err, {
        showAlert: true,
        context: { screen: 'AiTips', action: 'createTask' }
      });
    }
  };
  
  // 提案を却下
  const handleDismissSuggestion = (suggestion) => {
    // リストから削除
    setSuggestions(current => current.filter(s => s.id !== suggestion.id));
    
    // ユーザーアクション追跡
    trackUserAction('dislike_suggestion', {
      suggestionId: suggestion.id,
      suggestionTitle: suggestion.title
    });
  };
  
  // フィルターボタン
  const FilterButton = ({ title, value }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor: currentFilter === value ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={() => handleFilterChange(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color: currentFilter === value ? '#fff' : theme.colors.primary,
          },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
  
  // 提案カード
  const SuggestionCard = ({ suggestion, index }) => {
    // カードごとのアニメーション
    const cardFade = new Animated.Value(0);
    const cardTranslate = new Animated.Value(30);
    
    useEffect(() => {
      // カードが表示されるアニメーション
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 400,
          delay: index * 100, // 順番に表示
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslate, {
          toValue: 0,
          friction: 8,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);
    
    // カテゴリーに応じたアイコン
    const getCategoryIcon = (category) => {
      switch (category) {
        case 'cleaning':
          return 'water-outline';
        case 'cooking':
          return 'restaurant-outline';
        case 'organizing':
          return 'file-tray-stacked-outline';
        default:
          return 'home-outline';
      }
    };
    
    // 優先度に応じた色
    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high':
          return theme.colors.error;
        case 'medium':
          return theme.colors.warning;
        case 'low':
          return theme.colors.success;
        default:
          return theme.colors.primary;
      }
    };
    
    // 優先度のラベル
    const getPriorityLabel = (priority) => {
      switch (priority) {
        case 'high':
          return '優先: 高';
        case 'medium':
          return '優先: 中';
        case 'low':
          return '優先: 低';
        default:
          return '優先度設定なし';
      }
    };
    
    return (
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: cardFade,
            transform: [{ translateY: cardTranslate }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.categoryContainer}>
            <View
              style={[
                styles.categoryIconContainer,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(suggestion.category)}
                size={18}
                color={theme.colors.primary}
              />
            </View>
            <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
              {suggestion.category === 'cleaning' ? '掃除' : 
               suggestion.category === 'cooking' ? '料理' : 
               suggestion.category === 'organizing' ? '整理' : '家事'}
            </Text>
          </View>
          
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(suggestion.priority) },
            ]}
          >
            <Text style={styles.priorityText}>
              {getPriorityLabel(suggestion.priority)}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {suggestion.title}
        </Text>
        
        <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
          {suggestion.description}
        </Text>
        
        {suggestion.timeToComplete && (
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              所要時間: 約{suggestion.timeToComplete.replace(':', '時間')}分
            </Text>
          </View>
        )}
        
        {suggestion.benefits && suggestion.benefits.length > 0 && (
          <View style={styles.benefitsContainer}>
            <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
              メリット:
            </Text>
            {suggestion.benefits.map((benefit, i) => (
              <View key={i} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        {suggestion.tips && suggestion.tips.length > 0 && (
          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              ヒント:
            </Text>
            {suggestion.tips.map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Ionicons name="bulb-outline" size={16} color={theme.colors.warning} />
                <Text style={[styles.tipText, { color: theme.colors.text }]}>
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton, { borderColor: theme.colors.error }]}
            onPress={() => handleDismissSuggestion(suggestion)}
          >
            <Ionicons name="close-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.dismissButtonText, { color: theme.colors.error }]}>
              却下
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => handleCreateTask(suggestion)}
          >
            <Ionicons name="add-outline" size={24} color="#fff" />
            <Text style={styles.addButtonText}>
              タスクに追加
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };
  
  if (loading && !refreshing) {
    return <Loading message="AIが家事提案を考え中..." />;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          AI家事コンシェルジュ
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          今おすすめの家事タスクをご提案します
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <FilterButton title="すべて" value="all" />
        <FilterButton title="掃除" value="cleaning" />
        <FilterButton title="料理" value="cooking" />
        <FilterButton title="整理" value="organizing" />
      </View>
      
      {error ? (
        <EmptyState
          icon="alert-circle-outline"
          message={error}
          subMessage="下にスワイプして再読み込み"
        />
      ) : suggestions.length === 0 ? (
        <EmptyState
          icon="cafe-outline"
          message="提案はありません"
          subMessage="別のカテゴリーを選ぶか、少し時間をおいて再度お試しください"
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY }],
            }}
          >
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                index={index}
              />
            ))}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 14,
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  tipsContainer: {
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  dismissButton: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
  },
  dismissButtonText: {
    marginLeft: 4,
    fontWeight: '600',
  },
  addButton: {
    flex: 2,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default AiTipsScreen;