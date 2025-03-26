import { fetchWithCache, API_CACHE_CONFIG } from './networkService';
import { auth } from '../firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API設定（実際のAPIエンドポイントに置き換える）
const API_ENDPOINT = 'https://api.example.com/ai/housework-suggestions';

// ユーザープロファイルのキャッシュキー
const USER_PROFILE_CACHE_KEY = 'user_profile';

/**
 * ユーザーのプロファイル情報を取得
 * @returns {Promise<Object>} ユーザープロファイル
 */
const getUserProfile = async () => {
  try {
    // まずキャッシュから取得
    const cachedProfile = await AsyncStorage.getItem(USER_PROFILE_CACHE_KEY);
    if (cachedProfile) {
      return JSON.parse(cachedProfile);
    }
    
    // キャッシュになければ空のプロファイルを返す
    return {
      preferences: {
        weekdaySchedule: 'busy', // 'busy', 'moderate', 'flexible'
        weekendSchedule: 'flexible',
        familySize: 1,
        hasPets: false,
        homeSize: 'medium', // 'small', 'medium', 'large'
        cleaningFrequency: 'weekly', // 'daily', 'weekly', 'biweekly', 'monthly'
        cookingPreference: 'simple', // 'none', 'simple', 'elaborate'
        dietaryRestrictions: []
      },
      completedTasks: [],
      favoriteChores: [],
      dislikedChores: []
    };
  } catch (error) {
    console.error('ユーザープロファイル取得エラー:', error);
    // エラー時は空のプロファイルを返す
    return {
      preferences: {},
      completedTasks: [],
      favoriteChores: [],
      dislikedChores: []
    };
  }
};

/**
 * ユーザープロファイルを更新
 * @param {Object} profile - 更新するプロファイル情報
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('ユーザープロファイル更新エラー:', error);
    throw error;
  }
};

/**
 * AIからの家事提案を取得
 * @param {Object} options - オプション
 * @returns {Promise<Array>} 提案リスト
 */
export const getAiSuggestions = async (options = {}) => {
  try {
    const {
      count = 5,
      type = 'all', // 'cleaning', 'cooking', 'organizing', 'all'
      dayOfWeek = new Date().getDay(),
      timeOfDay = new Date().getHours(),
      refresh = false
    } = options;
    
    // ユーザープロファイルの取得
    const userProfile = await getUserProfile();
    
    // APIリクエストのパラメータ
    const params = {
      count,
      type,
      dayOfWeek,
      timeOfDay,
      userProfile
    };
    
    // キャッシュ設定
    const cacheConfig = refresh ? null : API_CACHE_CONFIG.AI_SUGGESTIONS;
    
    // APIリクエスト（または開発用のダミーデータ）
    if (process.env.NODE_ENV === 'development') {
      return getMockSuggestions(params);
    } else {
      const idToken = await auth.currentUser?.getIdToken();
      
      const response = await fetchWithCache(
        API_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify(params)
        },
        cacheConfig
      );
      
      return response.suggestions || [];
    }
  } catch (error) {
    console.error('AI提案取得エラー:', error);
    // エラー時はモックデータを返す
    return getMockSuggestions();
  }
};

/**
 * ユーザーの行動履歴を更新
 * @param {string} actionType - アクション種別
 * @param {Object} data - アクションデータ
 * @returns {Promise<void>}
 */
export const trackUserAction = async (actionType, data) => {
  try {
    // ユーザープロファイルを取得
    const userProfile = await getUserProfile();
    
    // アクションの種類に応じて更新
    switch (actionType) {
      case 'complete_task':
        if (data.taskId && data.taskTitle) {
          // 完了タスクに追加
          userProfile.completedTasks.push({
            id: data.taskId,
            title: data.taskTitle,
            completedAt: new Date().toISOString(),
            category: data.category || 'other'
          });
          
          // 最新の30件だけ保持
          if (userProfile.completedTasks.length > 30) {
            userProfile.completedTasks = userProfile.completedTasks.slice(-30);
          }
        }
        break;
        
      case 'like_suggestion':
        if (data.suggestionId) {
          // お気に入りに追加
          if (!userProfile.favoriteChores.includes(data.suggestionTitle)) {
            userProfile.favoriteChores.push(data.suggestionTitle);
          }
        }
        break;
        
      case 'dislike_suggestion':
        if (data.suggestionId) {
          // 嫌いなタスクに追加
          if (!userProfile.dislikedChores.includes(data.suggestionTitle)) {
            userProfile.dislikedChores.push(data.suggestionTitle);
          }
        }
        break;
        
      case 'update_preferences':
        // 設定更新
        userProfile.preferences = {
          ...userProfile.preferences,
          ...data
        };
        break;
    }
    
    // 更新したプロファイルを保存
    await updateUserProfile(userProfile);
    
    // リモートにも送信（実際の実装ではここでAPIを呼び出す）
    if (process.env.NODE_ENV !== 'development') {
      // APIリクエスト実装
    }
  } catch (error) {
    console.error('ユーザーアクション記録エラー:', error);
  }
};

/**
 * AI提案からタスクを作成
 * @param {Object} suggestion - 提案データ
 * @returns {Object} タスクデータ
 */
