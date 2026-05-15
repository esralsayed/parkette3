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
import Svg from 'react-native-svg';

const { width } = Dimensions.get('window');

// ─── DECORATIVE SVG ILLUSTRATION ─────────────────────────
const HeroIllustration = () => (
  <Svg width={300} height={300} viewBox="0 0 300 300" fill="none"></Svg>
);

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

const NavBar = () => {
  const router = useRouter();
  return (
    <View style={styles.navbar}>
      <Text style={styles.navLogo}>Parkette</Text>
      <View style={styles.navLinks}>
        <Text style={styles.navLink}>Game</Text>
        <Text style={styles.navLink}>Community</Text>
        <Text style={styles.navLink}>Diary</Text>
      </View>
      <View style={styles.navActions}>
        <TouchableOpacity onPress={() => router.push('/main components/login')}>
          <Text style={styles.navLogin}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navSignupBtn}
          onPress={() => router.push('/main components/signup')}
        >
          <Text style={styles.navSignupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── SECTION 1: HERO ─────────────────────────────────────
const HeroSection = () => {
  const router = useRouter();
  return (
    <View style={styles.heroSection}>
      {/* LEFT: text content aligned to the left */}
      <View style={styles.heroLeft}>
        <Text style={styles.heroTitle}>Parkette</Text>
        <Text style={styles.heroDesc}>
          Join us in a world of full of wonder and opportunities, and what-ifs. where your choices shape the story, your friends join the fun, and every adventure helps you grow into a real-life hero!
        </Text>
        <TouchableOpacity style={styles.btnAction} onPress={() => router.push('/main components/login')}>
          <View style={{alignContent: 'center', justifyContent: 'center', alignItems: 'center'}}>
          <Text style={styles.btnActionText}>Play Now</Text>
          </View>
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

// ─── SECTION 2: GAME ─────────────────────────────────────
const games = [
  { emoji: '🏃', bg: AppColors.blue, title: 'Sprint Challenge', desc: 'Race through the park and beat your personal best. Compete with players worldwide in real time.' },
  { emoji: '🎯', bg: AppColors.lilacMid, title: 'Target Hunt', desc: 'Sharpen your aim in this fast-paced target challenge. Can you hit them all before time runs out?' },
  { emoji: '🧩', bg: AppColors.dark, title: 'Puzzle Park', desc: 'Solve nature-inspired puzzles and unlock hidden park areas. New puzzles drop every day.' },
];

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
        source={require('../../assets/images/welcomepage/left.png')}
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
  { name: 'Menna Roushdy', stars: 3, quote: 'Ooooo !!' },
  { name: 'Salma Madkour', stars: 4, quote: 'The website is very thoughtful and cute!! Kids learn a lot from it everyday' },
  { name: 'Zahra Elsherpiny', stars: 5, quote: "BEST WEBSITE EVERRR!!!! my kid are literally obsessed xD" },
];

const StarRating = ({ count, total = 5 }: { count: number; total?: number }) => (
  <View style={styles.starsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <Text key={i} style={[styles.star, i < count ? styles.starFilled : styles.starEmpty]}>
        ★
      </Text>
    ))}
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
          {/* Browser title bar */}
          <View style={styles.cardTitleBar}>
            <View style={styles.cardCloseBtn}>
              <Text style={styles.cardCloseBtnText}>✕</Text>
            </View>
          </View>

          {/* Avatar placeholder */}
          <View style={styles.avatarPlaceholder}>
            <View style={styles.avatarHead} />
            <View style={styles.avatarBody} />
          </View>

          {/* Name */}
          <Text style={styles.impressionName}>{imp.name}</Text>

          {/* Stars */}
          <StarRating count={imp.stars} />

          {/* Quote */}
          <Text style={styles.impressionText}>{imp.quote}</Text>
        </View>
      ))}
    </View>
  </View>
);

// ─── SECTION 6: CTA ──────────────────────────────────────
const CTASection = () => (
  <View style={styles.ctaSection}>
    <View style={styles.ctaCard}>
      <Text style={styles.ctaTitle}>Ready to Enter the Park?</Text>
      <Text style={styles.ctaDesc}>
        Join the Parkette community today. Play games, journal your days, and connect
        with people who love the park as much as you do.
      </Text>
    </View>
  </View>
);

// ─── FOOTER ──────────────────────────────────────────────
const footerCols = [
  { title: 'Play', links: ['Games', 'Leaderboard', 'Challenges'] },
  { title: 'Connect', links: ['Community', 'Chat', 'Events'] },
  { title: 'You', links: ['Diary', 'Profile', 'Settings'] },
];

