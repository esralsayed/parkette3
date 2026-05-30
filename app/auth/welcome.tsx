import StarFilled from '@/assets/images/welcomepage/blue star.svg';
import Img2 from '@/assets/images/welcomepage/Group 165.svg';
import Img3 from '@/assets/images/welcomepage/Group 166.svg';
import CTAImage from '@/assets/images/welcomepage/pic taht awy.png';
import Img1 from '@/assets/images/welcomepage/Salma character.svg';
import { default as StarEmpty } from '@/assets/images/welcomepage/starempty.svg';
import { AppColors, AppFonts, AppFontSizes, ButtonStyles, CardStyles, Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../components/Footer';
import NavBar from '../components/navbar';


const { width } = Dimensions.get('window');

// ─── SUB-COMPONENTS ──────────────────────────────────────
const Tag = ({
  label,
  bgColor = AppColors.blue,
  textColor = AppColors.lilac,
}: {
  label: string;
  bgColor?: string;
  textColor?: string;
}) => (
  <View style={[styles.tag, { backgroundColor: bgColor }]}>
    <Text style={[styles.tagText, { color: textColor }]}>{label.toUpperCase()}</Text>
  </View>
);

// ─── SECTION 1: HERO ─────────────────────────────────────
const HeroSection = () => {
  const router = useRouter();
  return (
    <View style={styles.heroSection}>
      <View style={styles.heroLeft}>
        <Text style={styles.heroTitle}>Parkette</Text>
        <Text style={styles.heroDesc}>
          Join us in a world of full of wonder and opportunities, and what-ifs. where your choices shape the story, your friends join the fun, and every adventure helps you grow into a real-life hero!
        </Text>

        {/* PRIMARY: Parent signup */}
        <TouchableOpacity
          style={styles.btnAction}
          onPress={() => router.push('/auth/signup')}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.btnActionText}>Parent Signup</Text>
          </View>
        </TouchableOpacity>

        {/* SECONDARY: Returning child login */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.btnSecondaryText}>Login →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroRight}>
        <Image source={require('../../assets/images/stars 11.png')} style={styles.starImage1} />
        <Image source={require('../../assets/images/stars 17.png')} style={styles.starImage2} />
        <Image source={require('../../assets/images/stars 18.png')} style={styles.starImage3} />
        <Image source={require('../../assets/images/stars 19.png')} style={styles.starImage4} />
      </View>
    </View>
  );
};

const GameSection = () => (
  <View style={styles.gameSection}>
    <Text style={styles.sectionTitle}>Game</Text>
     <View style={styles.gameCards}>
       <Image
        source={require('../../assets/images/welcomepage/left.png')}
        style={styles.cardleft}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/images/welcomepage/center.png')}
        style={styles.cardcenter}
        resizeMode="cover"
      />
      <Image
        source={require('../../assets/images/welcomepage/right.png')}
        style={styles.cardright}
        resizeMode="cover"
      />
    </View>
    <View style={{alignContent: 'center', justifyContent: 'center', alignItems: 'center'}}>
    <Text style={styles.gameDesc}>
      Play with fun, customized characters! But watch out every choice can change what happens next!
    </Text>
    </View>
   
  </View>
);

// ─── SECTION 3: COMMUNITY ────────────────────────────────
const CommunitySection = () => (
  <View style={styles.communitySection}>
    <View style={styles.outerCard}>
      <View style={styles.innerCard}>
        <Text style={styles.sectionTitle}>Community</Text>
        <View style={styles.innerRow}>
          <View style={styles.textCol}>
            <Text style={styles.subtitle}>Let's connect!</Text>
            <Text style={styles.heroDesc}>
              Be part of your own safe and fun online community! Play with real
              friends and ask your parents for help to find them.
            </Text>
            <TouchableOpacity style={styles.btnAction}>
              <Text style={styles.btnActionText2}>Play and Chat</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.imageCol}>
            <Image
              source={require('../../assets/images/welcomepage/girlcomm2.png')}
              style={styles.commImage1}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/welcomepage/girlcomm.png')}
              style={styles.commImage2}
              resizeMode="contain"
            />
            <Image
              source={require('../../assets/images/welcomepage/catcomm.png')}
              style={styles.commImage3}
              resizeMode="contain"
            />
          </View>
        </View>
      </View>
    </View>
  </View>
);