export const createTaskFromSuggestion = (suggestion) => {
  const dueDate = new Date();
  // 提案の種類によって期限を調整
  if (suggestion.timeToComplete) {
    const [hours, minutes] = suggestion.timeToComplete.split(':').map(Number);
    dueDate.setHours(dueDate.getHours() + (hours || 0));
    dueDate.setMinutes(dueDate.getMinutes() + (minutes || 0));
  } else {
    // デフォルトは1時間後
    dueDate.setHours(dueDate.getHours() + 1);
  }
  
  return {
    title: suggestion.title,
    description: suggestion.description,
    dueDate: dueDate.toISOString(),
    category: suggestion.category || '家事',
    priority: suggestion.priority || 'medium',
    completed: false,
    createdFromAI: true,
    aiSuggestionId: suggestion.id
  };
};

/**
 * モック提案データの取得（開発用）
 * @param {Object} params - 提案パラメータ
 * @returns {Array} モック提案リスト
 */
const getMockSuggestions = (params = {}) => {
  const { count = 5, type = 'all' } = params;
  
  // 全ての提案リスト
  const allSuggestions = [
    {
      id: '1',
      title: '洗濯物を畳む',
      description: '乾いた洗濯物を畳んでクローゼットに片付けましょう。',
      category: 'cleaning',
      timeToComplete: '0:20',
      priority: 'medium',
      benefits: ['すっきりとした部屋に', '朝の準備が楽になります'],
      tips: ['音楽を聴きながら作業すると楽しく続けられます', '家族と一緒に行うと早く終わります']
    },
    {
      id: '2',
      title: '食器洗い',
      description: '食器を洗って乾かし、収納しましょう。',
      category: 'cleaning',
      timeToComplete: '0:15',
      priority: 'high',
      benefits: ['清潔なキッチンを維持できます', '虫や臭いの発生を防ぎます'],
      tips: ['食べ終わったらすぐに水に浸けておくと洗いやすくなります']
    },
    {
      id: '3',
      title: '夕食の準備',
      description: '簡単な夕食を作りましょう。今日はパスタがおすすめです。',
      category: 'cooking',
      timeToComplete: '0:30',
      priority: 'high',
      benefits: ['手作りの食事は健康的', '外食より経済的です'],
      tips: ['材料を事前に切っておくと調理時間が短縮できます', '余ったら明日のランチに使えます']
    },
    {
      id: '4',
      title: '浴室の掃除',
      description: '浴槽、シャワー、床を洗浄剤で掃除しましょう。',
      category: 'cleaning',
      timeToComplete: '0:20',
      priority: 'medium',
      benefits: ['カビの発生を防ぎます', 'いつでも清潔なお風呂に入れます'],
      tips: ['使用後すぐに掃除すると汚れが落ちやすいです', '週に1回の定期掃除がおすすめです']
    },
    {
      id: '5',
      title: '冷蔵庫の整理',
      description: '古くなった食品を処分し、冷蔵庫内を拭き掃除しましょう。',
      category: 'organizing',
      timeToComplete: '0:25',
      priority: 'low',
      benefits: ['食品ロスを減らせます', 'スペースを有効活用できます'],
      tips: ['週末に定期的に行うと整理しやすいです', '透明な容器を使うと中身が見やすくなります']
    },
    {
      id: '6',
      title: '部屋の掃除機がけ',
      description: '床のほこりやごみを掃除機で吸い取りましょう。',
      category: 'cleaning',
      timeToComplete: '0:15',
      priority: 'medium',
      benefits: ['アレルギーの原因となるほこりを減らせます', '見た目もすっきりします'],
      tips: ['家具の下や隙間も忘れずに掃除しましょう', '週に2回が理想的です']
    },
    {
      id: '7',
      title: '買い物リストの作成',
      description: '必要な食材や日用品をリストアップしましょう。',
      category: 'organizing',
      timeToComplete: '0:10',
      priority: 'low',
      benefits: ['計画的な買い物ができます', '無駄な出費を抑えられます'],
      tips: ['冷蔵庫と食品棚をチェックしてから作成するとよいでしょう', 'スマホのメモアプリを使うと便利です']
    },
    {
      id: '8',
      title: '洗面所の掃除',
      description: '洗面台、鏡、排水口を掃除しましょう。',
      category: 'cleaning',
      timeToComplete: '0:15',
      priority: 'medium',
      benefits: ['清潔な環境で気持ちよく使えます', '水垢やカビの蓄積を防ぎます'],
      tips: ['歯磨き後に軽く拭くだけでも効果的です', '重曹を使うと環境にやさしく掃除できます']
    },
    {
      id: '9',
      title: 'リネン類の交換',
      description: 'ベッドシーツやタオルを新しいものに交換しましょう。',
      category: 'cleaning',
      timeToComplete: '0:20',
      priority: 'medium',
      benefits: ['清潔な寝具で快適な睡眠を', '肌トラブルの予防になります'],
      tips: ['週に一度の交換がおすすめです', '予備のセットを用意しておくと便利です']
    },
    {
      id: '10',
      title: '簡単な朝食の準備',
      description: '明日の朝食の準備をしておきましょう。',
      category: 'cooking',
      timeToComplete: '0:15',
      priority: 'low',
      benefits: ['朝の時間を節約できます', '栄養バランスの良い一日のスタートになります'],
      tips: ['オーバーナイトオートミールが簡単でおすすめです', '果物を前日に切っておくと便利です']
    }
  ];
  
  // タイプによるフィルタリング
  let filteredSuggestions = allSuggestions;
  if (type !== 'all') {
    filteredSuggestions = allSuggestions.filter(s => s.category === type);
  }
  
  // シャッフルしてランダムに提案
  const shuffled = [...filteredSuggestions].sort(() => 0.5 - Math.random());
  
  // 指定した数だけ返す
  return shuffled.slice(0, count);
};