const Footer = () => (
  <View style={styles.footer}>
    <Text style={styles.footerBrand}>Parkette</Text>
    <Text style={styles.footerBrandDesc}>
      Your playful home for games, community, and personal journaling. Built with love
      for park enthusiasts everywhere.
    </Text>
    <View style={styles.footerGrid}>
      {footerCols.map((col) => (
        <View key={col.title} style={styles.footerCol}>
          <Text style={styles.footerColTitle}>{col.title.toUpperCase()}</Text>
          {col.links.map((link) => (
            <Text key={link} style={styles.footerLink}>{link}</Text>
          ))}
        </View>
      ))}
    </View>
    <View style={styles.footerBottom}>
      <Text style={styles.footerCopy}>© 2026 Parkette. All rights reserved.</Text>
      <View style={styles.footerSocials}>
        {['𝕏', 'in', 'ig'].map((s) => (
          <View key={s} style={styles.socialDot}>
            <Text style={styles.socialDotText}>{s}</Text>
          </View>
        ))}
      </View>
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

  // ── Navbar
  navbar: {
    backgroundColor: AppColors.blue,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    elevation: 6,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 100,
  },
  navLogo: {
    color: AppColors.lilac,
    fontSize: 24,
    //fontWeight: '800',
    //letterSpacing: 0.5,
    fontFamily: AppFonts.title.fontFamily,
    padding: Spacing.md
  },
  navLinks: {
    flexDirection: 'row',
    gap: 16,
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  navLink: {
    color: AppColors.lilac,
    fontSize: 16,
    //fontWeight: '500',
    //opacity: 0.85,
    fontFamily: AppFonts.title.fontFamily,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginRight: Spacing.sm,
  },
  navLogin: {
    color: AppColors.lilac,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,
  },
  navSignupBtn: {
    backgroundColor: AppColors.lilac,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  navSignupText: {
    color: AppColors.blue,
    fontSize: 16,
    fontFamily: AppFonts.title.fontFamily,
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

  // ── Section shared
  sectionTitle: {
    fontSize: 40,
    color: AppColors.blue,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  sectionDesc: {
    fontSize: 18,
    color: AppColors.blue,
    opacity: 0.65,
    lineHeight: 32,
    marginBottom: Spacing.xl,
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
    fontSize: 32,
    color: AppColors.blue,
    lineHeight: 32,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    fontFamily: AppFonts.body.fontFamily,
  },

  // ── Section 2: Game
  gameSection: {
    backgroundColor: AppColors.lilac,
    padding: Spacing.xl,
    paddingVertical: 48,
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
  borderWidth: 2,
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
  borderWidth: 2,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  transform: [{ translateY: -6 }],
  zIndex: 3,
  elevation: 12,
  shadowColor: AppColors.blue,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
},
cardright: {
  marginTop: 75,
  width: 410,
  height: 260,
  backgroundColor: AppColors.lilac,
  borderRadius: 20,
  borderWidth: 2,
  borderColor: AppColors.blue,
  overflow: 'hidden',
  transform: [{ rotate: '12deg' }, { translateX: -20 }],
  zIndex: 1,
},

gameDesc:{
  marginTop: 75,
   fontSize: 32,
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
  alignItems: 'center',
},

  subtitle:{
    fontSize: 30,
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
  alignItems: 'center',
  paddingBottom: Spacing.md,
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
  marginBottom: Spacing.md,
},
cardCloseBtn: {
  width: 18,
  height: 18,
  borderRadius: 2,
  borderWidth: 1.5,
  borderColor: AppColors.lilac,
  alignItems: 'center',
  justifyContent: 'center',
},
cardCloseBtnText: {
  color: AppColors.lilac,
  fontSize: 9,
  fontFamily: AppFonts.subhead.fontFamily,
},
// Pixel avatar placeholder
avatarPlaceholder: {
  alignItems: 'center',
  marginBottom: Spacing.sm,
},
avatarHead: {
  width: 56,
  height: 56,
  borderRadius: 4,
  backgroundColor: AppColors.blue,
  borderWidth: 2,
  borderColor: AppColors.blue,
},
avatarBody: {
  width: 80,
  height: 30,
  borderRadius: 4,
  backgroundColor: AppColors.blue,
  marginTop: 4,
  opacity: 0.5,
},
impressionName: {
  fontSize: 13,
  fontWeight: '700',
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
  fontSize: 12,
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
  },
  ctaCard: {
    backgroundColor: AppColors.blue,
    borderRadius: 28,
    padding: Spacing.xxl * 2,
    alignItems: 'center',
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

  // ── Footer
  footer: {
    backgroundColor: AppColors.dark,
    padding: Spacing.xl,
    paddingVertical: 48,
  },
  footerBrand: {
    fontSize: 26,
    fontWeight: '900',
    color: AppColors.lilac,
    marginBottom: Spacing.sm,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  footerBrandDesc: {
    fontSize: 13,
    color: AppColors.lilac,
    opacity: 0.5,
    lineHeight: 20,
    marginBottom: Spacing.xxl,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  footerCol: { gap: Spacing.sm },
  footerColTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.lilac,
    opacity: 0.5,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
    fontFamily: AppFonts.subhead.fontFamily,
  },
  footerLink: {
    fontSize: 13,
    color: AppColors.lilac,
    opacity: 0.7,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,184,232,0.1)',
    paddingTop: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerCopy: {
    fontSize: 11,
    color: AppColors.lilac,
    opacity: 0.35,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
  footerSocials: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  socialDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(201,184,232,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialDotText: {
    color: AppColors.lilac,
    fontSize: 11,
    opacity: 0.6,
    fontFamily: AppFonts.bodySmall.fontFamily,
  },
});