// ─── SECTION 4: DIARY ────────────────────────────────────
const DiarySection = () => (
  <View style={styles.communitySection}>
        <View style={styles.innerRow}>
          <View style={styles.textCol}>
            <Text style={styles.sectionTitle}>Diary</Text>
            <Text style={styles.subtitle}>Let's Journal!</Text>
            <Text style={styles.heroDesc}>
              Write about the game you played at school or the pretty flower
              you saw on your way home! Your special diary keeps everything and
              decorate it any way you like!
            </Text>
            <TouchableOpacity style={styles.btnAction2}>
              <Text style={styles.btnActionText2}>Today's Note</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.diaryImageCol}>
            <Image
              source={require('../../assets/images/welcomepage/Diary Sample.png')}
              style={styles.diaryImage}
              resizeMode="contain"
            />
          </View>
        </View>
   
  </View>
);

// ─── SECTION 5: IMPRESSIONS ──────────────────────────────
const impressions = [
  { name: 'Salma Madkour', stars: 4, quote: 'The website is very thoughtful and cute!! Kids learn a lot from it everyday', Img: Img2 },
    { name: 'Menna Roushdy', stars: 3, quote: 'Ooooo !!', Img: Img1 },
  { name: 'Zahra Elsherpiny', stars: 5, quote: "BEST WEBSITE EVERRR!!!! my kid are literally obsessed xD", Img: Img3 },
];

const StarRating = ({ count, total = 5 }: { count: number; total?: number }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: total }).map((_, i) =>
      i < count ? <StarFilled key={i} /> : <StarEmpty key={i} />
    )}
  </View>
);

