import React, { useRef, useEffect } from 'react';
import { Animated, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// カスタムタブバーのボタン
function AnimatedTabButton({ label, icon, isFocused, onPress, index, focusedTab, tabWidth }) {
  const theme = useTheme();
  
  // アニメーション値
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  
  useEffect(() => {
    // タブがフォーカスされたときのアニメーション
    if (isFocused) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.15,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <Ionicons
          name={isFocused ? icon : `${icon}-outline`}
          size={24}
          color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
        />
        {isFocused && (
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: theme.colors.primary,
                opacity,
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
      
      {isFocused && (
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

// カスタムタブバー
function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const focusedTab = useRef(new Animated.Value(0)).current;
  const tabWidth = 100 / state.routes.length;
  
  // フォーカスされたタブが変わったときのアニメーション
  useEffect(() => {
    Animated.spring(focusedTab, {
      toValue: state.index,
      friction: 6,
      tension: 100,
      useNativeDriver: false,
    }).start();
  }, [state.index]);

  // アイコンマッピング
  const getTabIcon = (routeName) => {
    const iconMapping = {
      index: 'home',
      calendar: 'calendar',
      'ai-tips': 'bulb',
      settings: 'settings',
    };
    
    return iconMapping[routeName] || 'help-circle';
  };
  
  // ラベルマッピング
  const getTabLabel = (routeName) => {
    const labelMapping = {
      index: 'ホーム',
      calendar: 'カレンダー',
      'ai-tips': 'AI提案',
      settings: '設定',
    };
    
    return labelMapping[routeName] || routeName;
  };

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = getTabLabel(route.name);
        const icon = getTabIcon(route.name);
        
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <AnimatedTabButton
            key={route.key}
            label={label}
            icon={icon}
            isFocused={isFocused}
            onPress={onPress}
            index={index}
            focusedTab={focusedTab}
            tabWidth={tabWidth}
          />
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'カジエイド',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'カレンダー',
        }}
      />
      <Tabs.Screen
        name="ai-tips"
        options={{
          title: 'AI提案',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 20,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});