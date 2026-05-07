import PFP from "@/assets/svgs/community/pfp.svg";
import Zarf from "@/assets/svgs/community/zarf.svg";
import { AppColors, AppFonts, AppFontSizes, Spacing } from "@/constants/theme";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Footer from "../components/Footer";
import NavBar from "../components/navbar";


export default function CommunityLanding() {
  const { width, height } = useWindowDimensions();  // ← moved inside

  return (
    <ScrollView style={styles.container}>
      <NavBar />
      <View style={[styles.main, { height: height * 0.75 }]}>
        <View style={[styles.zarfContainer, { width, height: height * 0.7 }]}>
          <Zarf width={width} height={height * 0.7} />
          <View style={styles.overlay}>
            <Text style={styles.title}>Let's Connect!</Text>
            <View style={[styles.avatarWrapper, { top: height * 0.06, right: width * 0.18 }]}>
              <PFP />
            </View>
            <View style={styles.buttonsRow}>
              <TouchableOpacity style={[styles.pin, { top: height * 0.06, left: width * 0.26 }]} onPress={() => router.push('/community/avatar')}>
                <Text style={styles.pinText}>Customize</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pin, { top: height * 0.16 }]} onPress={() => router.push('/community/friendsList')}>
                <Text style={styles.pinText}>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pin, { top: height * 0.06, right: width * 0.26 }]} onPress={() => router.push('/community/friendsList')}>
                <Text style={styles.pinText}>Friends List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lilac,
    flexDirection: 'column',
  },
  main: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zarfContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: "10%",
  },
  title: {
    ...AppFonts.title,
    color: AppColors.blue,
    fontSize: 40,
    textAlign: "center",
  },
  avatarWrapper: {
    //position: 'absolute',
    alignItems: "center",
    justifyContent: "center",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  pin: {
    backgroundColor: AppColors.lilac,
    borderWidth: 3,
    borderColor: AppColors.blue,
    borderRadius: 4,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    shadowColor: AppColors.blue,
    shadowOffset: { width: 4, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  pinText: {
    ...AppFonts.body,
    color: AppColors.blue,
    fontSize: AppFontSizes.subhead,
  },
});