const ImpressionsSection = () => (
  <View style={styles.impressionsSection}>
    <Text style={styles.sectionTitle}>Impressions</Text>
    <View style={styles.impressionsCards}>
      {impressions.map((imp, index) => (
        <View
          key={imp.name}
          style={[
            styles.impressionCard,
            index === 1 && styles.impressionCardCenter,
          ]}
        >
          {/* ── Section 1: Close button bar */}
          <View style={styles.cardTitleBar}>
            <View style={styles.cardCloseBtn}>
              <Text style={styles.cardCloseBtnText}>X</Text>
            </View>
          </View>

          {/* ── Section 2: Character SVG placeholder */}
          <View style={styles.cardCharacter}>
            <imp.Img />
          </View>

          {/* ── Section 3: Name + star rating */}
          <View style={styles.cardIdentity}>
            <Text style={styles.impressionName}>{imp.name}</Text>
            <StarRating count={imp.stars} />
          </View>

          {/* ── Section 4: Quote text */}
          <View style={styles.cardQuote}>
            <Text style={styles.impressionText}>{imp.quote}</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

// ─── SECTION 6: CTA ──────────────────────────────────────
const CTASection = () => (
  <View style={styles.ctaSection}>
    <View style={styles.ctaCard}>
      <Image
        source={CTAImage}
        style={{ width: '100%', height: '100%'}} // match your image's actual ratio
        resizeMode="cover"  // or "cover" if you want it to fill and crop
      />
    </View>
  </View>
);

// ─── MAIN SCREEN ─────────────────────────────────────────
export default function Welcome() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.blue} />
      <NavBar />
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSection />
        <GameSection />
        <CommunitySection />
        <DiarySection />
        <ImpressionsSection />
        <CTASection />
        <Footer />
      </ScrollView>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.lilacLight,
  },

  // ── Tag
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    marginBottom: 16,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    fontFamily: AppFonts.subhead.fontFamily,
  },

  // ── Buttons

  btnAction: {
    ...ButtonStyles.action,
    width: 300,
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginTop: Spacing.lg,
    alignSelf: 'flex-start',
  },
  btnActionText: {
    color: AppColors.blue,
    ...AppFonts.button2,
    fontSize: AppFontSizes.button
  },
    btnActionText2: {
    color: AppColors.blue,
    ...AppFonts.button2,
    alignSelf: 'center',
    fontSize: AppFontSizes.button2
  },
  btnAction2: {
        ...ButtonStyles.action,
    width: 250,
    backgroundColor: AppColors.lilac,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginTop: Spacing.lg,
  },

  btnSecondary: {
  marginTop: Spacing.md,
  alignSelf: 'flex-start',
  paddingHorizontal: Spacing.sm,
  paddingVertical: 8,
},
btnSecondaryText: {
  color: AppColors.blue,
  fontFamily: AppFonts.body.fontFamily,
  fontSize: AppFontSizes.body,
  opacity: 0.75,
  textDecorationLine: 'underline',
},

  // ── Section shared
  sectionTitle: {
    fontSize: AppFontSizes.title,
    color: AppColors.blue,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  sectionDesc: {
    fontSize: AppFontSizes.body,
    color: AppColors.blue,
    opacity: 0.65,
    lineHeight: 32,
    marginBottom: Spacing.xl,
    marginLeft: Spacing.md,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },

  // ── Section 1: Hero
  heroSection: {
    backgroundColor: AppColors.lilac,
    paddingTop: 48,
    paddingBottom: 52,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    minHeight: 320,
  },
  heroLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
    paddingLeft: Spacing.lg,
    justifyContent: 'center',
  },
  heroRight: {
    flex: 2,
    width: width * 0.42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starImage1: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
    marginLeft: 300,
  },
  starImage2: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
    marginTop: 50
  },
  starImage3: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
    marginLeft: 100
  },
  starImage4: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
  },

  heroTitle: {
    ...AppFonts.title,
    fontSize: AppFontSizes.super,
    color: AppColors.blue,
    lineHeight: 60,
    marginBottom: Spacing.lg,
  },
  heroDesc: {
    fontSize: AppFontSizes.subhead,
    color: AppColors.blue,
    lineHeight: 32,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    fontFamily: AppFonts.body.fontFamily,
  },

  // ── Section 2: Game
  gameSection: {
    backgroundColor: AppColors.lilac,
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.md,
    padding: Spacing.xl,
    paddingVertical: 48,
    marginLeft: Spacing.md,
  },
  gameCards: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',

  width: '100%',
  height: 200,
  marginVertical: Spacing.lg,
},
cardleft: {
  marginTop: 75,
  width: 410,
  height: 260,
  backgroundColor: AppColors.lilac,
  borderRadius: 20,
  borderWidth: 4,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  transform: [{ rotate: '-12deg' }, { translateX: 20 }],
  zIndex: 1,
},
cardcenter: {
  width: 480,
  height: 325,
  backgroundColor: AppColors.lilac,
  borderRadius: 20,
  borderWidth: 4,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  transform: [{ translateY: -6 }],
  zIndex: 3,
  shadowColor: AppColors.blue,
  shadowOffset: { width: 8, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
},
cardright: {
  marginTop: 75,
  width: 410,
  height: 260,
  backgroundColor: AppColors.lilac,
  borderRadius: 20,
  borderWidth: 4,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  transform: [{ rotate: '12deg' }, { translateX: -20 }],
  zIndex: 1,
      shadowColor: AppColors.blue,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
},

gameDesc:{
  marginTop: 75,
   fontSize: AppFontSizes.body,
    color: AppColors.blue,
    lineHeight: 32,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.body.fontFamily,
},
  // ── Section 3: Community
communitySection: {
  backgroundColor: AppColors.lilac,
  paddingVertical: 48,
  paddingHorizontal: Spacing.xl,
  marginLeft: Spacing.md,
  alignItems: 'center',
},

  subtitle:{
    fontSize: AppFontSizes.subhead,
    fontWeight: '500',
    color: AppColors.blue,
    fontFamily: AppFonts.subhead.fontFamily,
    marginTop: 30,

  },
outerCard: {
  ...CardStyles.default,
  width: '100%',       // ← relative, not fixed px
  maxWidth: 900,       // ← cap on large screens
  alignItems: 'center',
  justifyContent: 'center',
},
innerCard: {
  ...CardStyles.default,
  width: '100%',       // ← fills outerCard
  borderRadius: 20,
  padding: Spacing.xl,
  borderWidth: 2,
  borderColor: AppColors.blue,
  elevation: 4,
  overflow: 'hidden',  // ← THIS is what keeps children inside
},
innerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',       // ← fills innerCard
},
textCol: {
  flex: 1,             // ← takes remaining space after imageCol
  flexDirection: 'column',
  paddingRight: Spacing.md,
},
imageCol: {
  flexDirection: 'row',
  alignItems: 'center',
  width: '20%',        // ← fixed proportion, not fixed px
},
commImage1: {
  width: '100%',       // ← fills imageCol width
  aspectRatio: 1,      // ← keeps square without hardcoded height
    marginLeft: -16,             // ← negative margin creates the overlap

},

