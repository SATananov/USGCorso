import { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const slides = [
  require('../../assets/auth/welcome-slide-1.jpg'),
  require('../../assets/auth/welcome-slide-2.jpg'),
  require('../../assets/auth/welcome-slide-3.jpg'),
  require('../../assets/auth/welcome-slide-4.jpg'),
];

const loopSlides = [...slides, slides[0]];

export default function AuthWelcomeCarousel({ colors }) {
  const scrollRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!width) {
      return undefined;
    }

    const timer = setInterval(() => {
      const next = index + 1;

      scrollRef.current?.scrollTo({
        x: next * width,
        animated: true,
      });

      if (next === slides.length) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            x: 0,
            animated: false,
          });
          setIndex(0);
        }, 450);
      } else {
        setIndex(next);
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [index, width]);

  function handleScrollEnd(event) {
    if (!width) {
      return;
    }

    const next = Math.round(
      event.nativeEvent.contentOffset.x / width
    );

    if (next === slides.length) {
      scrollRef.current?.scrollTo({
        x: 0,
        animated: false,
      });
      setIndex(0);
      return;
    }

    setIndex(next);
  }

  return (
    <View
      style={[
        styles.frame,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
      }}
    >
      {width > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
        >
          {loopSlides.map((source, slideIndex) => (
            <Image
              key={`${slideIndex}`}
              source={source}
              style={[styles.image, { width }]}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.dots}>
        {slides.map((_, dotIndex) => (
          <View
            key={`${dotIndex}`}
            style={[
              styles.dot,
              {
                backgroundColor:
                  index === dotIndex
                    ? colors.gold
                    : colors.textMuted,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 164,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: 18,
    marginBottom: 18,
  },
  image: {
    height: 164,
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