commImage2: {
  width: '100%',
  aspectRatio: 1,
    marginLeft: -16,             // ← negative margin creates the overlap

},
commImage3: {
  width: '100%',
  aspectRatio: 1,
    marginLeft: -16,             // ← negative margin creates the overlap

},
  // ── Diary image
diaryImageCol: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
},
diaryImage: {
  width: '100%',
  height: 300,
},

// ── Impressions (overwrite existing keys)
impressionsSection: {
  backgroundColor: AppColors.lilacLight,
  padding: Spacing.xl,
  paddingVertical: 48,
  marginLeft: Spacing.md,
},
impressionsCards: {
  flexDirection: 'row',
  gap: Spacing.md,
  alignItems: 'flex-end',
},
impressionCard: {
  flex: 1,
  backgroundColor: AppColors.lilac,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: AppColors.blue,
  overflow: 'hidden',
},

impressionCardCenter: {
  // slightly taller / more prominent
  marginBottom: 16,
  shadowColor: AppColors.blue,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.2,
  shadowRadius: 12,
  elevation: 8,
},
cardTitleBar: {
  width: '100%',
  backgroundColor: AppColors.blue,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingHorizontal: Spacing.sm,
  paddingVertical: 4,
},
// ── Section 2
cardCharacter: {
  alignItems: 'center',
  paddingVertical: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(58,42,114,0.15)',
},
characterPlaceholder: {
  width: 72,
  height: 80,
  borderRadius: 4,
  backgroundColor: 'rgba(58,42,114,0.1)',
  borderWidth: 1.5,
  borderColor: 'rgba(58,42,114,0.25)',
  borderStyle: 'dashed',
},

// ── Section 3
cardIdentity: {
  alignItems: 'center',
  paddingVertical: Spacing.sm,
  paddingHorizontal: Spacing.sm,
  gap: 6,
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(58,42,114,0.15)',
},

// ── Section 4
cardQuote: {
  flex: 1,
  paddingHorizontal: Spacing.sm,
  paddingVertical: Spacing.md,
},
cardCloseBtn: {
  width: 32,
  height: 32,
  borderRadius: 2,
  borderWidth: 1.5,
  borderColor: AppColors.lilac,
  alignItems: 'center',
  justifyContent: 'center',
},
cardCloseBtnText: {
  ...AppFonts.title,
  color: AppColors.lilac,
  fontSize: AppFontSizes.bodySmall,
},
impressionName: {
  fontSize: AppFontSizes.body,
  //fontWeight: '700',
  color: AppColors.blue,
  fontFamily: AppFonts.subhead.fontFamily,
  marginBottom: 4,
  textAlign: 'center',
},
starsRow: {
  flexDirection: 'row',
  marginBottom: Spacing.sm,
},
star: {
  fontSize: 14,
},
starFilled: {
  color: AppColors.blue,
},
starEmpty: {
  color: AppColors.blue,
  opacity: 0.25,
},
impressionText: {
  fontSize: AppFontSizes.bodySmall,
  color: AppColors.blue,
  lineHeight: 18,
  textAlign: 'center',
  paddingHorizontal: Spacing.sm,
  fontFamily: AppFonts.bodySmall.fontFamily,
  opacity: 0.8,
},

  // ── Section 6: CTA
  ctaSection: {
    backgroundColor: AppColors.lilac,
    padding: Spacing.xl,
    paddingVertical: 48,
    marginLeft: Spacing.md,
    alignItems: 'center',
  },
  ctaCard: {
    backgroundColor: AppColors.blue,
    borderRadius: 28,
    width: 1200,
    height: 400,
    overflow: 'hidden',
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 36,
    elevation: 10,
  },
  ctaTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: AppColors.lilac,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  ctaDesc: {
    fontSize: 14,
    color: AppColors.lilac,
    opacity: 0.65,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
});